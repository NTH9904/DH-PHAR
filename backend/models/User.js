const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Vui lòng nhập email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
  },
  password: {
    type: String,
    required: function() {
      return !this.oauthId; // Password not required for OAuth users
    },
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
    select: false // Don't return password by default
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ']
  },
  role: {
    type: String,
    enum: ['customer', 'pharmacist', 'admin'],
    default: 'customer'
  },
  // OAuth
  oauthId: String,
  oauthProvider: {
    type: String,
    enum: ['google', 'facebook']
  },
  // Health profile
  healthProfile: {
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    medicalHistory: [{
      condition: String,
      notes: String,
      date: Date
    }],
    allergies: [{
      substance: String,
      severity: {
        type: String,
        enum: ['mild', 'moderate', 'severe']
      }
    }],
    currentMedications: [{
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      dosage: String,
      frequency: String
    }]
  },
  // Addresses
  addresses: [{
    name: String,
    phone: String,
    address: String,
    ward: String,
    district: String,
    city: String,
    isDefault: {
      type: Boolean,
      default: false
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  }],
  // Loyalty points
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  // 2FA
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: String,
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: Date
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    console.log('⏭️  Password not modified, skipping hash');
    return next();
  }

  try {
    console.log('🔐 Hashing password...');
    
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    console.log('✅ Salt generated');
    
    // Hash password
    this.password = await bcrypt.hash(this.password, salt);
    console.log('✅ Password hashed successfully');
    console.log('🔐 Hashed password length:', this.password.length);
    
    next();
  } catch (error) {
    console.error('❌ Error hashing password:', error);
    next(error);
  }
});

// Method to compare password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    console.log('🔍 Comparing passwords...');
    console.log('🔐 Stored password exists:', !!this.password);
    console.log('🔐 Stored password length:', this.password ? this.password.length : 0);
    console.log('🔐 Entered password length:', enteredPassword ? enteredPassword.length : 0);
    
    if (!this.password) {
      console.log('❌ No stored password to compare');
      return false;
    }
    
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log('🔐 Password match result:', isMatch);
    
    return isMatch;
  } catch (error) {
    console.error('❌ Error comparing passwords:', error);
    return false;
  }
};

// Method to generate JWT token
UserSchema.methods.generateToken = function() {
  try {
    console.log('🎫 Generating JWT token for user:', this._id);
    
    // Get JWT secret
    let secret = process.env.JWT_SECRET;
    
    if (!secret) {
      console.warn('⚠️  JWT_SECRET not found in environment');
      
      if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET must be set in production');
      }
      
      // Use fallback for development
      secret = 'dev-secret-key-change-in-production';
      console.warn('⚠️  Using fallback JWT secret for development');
    }
    
    // Generate token
    const token = jwt.sign(
      { id: this._id },
      secret,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    
    console.log('✅ JWT token generated');
    
    return token;
  } catch (error) {
    console.error('❌ Error generating token:', error);
    throw error;
  }
};

// Ensure only one default address
UserSchema.pre('save', function(next) {
  if (this.addresses && this.addresses.length > 0) {
    const defaultAddresses = this.addresses.filter(addr => addr.isDefault);
    if (defaultAddresses.length > 1) {
      // Keep only the first one as default
      this.addresses.forEach((addr, index) => {
        if (index > 0) addr.isDefault = false;
      });
    }
  }
  next();
});

// Create indexes
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });

module.exports = mongoose.model('User', UserSchema);
