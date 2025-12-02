const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../backend/models/Product');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dh-pharmacy', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function cleanOldProducts() {
  try {
    console.log('🔄 Đang xóa sản phẩm cũ không có usage.ageGroups...');

    // Find products without ageGroups
    const oldProducts = await Product.find({
      $or: [
        { 'usage.ageGroups': { $exists: false } },
        { 'usage.ageGroups': { $size: 0 } },
        { usage: { $type: 'string' } } // Old format where usage is string
      ]
    });

    console.log(`📦 Tìm thấy ${oldProducts.length} sản phẩm cũ`);

    if (oldProducts.length === 0) {
      console.log('✅ Không có sản phẩm cũ nào cần xóa');
      process.exit(0);
    }

    // Show products to be deleted
    console.log('\n📋 Danh sách sản phẩm sẽ bị xóa:');
    oldProducts.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name} (${p.category})`);
    });

    // Delete old products
    const result = await Product.deleteMany({
      $or: [
        { 'usage.ageGroups': { $exists: false } },
        { 'usage.ageGroups': { $size: 0 } },
        { usage: { $type: 'string' } }
      ]
    });

    console.log(`\n✅ Đã xóa ${result.deletedCount} sản phẩm cũ`);

    // Show remaining products
    const remaining = await Product.countDocuments();
    console.log(`\n📊 Còn lại: ${remaining} sản phẩm`);

    const byCategory = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📦 Theo danh mục:');
    byCategory.forEach(cat => {
      console.log(`  ${cat._id}: ${cat.count} sản phẩm`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

// Run
cleanOldProducts();
