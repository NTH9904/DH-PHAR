const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  oauthCallback,
  verifyEmail,
  resendVerification,
  googleCallback,
  facebookCallback,
  forgotPassword,
  resetPassword
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

// Email verification
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', protect, resendVerification);

// Password reset
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Google OAuth
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'] 
}));
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/pages/login.html' }),
  googleCallback
);

// Facebook OAuth
router.get('/facebook', passport.authenticate('facebook', { 
  scope: ['email'] 
}));
router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/pages/login.html' }),
  facebookCallback
);

module.exports = router;

