const ProductMovement = require('../models/ProductMovement');

// @desc    Get movement history
// @route   GET /api/movements
// @access  Private
const getMovements = async (req, res, next) => {
  try {
    const movements = await ProductMovement.find()
      .populate('product', 'productName sku category location warehouse')
      .populate('user', 'name role')
      .sort({ timestamp: -1 });

    res.json({
      success: true,
      count: movements.length,
      movements
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMovements
};
