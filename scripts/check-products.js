const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../backend/models/Product');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dh-pharmacy', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function checkProducts() {
  try {
    console.log('🔍 Kiểm tra database...\n');

    const total = await Product.countDocuments();
    console.log(`📊 Tổng số sản phẩm: ${total}\n`);

    // Get all products
    const products = await Product.find({})
      .select('name category images usage')
      .sort({ createdAt: -1 })
      .limit(10);

    console.log('📦 10 sản phẩm mới nhất:\n');
    products.forEach((p, i) => {
      const hasImage = p.images && p.images.length > 0 && p.images[0].url;
      const hasAgeGroups = p.usage && p.usage.ageGroups && p.usage.ageGroups.length > 0;
      const imageStatus = hasImage ? '✅' : '❌';
      const ageStatus = hasAgeGroups ? '✅' : '❌';
      
      console.log(`${i + 1}. ${p.name}`);
      console.log(`   Danh mục: ${p.category}`);
      console.log(`   Hình ảnh: ${imageStatus} ${hasImage ? '(có)' : '(không)'}`);
      console.log(`   Age Groups: ${ageStatus} ${hasAgeGroups ? p.usage.ageGroups.join(', ') : '(không)'}`);
      console.log('');
    });

    // Check products without images
    const noImages = await Product.countDocuments({
      $or: [
        { images: { $size: 0 } },
        { 'images.0.url': { $exists: false } },
        { 'images.0.url': '' }
      ]
    });

    console.log(`\n⚠️  Sản phẩm không có hình: ${noImages}`);

    // Check products without ageGroups
    const noAgeGroups = await Product.countDocuments({
      $or: [
        { 'usage.ageGroups': { $exists: false } },
        { 'usage.ageGroups': { $size: 0 } }
      ]
    });

    console.log(`⚠️  Sản phẩm không có ageGroups: ${noAgeGroups}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

checkProducts();
