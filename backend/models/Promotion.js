const mongoose = require('mongoose');

const PromotionSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y'],
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  // Conditions
  minPurchaseAmount: Number,
  maxDiscountAmount: Number,
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  applicableCategories: [String],
  // Usage limits
  maxUses: Number, // Total uses
  maxUsesPerUser: {
    type: Number,
    default: 1
  },
  usedCount: {
    type: Number,
    default: 0
  },
  // Validity
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  // Flash sale
  isFlashSale: {
    type: Boolean,
    default: false
  },
  flashSaleStart: Date,
  flashSaleEnd: Date
}, {
  timestamps: true
});

// Check if promotion is valid
PromotionSchema.methods.isValid = function() {
  const now = new Date();
  return this.isActive &&
         this.startDate <= now &&
         this.endDate >= now &&
         (!this.maxUses || this.usedCount < this.maxUses);
};

module.exports = mongoose.model('Promotion', PromotionSchema);

