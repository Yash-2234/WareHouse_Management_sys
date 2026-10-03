const mongoose = require('mongoose');

const InventoryTransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  rfid: {
    type: String,
    default: 'N/A'
  },
  type: {
    type: String,
    enum: ['STOCK_IN', 'STOCK_OUT', 'TRANSFER', 'ADJUSTMENT', 'RFID_SCAN'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  previousQuantity: {
    type: Number,
    required: true
  },
  newQuantity: {
    type: Number,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  location: {
    type: String,
    default: 'Warehouse Alpha'
  },
  remarks: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('InventoryTransaction', InventoryTransactionSchema);
