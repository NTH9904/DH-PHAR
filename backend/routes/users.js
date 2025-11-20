const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// @desc    Get user addresses
// @route   GET /api/users/addresses
// @access  Private
router.get('/addresses', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      data: user.addresses || []
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add address
// @route   POST /api/users/addresses
// @access  Private
router.post('/addresses', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    // If this is set as default, unset others
    if (req.body.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push(req.body);
    await user.save();

    res.status(201).json({
      success: true,
      data: user.addresses[user.addresses.length - 1]
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
router.put('/addresses/:addressId', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const address = user.addresses.id(req.params.addressId);

    if (!address) {
      return res.status(404).json({ message: 'Không tìm thấy địa chỉ' });
    }

    Object.assign(address, req.body);
    
    if (req.body.isDefault) {
      user.addresses.forEach(addr => {
        if (addr._id.toString() !== req.params.addressId) {
          addr.isDefault = false;
        }
      });
    }

    await user.save();

    res.json({
      success: true,
      data: address
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
router.delete('/addresses/:addressId', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses.id(req.params.addressId).remove();
    await user.save();

    res.json({
      success: true,
      message: 'Xóa địa chỉ thành công'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update health profile
// @route   PUT /api/users/health-profile
// @access  Private
router.put('/health-profile', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (req.body.medicalHistory) {
      user.healthProfile.medicalHistory.push(req.body.medicalHistory);
    }
    
    if (req.body.allergies) {
      user.healthProfile.allergies.push(req.body.allergies);
    }

    await user.save();

    res.json({
      success: true,
      data: user.healthProfile
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

