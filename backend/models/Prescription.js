const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  // Prescription details
  doctorName: String,
  hospitalName: String,
  prescriptionDate: Date,
  // Prescription image
  imageUrl: String,
  imageKey: String, // S3 key
  // OCR extracted data
  ocrData: {
    extracted: Boolean,
    rawText: String,
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      duration: String
    }],
    confidence: Number
  },
  // Verification
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Pharmacist or Admin
  },
  verifiedAt: Date,
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  verificationNotes: String,
  // Legal compliance - store for 2 years
  retentionUntil: {
    type: Date,
    default: function() {
      const date = new Date();
      date.setFullYear(date.getFullYear() + 2);
      return date;
    }
  },
  // Status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Auto-delete after retention period
PrescriptionSchema.index({ retentionUntil: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Prescription', PrescriptionSchema);

