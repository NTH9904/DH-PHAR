const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Order items
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: String, // Snapshot of product name
    price: Number, // Snapshot of price at time of order
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    subtotal: Number
  }],
  // Pricing
  subtotal: {
    type: Number,
    required: true
  },
  shippingFee: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  discountCode: String,
  loyaltyPointsUsed: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  // Delivery address
  deliveryAddress: {
    name: String,
    phone: String,
    address: String,
    ward: String,
    district: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  // Delivery time
  deliveryTime: {
    preferredDate: Date,
    preferredTimeSlot: String, // "morning", "afternoon", "evening"
    estimatedDelivery: Date
  },
  // Payment
  paymentMethod: {
    type: String,
    enum: ['cod', 'bank_transfer', 'vnpay', 'momo', 'zalopay'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  paymentTransactionId: String,
  paymentDate: Date,
  // Order status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled', 'returned'],
    default: 'pending',
    index: true
  },
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String
  }],
  // Prescription
  prescription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription'
  },
  requiresPrescription: {
    type: Boolean,
    default: false
  },
  prescriptionVerified: {
    type: Boolean,
    default: false
  },
  // Shipping
  shippingProvider: {
    type: String,
    enum: ['ghn', 'viettel_post', 'self_delivery']
  },
  trackingNumber: String,
  shippingStatus: String,
  // Notes
  customerNotes: String,
  adminNotes: String,
  // Cancellation
  cancelledAt: Date,
  cancellationReason: String,
  // Delivery confirmation
  deliveredAt: Date,
  deliveryProof: String, // Image URL
  // Reviews
  reviewed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Generate order number
OrderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    this.orderNumber = `DH${year}${month}${day}${String(count + 1).padStart(6, '0')}`;
  }
  
  // Initialize status history
  if (this.statusHistory.length === 0) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      note: 'Đơn hàng được tạo'
    });
  }
  
  next();
});

// Calculate totals
OrderSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  this.total = this.subtotal + this.shippingFee - this.discount;
  return this;
};

module.exports = mongoose.model('Order', OrderSchema);

