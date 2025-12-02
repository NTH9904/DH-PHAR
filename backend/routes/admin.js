const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Prescription = require('../models/Prescription');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
router.get('/dashboard', protect, admin, async (req, res, next) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    // Get statistics
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      monthlyOrders,
      lastMonthOrders,
      pendingOrders,
      lowStockProducts,
      pendingPrescriptions,
      monthlyRevenue,
      lastMonthRevenue
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.countDocuments({ 
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } 
      }),
      Order.countDocuments({ status: 'pending' }),
      Product.countDocuments({ stock: { $lt: 20 }, isActive: true }),
      Prescription.countDocuments({ verificationStatus: 'pending' }),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.aggregate([
        { 
          $match: { 
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
            status: { $ne: 'cancelled' }
          } 
        },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ])
    ]);

    // Calculate growth percentages
    const orderGrowth = lastMonthOrders > 0 
      ? ((monthlyOrders - lastMonthOrders) / lastMonthOrders * 100).toFixed(1)
      : 0;

    const revenueGrowth = lastMonthRevenue.length > 0 && monthlyRevenue.length > 0
      ? ((monthlyRevenue[0].total - lastMonthRevenue[0].total) / lastMonthRevenue[0].total * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          growth: '+15' // You can calculate this based on your needs
        },
        products: {
          total: totalProducts,
          lowStock: lowStockProducts
        },
        orders: {
          total: totalOrders,
          monthly: monthlyOrders,
          pending: pendingOrders,
          growth: orderGrowth
        },
        revenue: {
          monthly: monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0,
          growth: revenueGrowth
        },
        prescriptions: {
          pending: pendingPrescriptions
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get sales analytics
// @route   GET /api/admin/analytics/sales
// @access  Private/Admin
router.get('/analytics/sales', protect, admin, async (req, res, next) => {
  try {
    const { period = '7d' } = req.query;
    
    let startDate;
    const endDate = new Date();
    
    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: salesData
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get top selling products
// @route   GET /api/admin/analytics/top-products
// @access  Private/Admin
router.get('/analytics/top-products', protect, admin, async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.subtotal' },
          productName: { $first: '$items.name' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: Number(limit) },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      }
    ]);

    res.json({
      success: true,
      data: topProducts
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get inventory alerts
// @route   GET /api/admin/inventory/alerts
// @access  Private/Admin
router.get('/inventory/alerts', protect, admin, async (req, res, next) => {
  try {
    const lowStockProducts = await Product.find({
      stock: { $lt: 20 },
      isActive: true
    }).select('name stock category price').sort({ stock: 1 });

    const outOfStockProducts = await Product.find({
      stock: 0,
      isActive: true
    }).select('name category price');

    res.json({
      success: true,
      data: {
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update product stock
// @route   PUT /api/admin/inventory/:productId/stock
// @access  Private/Admin
router.put('/inventory/:productId/stock', protect, admin, async (req, res, next) => {
  try {
    const { stock, action = 'set' } = req.body; // action: 'set', 'add', 'subtract'
    
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    switch (action) {
      case 'add':
        product.stock += Number(stock);
        break;
      case 'subtract':
        product.stock = Math.max(0, product.stock - Number(stock));
        break;
      default:
        product.stock = Number(stock);
    }

    await product.save();

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;