const User = require('../models/User');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    console.log('=== REGISTER REQUEST START ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { name, email, password, phone } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      console.log('❌ Validation failed: Missing required fields');
      return res.status(400).json({ 
        success: false,
        message: 'Vui lòng nhập đầy đủ: tên, email và mật khẩu' 
      });
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Validation failed: Invalid email format');
      return res.status(400).json({ 
        success: false,
        message: 'Email không hợp lệ' 
      });
    }

    // Validate password length
    if (password.length < 6) {
      console.log('❌ Validation failed: Password too short');
      return res.status(400).json({ 
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự' 
      });
    }

    // Normalize email
    const normalizedEmail = email.toString().trim().toLowerCase();
    console.log('📧 Normalized email:', normalizedEmail);

    // Check if user already exists
    console.log('🔍 Checking if user exists...');
    const existingUser = await User.findOne({ email: normalizedEmail });
    
    if (existingUser) {
      console.log('❌ User already exists:', existingUser._id);
      return res.status(400).json({ 
        success: false,
        message: 'Email đã được sử dụng' 
      });
    }
    console.log('✅ Email available');

    // Create user data
    const userData = {
      name: name.trim(),
      email: normalizedEmail,
      password: password,
      phone: phone ? phone.trim() : undefined
    };

    console.log('💾 Creating user in database...');
    console.log('User data (without password):', {
      name: userData.name,
      email: userData.email,
      phone: userData.phone
    });

    // Create user - Mongoose will hash password via pre-save hook
    const user = await User.create(userData);
    
    console.log('✅ User created successfully!');
    console.log('User ID:', user._id);
    console.log('User email:', user.email);
    console.log('User role:', user.role);

    // Verify user was saved
    const savedUser = await User.findById(user._id).select('+password');
    console.log('🔐 Password hashed:', savedUser.password ? 'Yes' : 'No');
    console.log('🔐 Password length:', savedUser.password ? savedUser.password.length : 0);

    // Generate JWT token
    console.log('🎫 Generating JWT token...');
    const token = user.generateToken();
    console.log('✅ Token generated');

    // Prepare response
    const response = {
      success: true,
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    };

    console.log('📤 Sending response:', {
      success: response.success,
      hasToken: !!response.token,
      user: response.user
    });
    console.log('=== REGISTER REQUEST END ===\n');

    res.status(201).json(response);

  } catch (error) {
    console.error('❌ REGISTER ERROR:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    console.log('=== LOGIN REQUEST START ===');
    
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ 
        success: false,
        message: 'Vui lòng nhập email và mật khẩu' 
      });
    }

    const normalizedEmail = email.toString().trim().toLowerCase();
    console.log('📧 Login attempt for:', normalizedEmail);

    // Find user with password field
    console.log('🔍 Finding user...');
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ 
        success: false,
        message: 'Email hoặc mật khẩu không đúng' 
      });
    }

    console.log('✅ User found:', user._id);
    console.log('🔐 Has password:', !!user.password);

    // Check password
    console.log('🔍 Verifying password...');
    const isPasswordMatch = await user.matchPassword(password);
    console.log('🔐 Password match:', isPasswordMatch);

    if (!isPasswordMatch) {
      console.log('❌ Password incorrect');
      return res.status(401).json({ 
        success: false,
        message: 'Email hoặc mật khẩu không đúng' 
      });
    }

    // Check if account is active
    if (!user.isActive) {
      console.log('❌ Account is inactive');
      return res.status(403).json({ 
        success: false,
        message: 'Tài khoản đã bị khóa' 
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();
    console.log('✅ Last login updated');

    // Generate token
    const token = user.generateToken();
    console.log('✅ Token generated');

    const response = {
      success: true,
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    };

    console.log('📤 Login successful for:', user.email);
    console.log('=== LOGIN REQUEST END ===\n');

    res.json(response);

  } catch (error) {
    console.error('❌ LOGIN ERROR:', error);
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
      return res.status(401).json({ 
        success: false,
        message: 'Mật khẩu hiện tại không đúng' 
      });
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
      user.lastLogin = new Date();
      await user.save();
    } else {
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
