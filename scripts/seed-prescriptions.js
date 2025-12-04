const mongoose = require('mongoose');
require('dotenv').config();

async function seedPrescriptions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dh_pharmacy');
    console.log('✅ Connected to MongoDB');

    const Prescription = require('../backend/models/Prescription');
    const User = require('../backend/models/User');
    
    // Get some users
    const users = await User.find({ role: 'customer' }).limit(5);
    
    if (users.length === 0) {
      console.log('⚠️  No users found. Please create users first.');
      process.exit(0);
    }
    
    console.log(`Found ${users.length} users`);
    
    // Clear existing prescriptions
    await Prescription.deleteMany({});
    console.log('🗑️  Cleared existing prescriptions');
    
    // Sample prescriptions
    const prescriptions = [
      {
        user: users[0]._id,
        doctorName: 'BS. Nguyễn Văn A',
        hospitalName: 'Bệnh viện Bạch Mai',
        prescriptionDate: new Date('2024-12-01'),
        imageUrl: '/uploads/prescription-sample-1.jpg',
        verificationStatus: 'pending',
        medications: [
          { name: 'Paracetamol 500mg', dosage: '1 viên x 3 lần/ngày', duration: '5 ngày' }
        ]
      },
      {
        user: users[1]._id,
        doctorName: 'BS. Trần Thị B',
        hospitalName: 'Bệnh viện Chợ Rẫy',
        prescriptionDate: new Date('2024-12-02'),
        imageUrl: '/uploads/prescription-sample-2.jpg',
        verificationStatus: 'pending',
        medications: [
          { name: 'Amoxicillin 500mg', dosage: '1 viên x 2 lần/ngày', duration: '7 ngày' }
        ]
      },
      {
        user: users[2]._id,
        doctorName: 'BS. Lê Văn C',
        hospitalName: 'Bệnh viện 108',
        prescriptionDate: new Date('2024-12-03'),
        imageUrl: '/uploads/prescription-sample-3.jpg',
        verificationStatus: 'approved',
        verificationNotes: 'Đơn thuốc hợp lệ',
        medications: [
          { name: 'Vitamin C 1000mg', dosage: '1 viên/ngày', duration: '30 ngày' }
        ]
      },
      {
        user: users[0]._id,
        doctorName: 'BS. Phạm Thị D',
        hospitalName: 'Bệnh viện Việt Đức',
        prescriptionDate: new Date('2024-11-28'),
        imageUrl: '/uploads/prescription-sample-4.jpg',
        verificationStatus: 'approved',
        verificationNotes: 'Đã xác nhận',
        medications: [
          { name: 'Ibuprofen 400mg', dosage: '1 viên khi đau', duration: '10 ngày' }
        ]
      },
      {
        user: users[1]._id,
        doctorName: 'BS. Hoàng Văn E',
        hospitalName: 'Bệnh viện Nhi Trung ương',
        prescriptionDate: new Date('2024-11-25'),
        imageUrl: '/uploads/prescription-sample-5.jpg',
        verificationStatus: 'rejected',
        verificationNotes: 'Đơn thuốc không rõ ràng, cần bổ sung thông tin',
        medications: []
      }
    ];
    
    // Insert prescriptions
    const created = await Prescription.insertMany(prescriptions);
    console.log(`✅ Created ${created.length} prescriptions`);
    
    // Display summary
    console.log('\n📋 Prescription Summary:');
    const pending = created.filter(p => p.verificationStatus === 'pending').length;
    const approved = created.filter(p => p.verificationStatus === 'approved').length;
    const rejected = created.filter(p => p.verificationStatus === 'rejected').length;
    
    console.log(`  - Chờ duyệt: ${pending}`);
    console.log(`  - Đã duyệt: ${approved}`);
    console.log(`  - Từ chối: ${rejected}`);
    
    console.log('\n✅ Seed prescriptions completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding prescriptions:', error);
    process.exit(1);
  }
}

seedPrescriptions();
