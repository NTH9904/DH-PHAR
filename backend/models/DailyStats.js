const mongoose = require('mongoose');

const dailyStatsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  revenue: {
    type: Number,
    default: 0
  },
  orders: {
    type: Number,
    default: 0
  },
  customers: {
    type: Number,
    default: 0
  },
  newCustomers: {
    type: Number,
    default: 0
  },
  avgOrderValue: {
    type: Number,
    default: 0
  },
  topProducts: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    name: String,
    quantity: Number,
    revenue: Number
  }],
  topCategories: [{
    category: String,
    quantity: Number,
    revenue: Number
  }]
}, {
  timestamps: true
});

// Index for faster queries
dailyStatsSchema.index({ date: -1 });

module.exports = mongoose.model('DailyStats', dailyStatsSchema);