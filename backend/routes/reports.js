const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
    getKeyMetrics,
    getDailyRevenue,
    getTopProducts,
    getCustomerAnalytics
} = require('../controllers/reportsController');

// All routes require admin authentication
router.use(protect);
router.use(admin);

// Get key metrics (revenue, orders, customers, avg order value)
router.post('/metrics', getKeyMetrics);

// Get daily revenue data for charts
router.post('/daily-revenue', getDailyRevenue);

// Get top selling products
router.post('/top-products', getTopProducts);

// Get customer analytics
router.post('/customer-analytics', getCustomerAnalytics);

module.exports = router;