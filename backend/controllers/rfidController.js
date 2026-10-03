const RFIDTag = require('../models/RFIDTag');
const Product = require('../models/Product');
const RFIDScan = require('../models/RFIDScan');
const { matchRFIDPattern } = require('../services/rfidPatternMatcher');
const { ActivityLog } = require('../models/Warehouse');

// @desc    Get all registered RFID tags
// @route   GET /api/rfid
// @access  Private
const getTags = async (req, res, next) => {
  try {
    const { search, status, location } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { epc: { $regex: search, $options: 'i' } },
        { tagId: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;
    if (location) query.warehouseLocation = location;

    const tags = await RFIDTag.find(query)
      .populate('product', 'productName sku category quantity status location warehouse')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tags.length,
      tags
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get RFID tag details by ID
// @route   GET /api/rfid/:id
// @access  Private
const getTagById = async (req, res, next) => {
  try {
    const tag = await RFIDTag.findById(req.params.id).populate('product');
    if (!tag) {
      return res.status(404).json({ success: false, message: 'RFID Tag not found' });
    }
    res.json({ success: true, tag });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new RFID tag
// @route   POST /api/rfid
// @access  Private (Admin, Manager)
const registerTag = async (req, res, next) => {
  try {
    const { epc, productId, pattern, warehouseLocation } = req.body;

    if (!epc) {
      return res.status(400).json({ success: false, message: 'EPC string is required' });
    }

    const cleanEPC = epc.trim().toUpperCase();
    const existing = await RFIDTag.findOne({ epc: cleanEPC });
    if (existing) {
      return res.status(400).json({ success: false, message: `RFID Tag with EPC '${cleanEPC}' is already registered` });
    }

    const tagId = 'TAG-' + Math.floor(100000 + Math.random() * 900000);

    const tag = new RFIDTag({
      tagId,
      epc: cleanEPC,
      pattern: pattern || 'GEN2v2-STANDARD-EPC',
      warehouseLocation: warehouseLocation || 'Warehouse Alpha / Dock A'
    });

    if (productId) {
      const product = await Product.findById(productId);
      if (product) {
        tag.product = product._id;
        product.rfidTag = tag._id;
        await product.save();
      }
    }

    await tag.save();

    await ActivityLog.create({
      user: req.user ? req.user.name : 'System',
      action: 'RFID_REGISTER',
      module: 'RFID Registration',
      description: `Registered RFID tag EPC '${cleanEPC}' (${tagId})`
    });

    res.status(201).json({
      success: true,
      message: 'RFID tag registered successfully',
      tag
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update RFID Tag
// @route   PUT /api/rfid/:id
// @access  Private (Admin, Manager)
const updateTag = async (req, res, next) => {
  try {
    let tag = await RFIDTag.findById(req.params.id);
    if (!tag) {
      return res.status(404).json({ success: false, message: 'RFID tag not found' });
    }

    const { epc, productId, pattern, warehouseLocation, status } = req.body;

    if (epc && epc.toUpperCase() !== tag.epc) {
      const existing = await RFIDTag.findOne({ epc: epc.toUpperCase() });
      if (existing) {
        return res.status(400).json({ success: false, message: `EPC '${epc}' is registered to another tag` });
      }
      tag.epc = epc.toUpperCase();
    }

    if (pattern) tag.pattern = pattern;
    if (warehouseLocation) tag.warehouseLocation = warehouseLocation;
    if (status) tag.status = status;

    if (productId !== undefined) {
      if (productId) {
        const product = await Product.findById(productId);
        if (product) {
          tag.product = product._id;
          product.rfidTag = tag._id;
          await product.save();
        }
      } else {
        if (tag.product) {
          await Product.findByIdAndUpdate(tag.product, { rfidTag: null });
        }
        tag.product = null;
      }
    }

    await tag.save();

    res.json({
      success: true,
      message: 'RFID Tag updated successfully',
      tag
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete RFID Tag
// @route   DELETE /api/rfid/:id
// @access  Private (Admin)
const deleteTag = async (req, res, next) => {
  try {
    const tag = await RFIDTag.findById(req.params.id);
    if (!tag) {
      return res.status(404).json({ success: false, message: 'RFID tag not found' });
    }

    if (tag.product) {
      await Product.findByIdAndUpdate(tag.product, { rfidTag: null });
    }

    await RFIDTag.findByIdAndDelete(req.params.id);

    await ActivityLog.create({
      user: req.user ? req.user.name : 'System',
      action: 'RFID_DELETE',
      module: 'RFID Tag Management',
      description: `Deleted RFID Tag '${tag.epc}'`
    });

    res.json({ success: true, message: 'RFID Tag deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Process RFID Scan simulation & pattern match engine
// @route   POST /api/rfid/scan OR /api/rfid/match
// @access  Private
const scanRFID = async (req, res, next) => {
  try {
    const { scannedValue, epc, readerId } = req.body;
    const valueToMatch = scannedValue || epc;

    if (!valueToMatch) {
      return res.status(400).json({ success: false, message: 'scannedValue or epc parameter is required' });
    }

    const matchResult = await matchRFIDPattern(valueToMatch, readerId);

    await ActivityLog.create({
      user: req.user ? req.user.name : 'RFID Scanner',
      action: 'RFID_SCAN',
      module: 'RFID Reader Simulation',
      description: `Scanned EPC '${valueToMatch}': ${matchResult.status} (Confidence: ${matchResult.confidence}%)`
    });

    res.json({
      success: true,
      data: matchResult
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent scan logs
// @route   GET /api/rfid/scans
// @access  Private
const getScans = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const scans = await RFIDScan.find()
      .populate('rfidTag', 'tagId epc status')
      .populate('matchedProduct', 'productName sku category quantity status location warehouse')
      .sort({ timestamp: -1 })
      .limit(limit);

    res.json({
      success: true,
      count: scans.length,
      scans
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTags,
  getTagById,
  registerTag,
  updateTag,
  deleteTag,
  scanRFID,
  getScans
};
