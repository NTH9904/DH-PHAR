const mongoose = require('mongoose');
require('dotenv').config();

async function createPharmacist() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dh_pharmacy');
    console.log('✅ Connected to MongoDB');

    const User = require('../backend/models/User');
    
    // Check if pharmacist already exists
    const existingPharmacist = await User.findOne({ email: 'pharmacist@dhpharmacy.com' });
    
    if (existingPharmacist) {
      console.log('⚠️  Pharmacist account already exists');
      console.log('Email:', existingPharmacist.email);
      console.log('Role:', existingPharmacist.role);
      process.exit(0);
    }
    
    // Create pharmacist account
    const pharmacist = await User.create({
      name: 'Dược sĩ DH Pharmacy',
      email: 'pharmacist@dhpharmacy.com',
      password: 'pharmacist123',
      phone: '0344864576',
      role: 'pharmacist',
      isEmailVerified: true
    });
    
    console.log('✅ Pharmacist account created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Email:', pharmacist.email);
    console.log('Password: pharmacist123');
    console.log('Role:', pharmacist.role);
    console.log('\n🔐 Pharmacist Permissions:');
    console.log('✅ Dashboard');
    console.log('✅ Orders');
    console.log('✅ Prescriptions');
    console.log('✅ Inventory');
    console.log('✅ Reports');
    console.log('❌ Products (Admin only)');
    console.log('❌ Users (Admin only)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating pharmacist:', error);
    process.exit(1);
  }
}

createPharmacist();
