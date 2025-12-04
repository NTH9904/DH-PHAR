const DailyStats = require('../models/DailyStats');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Calculate and save daily stats
// @route   POST /api/stats/calculate-daily
// @access  Private/Admin
exports.calculateDailyStats = async (req, res, next) => {
  try {
    const { date } = req.body;
    const targetDate = date ? new Date(date) : new Date();
    
    // Set to start of day
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    // Set to end of day
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get orders for the day
    const orders = await Order.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    }).populate('items.product');

    // Calculate basic stats
    const revenue = orders.reduce((sum, order) => sum + (order.totalAmount || order.total || 0), 0);
    const orderCount = orders.length;
    const avgOrderValue = orderCount > 0 ? revenue / orderCount : 0;

    // Get unique customers
    const customerIds = [...new Set(orders.map(order => order.user.toString()))];
    const customers = customerIds.length;

    // Get new customers (registered today)
    const newCustomers = await User.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      role: 'user'
    });

    // Calculate top products
    const productStats = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.product._id.toString();
        if (!productStats[productId]) {
          productStats[productId] = {
            productId: item.product._id,
            name: item.product.name,
            quantity: 0,
            revenue: 0
          };
        }
        productStats[productId].quantity += item.quantity;
        productStats[productId].revenue += item.quantity * item.price;
      });
    });

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Calculate top categories
    const categoryStats = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const category = item.product.category;
        if (!categoryStats[category]) {
          categoryStats[category] = {
            category,
            quantity: 0,
            revenue: 0
          };
        }
        categoryStats[category].quantity += item.quantity;
        categoryStats[category].revenue += item.quantity * item.price;
      });
    });

    const topCategories = Object.values(categoryStats)
      .sort((a, b) => b.revenue - a.revenue);

    // Save or update daily stats
    const dailyStats = await DailyStats.findOneAndUpdate(
      { date: startOfDay },
      {
        date: startOfDay,
        revenue,
        orders: orderCount,
        customers,
        newCustomers,
        avgOrderValue,
        topProducts,
        topCategories
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: dailyStats
    });
  } catch (error) {
    console.error('Error calculating daily stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi tính toán thống kê hàng ngày'
    });
  }
};

// @desc    Get daily stats for date range
// @route   GET /api/stats/daily
// @access  Private/Admin
exports.getDailyStats = async (req, res, next) => {
  try {
    const { startDate, endDate, days = 30 } = req.query;
    
    let start, end;
    
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      end = new Date();
      start = new Date();
      start.setDate(start.getDate() - parseInt(days));
    }
    
    // Set to start/end of day
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const stats = await DailyStats.find({
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting daily stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy thống kê hàng ngày'
    });
  }
};

// @desc    Get current period stats
// @route   GET /api/stats/current
// @access  Private/Admin
exports.getCurrentStats = async (req, res, next) => {
  try {
    const { period = 30 } = req.query;
    const days = parseInt(period);
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get stats for current period
    const currentStats = await DailyStats.find({
      date: { $gte: startDate, $lte: endDate }
    });

    // Get stats for previous period (for comparison)
    const prevEndDate = new Date(startDate);
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - days);
    
    const prevStats = await DailyStats.find({
      date: { $gte: prevStartDate, $lt: prevEndDate }
    });

    // Calculate totals
    const currentTotals = currentStats.reduce((acc, stat) => ({
      revenue: acc.revenue + stat.revenue,
      orders: acc.orders + stat.orders,
      customers: acc.customers + stat.customers,
      newCustomers: acc.newCustomers + stat.newCustomers
    }), { revenue: 0, orders: 0, customers: 0, newCustomers: 0 });

    const prevTotals = prevStats.reduce((acc, stat) => ({
      revenue: acc.revenue + stat.revenue,
      orders: acc.orders + stat.orders,
      customers: acc.customers + stat.customers,
      newCustomers: acc.newCustomers + stat.newCustomers
    }), { revenue: 0, orders: 0, customers: 0, newCustomers: 0 });

    // Calculate changes
    const changes = {
      revenue: prevTotals.revenue > 0 ? ((currentTotals.revenue - prevTotals.revenue) / prevTotals.revenue * 100) : 0,
      orders: prevTotals.orders > 0 ? ((currentTotals.orders - prevTotals.orders) / prevTotals.orders * 100) : 0,
      customers: prevTotals.customers > 0 ? ((currentTotals.customers - prevTotals.customers) / prevTotals.customers * 100) : 0,
      newCustomers: prevTotals.newCustomers > 0 ? ((currentTotals.newCustomers - prevTotals.newCustomers) / prevTotals.newCustomers * 100) : 0
    };

    currentTotals.avgOrderValue = currentTotals.orders > 0 ? currentTotals.revenue / currentTotals.orders : 0;

    res.json({
      success: true,
      data: {
        current: currentTotals,
        changes,
        dailyStats: currentStats
      }
    });
  } catch (error) {
    console.error('Error getting current stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy thống kê hiện tại'
    });
  }
};