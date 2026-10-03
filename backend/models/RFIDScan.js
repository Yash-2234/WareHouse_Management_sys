const mongoose = require('mongoose');

const RFIDScanSchema = new mongoose.Schema({
  rfidTag: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RFIDTag',
    default: null
  },
  scannedValue: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  matchedProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },
  confidence: {
    type: Number,
    required: true,
    default: 0
  },
  readerId: {
    type: String,
    default: 'RFID-GATEWAY-READER-01'
  },
  location: {
    type: String,
    default: 'Main Dock Entrance'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['MATCHED', 'UNKNOWN', 'MISMATCH'],
    default: 'MATCHED'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('RFIDScan', RFIDScanSchema);
