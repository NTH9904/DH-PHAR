const mongoose = require('mongoose');
const User = require('../models/User');

// Dev-only: return basic server & DB status
exports.getStatus = async (req, res, next) => {
  try {
    const readyState = mongoose.connection.readyState;
    res.json({
      success: true,
      nodeEnv: process.env.NODE_ENV || 'development',
      mongooseReadyState: readyState,
      mongodbUri: process.env.MONGODB_URI ? 'set' : 'not-set'
    });
  } catch (error) {
    next(error);
  }
};

// Dev-only: return a safe list/count of users (no passwords)
exports.getUsers = async (req, res, next) => {
  try {
    const count = await User.countDocuments();
    const recent = await User.find({}).sort({ createdAt: -1 }).limit(10).select('email name role createdAt isActive');
    res.json({ success: true, count, recent });
  } catch (error) {
    next(error);
  }
};

// Dev-only: return the most recent user including raw fields (INCLUDING password)
// WARNING: This is for debugging only and is mounted only in non-production.
exports.getLastRawUser = async (req, res, next) => {
  try {
    const user = await User.findOne({}).sort({ createdAt: -1 }).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'No users found' });
    // Convert to plain object and remove sensitive fields that are not needed
    const obj = user.toObject({ getters: true });
    res.json({ success: true, user: obj });
  } catch (error) {
    next(error);
  }
};
