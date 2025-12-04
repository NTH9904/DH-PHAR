const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// Get key metrics (revenue, orders, customers, avg order value)
const getKeyMetrics = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp ngày bắt đầu và kết thúc'
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        
        console.log('Getting metrics for period:', start, 'to', end);

        // Current period metrics
        const currentOrders = await Order.find({
            createdAt: { $gte: start, $lte: end },
            status: { $ne: 'cancelled' }
        }).catch(err => {
            console.log('Order query error:', err);
            return [];
        });

        const currentUsers = await User.find({
            createdAt: { $gte: start, $lte: end },
            role: 'customer'
        }).catch(err => {
            console.log('User query error:', err);
            return [];
        });

        // Calculate current metrics
        const totalRevenue = currentOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        const totalOrders = currentOrders.length;
        const newCustomers = currentUsers.length;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        console.log('Calculated metrics:', { totalRevenue, totalOrders, newCustomers, avgOrderValue });

        res.json({
            success: true,
            data: {
                totalRevenue,
                totalOrders,
                newCustomers,
                avgOrderValue,
                revenueChange: Math.random() * 20 - 10, // Mock change for now
                ordersChange: Math.random() * 20 - 10,
                customersChange: Math.random() * 20 - 10,
                avgChange: Math.random() * 20 - 10
            }
        });

    } catch (error) {
        console.error('Error getting key metrics:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy dữ liệu thống kê',
            error: error.message
        });
    }
};

// Get daily revenue data
const getDailyRevenue = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp ngày bắt đầu và kết thúc'
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        console.log('Getting daily revenue for period:', start, 'to', end);

        // Generate mock daily data for now
        const result = [];
        const currentDate = new Date(start);
        
        while (currentDate <= end) {
            result.push({
                date: new Date(currentDate).toISOString(),
                revenue: Math.floor(Math.random() * 2000000) + 500000,
                orders: Math.floor(Math.random() * 20) + 5,
                newCustomers: Math.floor(Math.random() * 5) + 1
            });
            
            currentDate.setDate(currentDate.getDate() + 1);
        }

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error getting daily revenue:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy dữ liệu doanh thu theo ngày',
            error: error.message
        });
    }
};

// Get top selling products
const getTopProducts = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp ngày bắt đầu và kết thúc'
            });
        }

        console.log('Getting top products for period:', startDate, 'to', endDate);

        // Generate mock top products data for now
        const products = [
            'Paracetamol 500mg',
            'Vitamin C 1000mg',
            'Amoxicillin 250mg',
            'Ibuprofen 400mg',
            'Omeprazole 20mg',
            'Cetirizine 10mg',
            'Metformin 500mg',
            'Aspirin 100mg',
            'Loratadine 10mg',
            'Simvastatin 20mg'
        ];

        const topProducts = products.map((name, index) => ({
            productName: name,
            quantity: Math.floor(Math.random() * 100) + 50 - (index * 5),
            revenue: Math.floor(Math.random() * 5000000) + 1000000 - (index * 200000)
        })).sort((a, b) => b.quantity - a.quantity);

        res.json({
            success: true,
            data: topProducts
        });

    } catch (error) {
        console.error('Error getting top products:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy dữ liệu sản phẩm bán chạy',
            error: error.message
        });
    }
};

// Get customer analytics
const getCustomerAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp ngày bắt đầu và kết thúc'
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Get customer statistics
        const [totalCustomers, newCustomers, returningCustomers] = await Promise.all([
            User.countDocuments({ role: 'customer' }),
            User.countDocuments({
                role: 'customer',
                createdAt: { $gte: start, $lte: end }
            }),
            Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: start, $lte: end },
                        status: { $ne: 'cancelled' }
                    }
                },
                {
                    $group: {
                        _id: '$user',
                        orderCount: { $sum: 1 }
                    }
                },
                {
                    $match: { orderCount: { $gt: 1 } }
                },
                {
                    $count: 'returningCustomers'
                }
            ])
        ]);

        const returningCount = returningCustomers.length > 0 ? returningCustomers[0].returningCustomers : 0;

        res.json({
            success: true,
            data: {
                totalCustomers,
                newCustomers,
                returningCustomers: returningCount,
                retentionRate: newCustomers > 0 ? (returningCount / newCustomers) * 100 : 0
            }
        });

    } catch (error) {
        console.error('Error getting customer analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy dữ liệu phân tích khách hàng'
        });
    }
};

module.exports = {
    getKeyMetrics,
    getDailyRevenue,
    getTopProducts,
    getCustomerAnalytics
};