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

    // Generate email verification token
    const crypto = require('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Create user with verification token
    userData.emailVerificationToken = verificationToken;
    userData.isEmailVerified = false;
    
    const user = await User.create(userData);
    
    console.log('✅ User created successfully!');
    console.log('User ID:', user._id);
    console.log('User email:', user.email);
    console.log('User role:', user.role);

    // Send verification email
    try {
      const sendEmail = require('../utils/sendEmail');
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pages/verify-email.html?token=${verificationToken}`;
      
      await sendEmail({
        email: user.email,
        subject: 'Xác thực tài khoản DH Pharmacy',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; border-radius: 10px;">
            <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #2C5AA0; margin-bottom: 20px;">💊 DH Pharmacy</h1>
              <h2 style="color: #2C3E50; margin-bottom: 20px;">Xác thực tài khoản</h2>
              <p style="color: #555; font-size: 16px; line-height: 1.6;">Xin chào <strong>${user.name}</strong>,</p>
              <p style="color: #555; font-size: 16px; line-height: 1.6;">Cảm ơn bạn đã đăng ký tài khoản tại DH Pharmacy. Vui lòng click vào nút bên dưới để xác thực email của bạn:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #2C5AA0 0%, #27AE60 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Xác thực Email</a>
              </div>
              <p style="color: #777; font-size: 14px; line-height: 1.6;">Hoặc copy link sau vào trình duyệt:</p>
              <p style="color: #3498DB; font-size: 14px; word-break: break-all;">${verificationUrl}</p>
              <hr style="border: none; border-top: 1px solid #E1E8ED; margin: 30px 0;">
              <p style="color: #999; font-size: 12px;">Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
              <p style="color: #999; font-size: 12px;">Link xác thực sẽ hết hạn sau 24 giờ.</p>
            </div>
          </div>
        `
      });
      
      console.log('✅ Verification email sent');
    } catch (emailError) {
      console.error('⚠️  Error sending verification email:', emailError);
      // Continue registration even if email fails
    }

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


// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    
    // Find user with verification token
    const user = await User.findOne({ emailVerificationToken: token });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token xác thực không hợp lệ hoặc đã hết hạn'
      });
    }
    
    // Update user
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();
    
    console.log('✅ Email verified for user:', user.email);
    
    res.json({
      success: true,
      message: 'Email đã được xác thực thành công!'
    });
  } catch (error) {
    console.error('❌ Error verifying email:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xác thực email'
    });
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Private
exports.resendVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }
    
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được xác thực rồi'
      });
    }
    
    // Generate new verification token
    const crypto = require('crypto');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    user.emailVerificationToken = verificationToken;
    await user.save();
    
    // Send verification email
    const sendEmail = require('../utils/sendEmail');
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pages/verify-email.html?token=${verificationToken}`;
    
    await sendEmail({
      email: user.email,
      subject: 'Xác thực tài khoản DH Pharmacy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; border-radius: 10px;">
          <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #2C5AA0; margin-bottom: 20px;">💊 DH Pharmacy</h1>
            <h2 style="color: #2C3E50; margin-bottom: 20px;">Xác thực tài khoản</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.6;">Xin chào <strong>${user.name}</strong>,</p>
            <p style="color: #555; font-size: 16px; line-height: 1.6;">Vui lòng click vào nút bên dưới để xác thực email của bạn:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #2C5AA0 0%, #27AE60 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Xác thực Email</a>
            </div>
            <p style="color: #777; font-size: 14px; line-height: 1.6;">Hoặc copy link sau vào trình duyệt:</p>
            <p style="color: #3498DB; font-size: 14px; word-break: break-all;">${verificationUrl}</p>
            <hr style="border: none; border-top: 1px solid #E1E8ED; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">Nếu bạn không yêu cầu email này, vui lòng bỏ qua.</p>
          </div>
        </div>
      `
    });
    
    res.json({
      success: true,
      message: 'Email xác thực đã được gửi lại'
    });
  } catch (error) {
    console.error('❌ Error resending verification:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi gửi lại email xác thực'
    });
  }
};


// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
exports.googleCallback = async (req, res) => {
  try {
    // User is available in req.user from passport
    const user = req.user;
    
    // Generate JWT token
    const token = user.generateToken();
    
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/pages/oauth-success.html?token=${token}`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/pages/login.html?error=oauth_failed`);
  }
};

// @desc    Facebook OAuth callback
// @route   GET /api/auth/facebook/callback
// @access  Public
exports.facebookCallback = async (req, res) => {
  try {
    // User is available in req.user from passport
    const user = req.user;
    
    // Generate JWT token
    const token = user.generateToken();
    
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/pages/oauth-success.html?token=${token}`);
  } catch (error) {
    console.error('Facebook callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/pages/login.html?error=oauth_failed`);
  }
};


// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email'
      });
    }
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'Nếu email tồn tại, link reset mật khẩu đã được gửi'
      });
    }
    
    // Generate reset token
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token and save to user
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();
    
    // Send email
    try {
      const sendEmail = require('../utils/sendEmail');
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pages/reset-password.html?token=${resetToken}`;
      
      await sendEmail({
        email: user.email,
        subject: 'Đặt lại mật khẩu - DH Pharmacy',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; border-radius: 10px;">
            <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #2C5AA0; margin-bottom: 20px;">💊 DH Pharmacy</h1>
              <h2 style="color: #2C3E50; margin-bottom: 20px;">Đặt lại mật khẩu</h2>
              <p style="color: #555; font-size: 16px; line-height: 1.6;">Xin chào <strong>${user.name}</strong>,</p>
              <p style="color: #555; font-size: 16px; line-height: 1.6;">Bạn đã yêu cầu đặt lại mật khẩu. Click vào nút bên dưới để tạo mật khẩu mới:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #E74C3C 0%, #C0392B 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Đặt lại mật khẩu</a>
              </div>
              <p style="color: #777; font-size: 14px; line-height: 1.6;">Hoặc copy link sau vào trình duyệt:</p>
              <p style="color: #3498DB; font-size: 14px; word-break: break-all;">${resetUrl}</p>
              <hr style="border: none; border-top: 1px solid #E1E8ED; margin: 30px 0;">
              <p style="color: #E74C3C; font-size: 14px; font-weight: 600;">⚠️ Link này sẽ hết hạn sau 30 phút.</p>
              <p style="color: #999; font-size: 12px;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này và mật khẩu của bạn sẽ không thay đổi.</p>
            </div>
          </div>
        `
      });
      
      console.log('✅ Password reset email sent to:', user.email);
    } catch (emailError) {
      console.error('⚠️  Error sending reset email:', emailError);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      
      return res.status(500).json({
        success: false,
        message: 'Không thể gửi email. Vui lòng thử lại sau.'
      });
    }
    
    res.json({
      success: true,
      message: 'Link reset mật khẩu đã được gửi đến email của bạn'
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xử lý yêu cầu'
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập mật khẩu mới'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự'
      });
    }
    
    // Hash token to compare with database
    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn'
      });
    }
    
    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    
    console.log('✅ Password reset successful for:', user.email);
    
    // Generate new JWT token
    const jwtToken = user.generateToken();
    
    res.json({
      success: true,
      message: 'Mật khẩu đã được đặt lại thành công',
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đặt lại mật khẩu'
    });
  }
};
