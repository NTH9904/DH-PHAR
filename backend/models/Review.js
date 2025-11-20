const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    index: true
  },
  title: String,
  comment: String,
  // Verified purchase
  verifiedPurchase: {
    type: Boolean,
    default: false
  },
  // Helpful votes
  helpfulCount: {
    type: Number,
    default: 0
  },
  // Status
  isApproved: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// One review per user per product
ReviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Update product rating when review is saved
ReviewSchema.post('save', async function() {
  const Product = mongoose.model('Product');
  const reviews = await mongoose.model('Review').find({ 
    product: this.product,
    isApproved: true,
    isDeleted: false
  });
  
  if (reviews.length > 0) {
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(this.product, {
      'ratings.average': avgRating,
      'ratings.count': reviews.length
    });
  }
});

module.exports = mongoose.model('Review', ReviewSchema);

