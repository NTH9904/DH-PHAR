const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
    sparse: true // Allow null for guest carts
  },
  sessionId: {
    type: String,
    index: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Cart warnings
  warnings: [{
    type: {
      type: String,
      enum: ['interaction', 'prescription_required', 'stock_low', 'allergy']
    },
    message: String,
    productId: mongoose.Schema.Types.ObjectId
  }],
  expiresAt: {
    type: Date,
    default: function() {
      const date = new Date();
      date.setDate(date.getDate() + 30); // 30 days
      return date;
    },
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Cart', CartSchema);

