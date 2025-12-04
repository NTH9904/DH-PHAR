// Script to fix slug index in MongoDB
const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../backend/models/Product');

async function fixSlugIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dh_pharmacy', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Drop existing slug index
    try {
      await Product.collection.dropIndex('slug_1');
      console.log('✅ Dropped old slug index');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  Index does not exist, creating new one...');
      } else {
        console.log('⚠️  Error dropping index:', error.message);
      }
    }

    // Create new sparse index
    await Product.collection.createIndex({ slug: 1 }, { unique: true, sparse: true });
    console.log('✅ Created new sparse slug index');

    console.log('\n🎉 Index fixed! Now you can run: node scripts/seed.js');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixSlugIndex();

