const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['art', 'furniture', 'decor', 'fashion', 'other']
  },
  images: [{
    type: String,
    required: true
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'pending'],
    default: 'available'
  },
  condition: {
    type: String,
    enum: ['new', 'like_new', 'good', 'fair'],
    required: true
  },
  ecoCoinsPrice: {
    type: Number,
    default: 0
  },
  tags: [String],
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      default: 'cm'
    }
  },
  weight: Number,
  materials: [String]
}, {
  timestamps: true
});

// Index for better query performance
productSchema.index({ seller: 1, status: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);