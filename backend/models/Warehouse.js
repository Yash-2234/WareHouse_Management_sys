const mongoose = require('mongoose');

const WarehouseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  address: {
    type: String,
    default: 'Industrial Zone 4'
  },
  capacity: {
    type: Number,
    required: true,
    default: 10000
  },
  currentStockCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Active', 'Maintenance', 'Full'],
    default: 'Active'
  }
}, { timestamps: true });

const LocationSchema = new mongoose.Schema({
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse'
  },
  warehouseName: {
    type: String,
    default: 'Warehouse Alpha'
  },
  zone: {
    type: String,
    required: true
  },
  rack: {
    type: String,
    required: true
  },
  bin: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  isOccupied: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const ActivityLogSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    default: 'System'
  },
  action: {
    type: String,
    required: true
  },
  module: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1'
  }
}, { timestamps: true });

module.exports = {
  Warehouse: mongoose.model('Warehouse', WarehouseSchema),
  Location: mongoose.model('Location', LocationSchema),
  ActivityLog: mongoose.model('ActivityLog', ActivityLogSchema)
};
