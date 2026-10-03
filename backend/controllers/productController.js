const Product = require('../models/Product');
const RFIDTag = require('../models/RFIDTag');
const Inventory = require('../models/Inventory');
const { ActivityLog } = require('../models/Warehouse');

// @desc    Get all products with filtering & search
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res, next) => {
  try {
    const { search, category, status, warehouse } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { productId: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) query.category = category;
    if (status) query.status = status;
    if (warehouse) query.warehouse = warehouse;

    const products = await Product.find(query)
      .populate('rfidTag', 'tagId epc pattern status')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Private
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('rfidTag');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin, Manager)
const createProduct = async (req, res, next) => {
  try {
    const {
      productName,
      sku,
      category,
      description,
      quantity,
      minStock,
      unit,
      location,
      warehouse,
      rfidTagId
    } = req.body;

    const existingSku = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingSku) {
      return res.status(400).json({ success: false, message: `SKU '${sku}' already exists` });
    }

    const productId = 'PRD-' + Math.floor(100000 + Math.random() * 900000);

    const product = new Product({
      productId,
      productName,
      sku,
      category,
      description,
      quantity: Number(quantity) || 0,
      minStock: Number(minStock) || 10,
      unit: unit || 'Units',
      location: location || 'Rack A-01',
      warehouse: warehouse || 'Warehouse Alpha'
    });

    if (rfidTagId) {
      const rfid = await RFIDTag.findById(rfidTagId);
      if (rfid) {
        product.rfidTag = rfid._id;
        rfid.product = product._id;
        await rfid.save();
      }
    }

    await product.save();

    // Create corresponding Inventory record
    await Inventory.create({
      product: product._id,
      quantity: product.quantity,
      minStock: product.minStock,
      location: product.location,
      warehouse: product.warehouse
    });

    await ActivityLog.create({
      user: req.user ? req.user.name : 'System',
      action: 'PRODUCT_CREATE',
      module: 'Product Management',
      description: `Created product '${product.productName}' (SKU: ${product.sku}) with quantity ${product.quantity}`
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin, Manager)
const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const {
      productName,
      sku,
      category,
      description,
      quantity,
      minStock,
      unit,
      location,
      warehouse,
      rfidTagId
    } = req.body;

    if (sku && sku.toUpperCase() !== product.sku) {
      const existingSku = await Product.findOne({ sku: sku.toUpperCase() });
      if (existingSku) {
        return res.status(400).json({ success: false, message: `SKU '${sku}' is taken by another product` });
      }
      product.sku = sku;
    }

    if (productName) product.productName = productName;
    if (category) product.category = category;
    if (description !== undefined) product.description = description;
    if (quantity !== undefined) product.quantity = Number(quantity);
    if (minStock !== undefined) product.minStock = Number(minStock);
    if (unit) product.unit = unit;
    if (location) product.location = location;
    if (warehouse) product.warehouse = warehouse;

    if (rfidTagId !== undefined) {
      if (rfidTagId) {
        const rfid = await RFIDTag.findById(rfidTagId);
        if (rfid) {
          product.rfidTag = rfid._id;
          rfid.product = product._id;
          await rfid.save();
        }
      } else {
        if (product.rfidTag) {
          await RFIDTag.findByIdAndUpdate(product.rfidTag, { product: null });
        }
        product.rfidTag = null;
      }
    }

    await product.save();

    // Update Inventory record
    await Inventory.findOneAndUpdate(
      { product: product._id },
      {
        quantity: product.quantity,
        minStock: product.minStock,
        location: product.location,
        warehouse: product.warehouse,
        lastMovement: new Date()
      },
      { upsert: true }
    );

    await ActivityLog.create({
      user: req.user ? req.user.name : 'System',
      action: 'PRODUCT_UPDATE',
      module: 'Product Management',
      description: `Updated product '${product.productName}' (SKU: ${product.sku})`
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.rfidTag) {
      await RFIDTag.findByIdAndUpdate(product.rfidTag, { product: null });
    }

    await Inventory.deleteOne({ product: product._id });
    await Product.findByIdAndDelete(req.params.id);

    await ActivityLog.create({
      user: req.user ? req.user.name : 'System',
      action: 'PRODUCT_DELETE',
      module: 'Product Management',
      description: `Deleted product '${product.productName}' (${product.sku})`
    });

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
