const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  oauthCallback
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Dev: log incoming register requests to help debugging
router.post('/register', (req, res, next) => {
  try {
    console.log('Incoming /api/auth/register body keys:', Object.keys(req.body || {}));
  } catch (e) {}
  next();
}, register);
router.post('/login', login);
router.post('/oauth/:provider', oauthCallback);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;

