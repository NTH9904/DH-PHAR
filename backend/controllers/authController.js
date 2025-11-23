const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    // Log incoming register attempt (do not log raw password)
    try { console.log('Register request body keys:', Object.keys(req.body)); } catch (e) {}
    let { name, email, password, phone } = req.body;
    email = (email || '').toString().trim().toLowerCase();
    try { console.log('Register attempt for email:', email); } catch (e) {}

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone
    });

    // Reload the saved user including the password field to verify hashing ran
    try {
      const savedUser = await User.findById(user._id).select('+password');
      console.log(`User registered: ${user._id} - ${user.email}`);
      console.log('Password stored (hashed) present:', !!(savedUser && savedUser.password));
      if (savedUser && savedUser.password) {
        console.log('Hashed password length:', savedUser.password.length);
      }
    } catch (e) {
      console.log('Register verification log failed', e && e.message);
    }

    // Extra check: ensure bcrypt.compare works on the saved hash
    try {
      const bcrypt = require('bcryptjs');
      const savedUser2 = await User.findById(user._id).select('+password');
      if (savedUser2 && savedUser2.password) {
        const cmp = await bcrypt.compare(password, savedUser2.password);
        console.log('Bcrypt compare (register) result:', cmp);
      } else {
        console.log('Bcrypt compare (register): no saved hash to compare');
      }
    } catch (e) {
      console.log('Bcrypt compare (register) failed:', e && e.message);
    }

    // Defensive fallback: if password hash is missing for some reason, hash now and save
    try {
      const reloaded = await User.findById(user._id).select('+password');
      if (!reloaded || !reloaded.password) {
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);
        user.password = hashed;
        await user.save();
        console.log('Fallback: hashed and saved password for user', user._id);
      }
    } catch (e) {
      console.log('Fallback hashing failed:', e && e.message);
    }

    // Generate token
    const token = user.generateToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    let { email, password } = req.body;
    email = (email || '').toString().trim().toLowerCase();

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    try {
      console.log('Login attempt for:', email);
      console.log('User found:', !!user, user ? String(user._id) : 'no-user');
      console.log('Password field present on user doc:', !!(user && user.password));
    } catch (e) {
      console.log('Login debug log failed');
    }

    const passwordMatches = user && user.password ? await user.matchPassword(password) : false;

    try {
      console.log('Password match result:', passwordMatches);
    } catch (e) {
      /* ignore */
    }

    if (!user || !passwordMatches) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Tài khoản đã bị khóa' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = user.generateToken();

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      'healthProfile.dateOfBirth': req.body.dateOfBirth,
      'healthProfile.gender': req.body.gender
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: 'Mật khẩu hiện tại không đúng' });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    OAuth callback (Google/Facebook)
// @route   POST /api/auth/oauth/:provider
// @access  Public
exports.oauthCallback = async (req, res, next) => {
  try {
    const { provider } = req.params;
    const { oauthId, email, name, picture } = req.body;

    let user = await User.findOne({
      $or: [
        { email, oauthProvider: provider },
        { oauthId, oauthProvider: provider }
      ]
    });

    if (user) {
      // Update last login
      user.lastLogin = new Date();
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        oauthId,
        oauthProvider: provider,
        isEmailVerified: true
      });
    }

    const token = user.generateToken();

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

