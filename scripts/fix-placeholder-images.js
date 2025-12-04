const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../backend/models/Product');

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/dh_pharmacy';

async function fixPlaceholderImages() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Find all products with placeholder images
    const products = await Product.find({
      'images.url': { $regex: 'placeholder', $options: 'i' }
    });

    console.log(`\n📦 Found ${products.length} products with placeholder images`);

    if (products.length === 0) {
      console.log('✅ No products need fixing');
      process.exit(0);
    }

    // Update each product
    let updated = 0;
    for (const product of products) {
      console.log(`\n🔧 Fixing: ${product.name}`);
      
      // Replace placeholder with local SVG
      if (product.images && product.images.length > 0) {
        product.images = product.images.map(img => {
          if (img.url && (img.url.includes('placeholder') || img.url.includes('via.placeholder'))) {
            console.log(`   Old URL: ${img.url}`);
            img.url = '/images/no-image.svg';
            console.log(`   New URL: ${img.url}`);
          }
          return img;
        });
        
        await product.save();
        updated++;
        console.log(`   ✅ Updated`);
      }
    }

    console.log(`\n🎉 Successfully updated ${updated} products`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixPlaceholderImages();
