const mongoose = require('mongoose');
require('dotenv').config();

const DailyStats = require('../backend/models/DailyStats');
const Order = require('../backend/models/Order');
const User = require('../backend/models/User');
const Product = require('../backend/models/Product');

async function calculateDailyStats(targetDate = new Date()) {
  try {
    // Set to start of day
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    // Set to end of day
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    console.log(`📊 Calculating stats for ${startOfDay.toDateString()}...`);

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

    console.log(`✅ Stats calculated successfully:`);
    console.log(`   💰 Revenue: ${revenue.toLocaleString('vi-VN')} đ`);
    console.log(`   📦 Orders: ${orderCount}`);
    console.log(`   👥 Customers: ${customers}`);
    console.log(`   🆕 New customers: ${newCustomers}`);
    console.log(`   💵 Avg order value: ${avgOrderValue.toLocaleString('vi-VN')} đ`);
    console.log(`   🏆 Top products: ${topProducts.length}`);
    console.log(`   📊 Top categories: ${topCategories.length}\n`);

    return dailyStats;
  } catch (error) {
    console.error('❌ Error calculating daily stats:', error);
    throw error;
  }
}

async function calculateRangeStats(days = 30) {
  try {
    console.log(`📊 Calculating stats for last ${days} days...\n`);
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const promises = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      promises.push(calculateDailyStats(new Date(currentDate)));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    await Promise.all(promises);
    console.log(`✅ All stats calculated successfully for ${days} days!`);
  } catch (error) {
    console.error('❌ Error calculating range stats:', error);
    throw error;
  }
}

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📊 Connected to MongoDB for stats calculation\n');

    const args = process.argv.slice(2);
    const command = args[0];

    if (command === 'range') {
      const days = parseInt(args[1]) || 30;
      await calculateRangeStats(days);
    } else if (command === 'date') {
      const dateStr = args[1];
      const targetDate = dateStr ? new Date(dateStr) : new Date();
      await calculateDailyStats(targetDate);
    } else {
      // Default: calculate today's stats
      await calculateDailyStats();
    }

    console.log('\n🎉 Stats calculation completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { calculateDailyStats, calculateRangeStats };