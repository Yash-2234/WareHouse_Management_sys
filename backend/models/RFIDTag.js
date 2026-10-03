const mongoose = require('mongoose');

const RFIDTagSchema = new mongoose.Schema({
  tagId: {
    type: String,
    required: true,
    unique: true
  },
  epc: {
    type: String,
    required: [true, 'EPC code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },
  pattern: {
    type: String,
    required: true,
    default: 'GEN2v2-STANDARD-EPC'
  },
  warehouseLocation: {
    type: String,
    default: 'Warehouse Alpha / Section A'
  },
  status: {
    type: String,
    enum: ['Active', 'In-Transit', 'Deallocated'],
    default: 'Active'
  },
  registeredAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('RFIDTag', RFIDTagSchema);
