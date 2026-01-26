const mongoose = require('mongoose');

const wasteRateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Waste name is required'],
    unique: true,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price per unit is required'],
    min: 0
  },
  unit: {
    type: String,
    default: 'kg',
    trim: true
  },
  category: {
    type: String,
    enum: ['Paper', 'Plastic', 'Metal', 'Glass', 'E-Waste', 'Other', 'Organic'],
    default: 'Other'
  },
  description: {
    type: String,
    trim: true
  },
  icon: {
    type: String,
    default: 'Recycle' // Frontend icon name
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WasteRate', wasteRateSchema);
