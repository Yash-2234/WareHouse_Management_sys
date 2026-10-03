const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');
const ProductMovement = require('../models/ProductMovement');
const { ActivityLog } = require('../models/Warehouse');

// Helper to generate transaction ID
const genTxId = (type) => {
  const prefix = type.substring(0, 3);
  return `${prefix}-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
};

// @desc    Get complete inventory list
// @route   GET /api/inventory
// @access  Private
const getInventory = async (req, res, next) => {
  try {
    const { search, warehouse, location, status } = req.query;

    const products = await Product.find()
      .populate('rfidTag', 'tagId epc pattern')
      .sort({ updatedAt: -1 });

    let inventoryList = products.map(p => ({
      _id: p._id,
      product: p,
      sku: p.sku,
      rfidTag: p.rfidTag ? p.rfidTag.epc : 'Unassigned',
      quantity: p.quantity,
      minStock: p.minStock,
      location: p.location,
      warehouse: p.warehouse,
      status: p.status,
      updatedAt: p.updatedAt
    }));

    if (search) {
      const q = search.toLowerCase();
      inventoryList = inventoryList.filter(item =>
        item.product.productName.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.rfidTag.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q)
      );
    }

    if (warehouse) {
      inventoryList = inventoryList.filter(i => i.warehouse === warehouse);
    }
    if (status) {
      inventoryList = inventoryList.filter(i => i.status === status);
    }

    // Get recent transactions
    const recentTransactions = await InventoryTransaction.find()
      .populate('product', 'productName sku category')
      .populate('user', 'name role')
      .sort({ date: -1 })
      .limit(20);

    res.json({
      success: true,
      count: inventoryList.length,
      inventory: inventoryList,
      recentTransactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Stock In (Increase Inventory)
// @route   POST /api/inventory/stock-in
// @access  Private
const stockIn = async (req, res, next) => {
  try {
    const { productId, quantity, location, remarks } = req.body;

    const qtyToAdd = Number(quantity);
    if (!qtyToAdd || qtyToAdd <= 0) {
      return res.status(400).json({ success: false, message: 'Valid positive stock quantity is required' });
    }

    const product = await Product.findById(productId).populate('rfidTag');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const prevQty = product.quantity;
    const newQty = prevQty + qtyToAdd;

    product.quantity = newQty;
    if (location) product.location = location;
    await product.save();

    await Inventory.findOneAndUpdate(
      { product: product._id },
      { quantity: newQty, location: product.location, lastMovement: new Date() },
      { upsert: true }
    );

    const tx = await InventoryTransaction.create({
      transactionId: genTxId('IN'),
      product: product._id,
      rfid: product.rfidTag ? product.rfidTag.epc : 'N/A',
      type: 'STOCK_IN',
      quantity: qtyToAdd,
      previousQuantity: prevQty,
      newQuantity: newQty,
      user: req.user ? req.user._id : null,
      location: product.location,
      remarks: remarks || `Inbound stock added (+${qtyToAdd} ${product.unit})`
    });

    await ActivityLog.create({
      user: req.user ? req.user.name : 'System',
      action: 'STOCK_IN',
      module: 'Inventory Management',
      description: `Stock In: +${qtyToAdd} units for '${product.productName}' (${product.sku}). New balance: ${newQty}`
    });

    res.json({
      success: true,
      message: `Successfully added ${qtyToAdd} units to ${product.productName}`,
      product,
      transaction: tx
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Stock Out (Decrease Inventory)
// @route   POST /api/inventory/stock-out
// @access  Private
const stockOut = async (req, res, next) => {
  try {
    const { productId, quantity, remarks } = req.body;

    const qtyToRemove = Number(quantity);
    if (!qtyToRemove || qtyToRemove <= 0) {
      return res.status(400).json({ success: false, message: 'Valid positive stock quantity is required' });
    }

    const product = await Product.findById(productId).populate('rfidTag');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.quantity < qtyToRemove) {
      return res.status(400).json({
        success: false,
        message: `Insufficient inventory! Available: ${product.quantity}, Requested: ${qtyToRemove}`
      });
    }

    const prevQty = product.quantity;
    const newQty = prevQty - qtyToRemove;

    product.quantity = newQty;
    await product.save();

    await Inventory.findOneAndUpdate(
      { product: product._id },
      { quantity: newQty, lastMovement: new Date() },
      { upsert: true }
    );

    const tx = await InventoryTransaction.create({
      transactionId: genTxId('OUT'),
      product: product._id,
      rfid: product.rfidTag ? product.rfidTag.epc : 'N/A',
      type: 'STOCK_OUT',
      quantity: qtyToRemove,
      previousQuantity: prevQty,
      newQuantity: newQty,
      user: req.user ? req.user._id : null,
      location: product.location,
      remarks: remarks || `Outbound stock removed (-${qtyToRemove} ${product.unit})`
    });

    await ActivityLog.create({
      user: req.user ? req.user.name : 'System',
      action: 'STOCK_OUT',
      module: 'Inventory Management',
      description: `Stock Out: -${qtyToRemove} units for '${product.productName}' (${product.sku}). Remaining: ${newQty}`
    });

    res.json({
      success: true,
      message: `Successfully deducted ${qtyToRemove} units from ${product.productName}`,
      product,
      transaction: tx
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Transfer Inventory Location
// @route   POST /api/inventory/transfer
// @access  Private
const transferInventory = async (req, res, next) => {
  try {
    const { productId, fromLocation, toLocation, quantity, remarks } = req.body;

    if (!toLocation) {
      return res.status(400).json({ success: false, message: 'Destination location (toLocation) is required' });
    }

    const product = await Product.findById(productId).populate('rfidTag');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const transferQty = Number(quantity) || product.quantity;
    const origin = fromLocation || product.location;

    product.location = toLocation;
    await product.save();

    await Inventory.findOneAndUpdate(
      { product: product._id },
      { location: toLocation, lastMovement: new Date() }
    );

    const tx = await InventoryTransaction.create({
      transactionId: genTxId('TRF'),
      product: product._id,
      rfid: product.rfidTag ? product.rfidTag.epc : 'N/A',
      type: 'TRANSFER',
      quantity: transferQty,
      previousQuantity: product.quantity,
      newQuantity: product.quantity,
      user: req.user ? req.user._id : null,
      location: toLocation,
      remarks: remarks || `Location transfer from ${origin} to ${toLocation}`
    });

    await ProductMovement.create({
      product: product._id,
      rfidTag: product.rfidTag ? product.rfidTag.epc : 'N/A',
      fromLocation: origin,
      toLocation,
      quantity: transferQty,
      movementType: 'Internal Transfer',
      user: req.user ? req.user._id : null,
      pathHistory: [origin, 'Transit Area', toLocation]
    });

    await ActivityLog.create({
      user: req.user ? req.user.name : 'System',
      action: 'STOCK_TRANSFER',
      module: 'Inventory Management',
      description: `Transferred '${product.productName}' from ${origin} -> ${toLocation}`
    });

    res.json({
      success: true,
      message: `Product relocated from ${origin} to ${toLocation}`,
      product,
      transaction: tx
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Adjust Inventory Quantity
// @route   POST /api/inventory/adjust
// @access  Private (Admin, Manager)
const adjustInventory = async (req, res, next) => {
  try {
    const { productId, newQuantity, remarks } = req.body;

    const targetQty = Number(newQuantity);
    if (targetQty === undefined || targetQty < 0) {
      return res.status(400).json({ success: false, message: 'Valid non-negative newQuantity is required' });
    }

    const product = await Product.findById(productId).populate('rfidTag');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const prevQty = product.quantity;
    const diff = targetQty - prevQty;

    product.quantity = targetQty;
    await product.save();

    await Inventory.findOneAndUpdate(
      { product: product._id },
      { quantity: targetQty, lastMovement: new Date() }
    );

    const tx = await InventoryTransaction.create({
      transactionId: genTxId('ADJ'),
      product: product._id,
      rfid: product.rfidTag ? product.rfidTag.epc : 'N/A',
      type: 'ADJUSTMENT',
      quantity: Math.abs(diff),
      previousQuantity: prevQty,
      newQuantity: targetQty,
      user: req.user ? req.user._id : null,
      location: product.location,
      remarks: remarks || `Audit count adjustment: ${prevQty} -> ${targetQty}`
    });

    await ActivityLog.create({
      user: req.user ? req.user.name : 'System',
      action: 'STOCK_ADJUSTMENT',
      module: 'Inventory Management',
      description: `Adjusted inventory count for '${product.productName}': ${prevQty} -> ${targetQty}`
    });

    res.json({
      success: true,
      message: `Stock level adjusted to ${targetQty} for ${product.productName}`,
      product,
      transaction: tx
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventory,
  stockIn,
  stockOut,
  transferInventory,
  adjustInventory
};
