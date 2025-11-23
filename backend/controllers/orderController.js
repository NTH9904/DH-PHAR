const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Promotion = require('../models/Promotion');
const User = require('../models/User');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const {
      items,
      deliveryAddress,
      deliveryTime,
      paymentMethod,
      discountCode,
      loyaltyPointsUsed,
      customerNotes,
      prescriptionId
    } = req.body;

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng trống' });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return res.status(404).json({ message: `Sản phẩm ${item.productId} không tồn tại` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Sản phẩm ${product.name} không đủ hàng` });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        subtotal: itemTotal
      });

      // Update stock
      product.stock -= item.quantity;
      product.salesCount += item.quantity;
      await product.save();
    }

    // Calculate shipping fee (simplified)
    const shippingFee = 30000; // 30,000 VND default

    // Apply discount code
    let discount = 0;
    if (discountCode) {
      const promotion = await Promotion.findOne({ code: discountCode.toUpperCase() });
      if (promotion && promotion.isValid()) {
        if (promotion.type === 'percentage') {
          discount = (subtotal * promotion.value) / 100;
          if (promotion.maxDiscountAmount) {
            discount = Math.min(discount, promotion.maxDiscountAmount);
          }
        } else if (promotion.type === 'fixed_amount') {
          discount = promotion.value;
        }
        promotion.usedCount += 1;
        await promotion.save();
      }
    }

    // Apply loyalty points
    let loyaltyDiscount = 0;
    if (loyaltyPointsUsed > 0) {
      const user = await User.findById(req.user.id);
      if (user.loyaltyPoints >= loyaltyPointsUsed) {
        loyaltyDiscount = loyaltyPointsUsed * 100; // 1 point = 100 VND
        user.loyaltyPoints -= loyaltyPointsUsed;
        await user.save();
      }
    }

    const total = subtotal + shippingFee - discount - loyaltyDiscount;

    // Check for prescription requirement
    const requiresPrescription = orderItems.some(item => {
      const product = items.find(i => i.productId === item.product.toString());
      return product && product.requiresPrescription;
    });

    // Create order
    // Ensure orderNumber exists (defensive - in case model hooks didn't run)
    if (!req.body.orderNumber) {
      try {
        const count = await Order.countDocuments();
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        req.body.orderNumber = `DH${year}${month}${day}${String(count + 1).padStart(6, '0')}`;
      } catch (genErr) {
        // fallback to timestamp-based id to avoid blocking order creation
        req.body.orderNumber = `DH${Date.now()}`;
      }
    }

    // Temporary debug logging to diagnose missing orderNumber issue
    try {
      console.log('Creating order - incoming req.body:', JSON.stringify(req.body));
    } catch (e) {
      console.log('Creating order - could not stringify req.body');
    }

    const createPayload = {
      orderNumber: req.body.orderNumber,
      user: req.user.id,
      items: orderItems,
      subtotal,
      shippingFee,
      discount: discount + loyaltyDiscount,
      discountCode,
      loyaltyPointsUsed: loyaltyDiscount > 0 ? loyaltyPointsUsed : 0,
      total,
      deliveryAddress,
      deliveryTime,
      paymentMethod,
      requiresPrescription,
      prescription: prescriptionId,
      customerNotes
    };

    try {
      console.log('Creating order - payload:', JSON.stringify(createPayload));
    } catch (e) {
      console.log('Creating order - could not stringify createPayload');
    }

    const order = await Order.create(createPayload);

    // Clear cart
    await Cart.findOneAndDelete({ user: req.user.id });

    // Add loyalty points (1% of order value)
    const user = await User.findById(req.user.id);
    const pointsEarned = Math.floor(total / 100);
    user.loyaltyPoints += pointsEarned;
    await user.save();

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images slug')
      .populate('prescription');

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Check if user owns this order or is admin
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Đơn hàng chuyển sang trạng thái: ${status}`
    });

    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền hủy đơn hàng này' });
    }

    // Only allow cancellation if order is pending or confirmed
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ message: 'Không thể hủy đơn hàng ở trạng thái này' });
    }

    // Restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        product.salesCount -= item.quantity;
        await product.save();
      }
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = reason;
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: reason || 'Khách hàng hủy đơn hàng'
    });

    await order.save();

    res.json({
      success: true,
      message: 'Hủy đơn hàng thành công',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark order as paid (simulate payment callback)
// @route   PUT /api/orders/:id/pay
// @access  Private
exports.payOrder = async (req, res, next) => {
  try {
    const { transactionId } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Check ownership
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền cập nhật đơn hàng này' });
    }

    order.paymentStatus = 'paid';
    order.paymentTransactionId = transactionId || `SIMULATED-${Date.now()}`;
    order.paymentDate = new Date();
    order.status = 'confirmed';
    order.statusHistory.push({
      status: 'confirmed',
      timestamp: new Date(),
      note: 'Thanh toán hoàn tất'
    });

    await order.save();

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      count: orders.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

