const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true
  },
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Industrial Bearings',
      'Steel Components',
      'Electrical Motors',
      'Hydraulic Pumps',
      'Safety Equipment',
      'Packaging Materials',
      'Machine Parts',
      'Fasteners & Hardware'
    ]
  },
  description: {
    type: String,
    default: ''
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
  unit: {
    type: String,
    default: 'Units'
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
  rfidTag: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RFIDTag',
    default: null
  },
  status: {
    type: String,
    enum: ['In Stock', 'Low Stock', 'Out of Stock', 'Reserved'],
    default: 'In Stock'
  }
}, {
  timestamps: true
});

// Middleware to calculate status dynamically before save
ProductSchema.pre('save', function (next) {
  if (this.quantity === 0) {
    this.status = 'Out of Stock';
  } else if (this.quantity <= this.minStock) {
    this.status = 'Low Stock';
  } else if (this.status !== 'Reserved') {
    this.status = 'In Stock';
  }
  next();
});

module.exports = mongoose.model('Product', ProductSchema);
