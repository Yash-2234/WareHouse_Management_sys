const mongoose = require('mongoose');

const ProductMovementSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  rfidTag: {
    type: String,
    default: 'N/A'
  },
  fromLocation: {
    type: String,
    required: true
  },
  toLocation: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  movementType: {
    type: String,
    enum: ['Internal Transfer', 'Dispatch Inbound', 'Dispatch Outbound', 'Rack Redistribution'],
    default: 'Internal Transfer'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pathHistory: {
    type: [String],
    default: []
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ProductMovement', ProductMovementSchema);
