const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  calculateDailyStats,
  getDailyStats,
  getCurrentStats
} = require('../controllers/statsController');

// All routes require admin authentication
router.use(protect);
router.use(admin);

router.post('/calculate-daily', calculateDailyStats);
router.get('/daily', getDailyStats);
router.get('/current', getCurrentStats);

module.exports = router;