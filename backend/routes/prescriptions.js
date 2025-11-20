const express = require('express');
const router = express.Router();
const { protect, pharmacist } = require('../middleware/auth');
const Prescription = require('../models/Prescription');
const upload = require('../middleware/upload');

// @desc    Upload prescription
// @route   POST /api/prescriptions/upload
// @access  Private
router.post('/upload', protect, upload.single('prescription'), async (req, res, next) => {
  try {
    // TODO: Upload to S3/R2 and get URL
    // TODO: OCR processing
    
    const prescription = await Prescription.create({
      user: req.user.id,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
      doctorName: req.body.doctorName,
      hospitalName: req.body.hospitalName,
      prescriptionDate: req.body.prescriptionDate
    });

    res.status(201).json({
      success: true,
      data: prescription
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user prescriptions
// @route   GET /api/prescriptions
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const prescriptions = await Prescription.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: prescriptions.length,
      data: prescriptions
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Verify prescription (Pharmacist/Admin)
// @route   PUT /api/prescriptions/:id/verify
// @access  Private/Pharmacist
router.put('/:id/verify', protect, pharmacist, async (req, res, next) => {
  try {
    const { verificationStatus, verificationNotes } = req.body;

    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({ message: 'Không tìm thấy đơn thuốc' });
    }

    prescription.verificationStatus = verificationStatus;
    prescription.verificationNotes = verificationNotes;
    prescription.verifiedBy = req.user.id;
    prescription.verifiedAt = new Date();

    await prescription.save();

    res.json({
      success: true,
      data: prescription
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

