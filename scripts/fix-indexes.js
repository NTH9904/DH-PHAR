const mongoose = require('mongoose');
require('dotenv').config();

async function fixIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dh_pharmacy');
    console.log('✅ Connected to MongoDB');

    const Product = require('../backend/models/Product');
    
    // Drop all indexes except _id
    console.log('🔧 Dropping old indexes...');
    try {
      await Product.collection.dropIndexes();
      console.log('✅ Old indexes dropped');
    } catch (error) {
      console.log('⚠️  No indexes to drop or error:', error.message);
    }

    // Recreate indexes
    console.log('🔧 Creating new indexes...');
    await Product.createIndexes();
    console.log('✅ New indexes created');

    // List all indexes
    const indexes = await Product.collection.indexes();
    console.log('📋 Current indexes:');
    indexes.forEach(index => {
      console.log(`  - ${index.name}:`, Object.keys(index.key));
    });

    console.log('✅ Index fix completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
    process.exit(1);
  }
}

fixIndexes();
