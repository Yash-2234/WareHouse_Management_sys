const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    unique: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  minStock: {
    type: Number,
    required: true,
    default: 10
  },
  location: {
    type: String,
    required: true,
    default: 'Rack A-01'
  },
  warehouse: {
    type: String,
    required: true,
    default: 'Warehouse Alpha'
  },
  lastMovement: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Inventory', InventorySchema);
