const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../backend/models/Product');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dh-pharmacy', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Age group mapping based on product category
const ageGroupMapping = {
  'Thuốc giảm đau, hạ sốt': ['child', 'teen', 'adult', 'senior'],
  'Kháng sinh': ['child', 'teen', 'adult', 'senior'],
  'Thuốc ho': ['toddler', 'child', 'teen', 'adult', 'senior'],
  'Thuốc cảm': ['toddler', 'child', 'teen', 'adult', 'senior'],
  'Thực phẩm chức năng': ['teen', 'adult', 'senior'],
  'Vitamin': ['infant', 'toddler', 'child', 'teen', 'adult', 'senior'],
  'Thuốc dạ dày': ['teen', 'adult', 'senior'],
  'Thuốc tim mạch': ['adult', 'senior'],
  'Thuốc tiểu đường': ['adult', 'senior'],
  'Thuốc huyết áp': ['adult', 'senior'],
  'Thuốc trẻ em': ['infant', 'toddler', 'child'],
  'Sữa bột': ['infant', 'toddler', 'child']
};

async function updateAgeGroups() {
  try {
    console.log('🔄 Đang cập nhật age groups cho tất cả sản phẩm...');

    const products = await Product.find({});
    console.log(`📦 Tìm thấy ${products.length} sản phẩm`);

    let updated = 0;
    for (const product of products) {
      // Get age groups based on category
      let ageGroups = ageGroupMapping[product.category] || ['adult'];

      // Special cases based on product name
      if (product.name.toLowerCase().includes('trẻ em') || 
          product.name.toLowerCase().includes('children')) {
        ageGroups = ['toddler', 'child', 'teen'];
      } else if (product.name.toLowerCase().includes('người cao tuổi') || 
                 product.name.toLowerCase().includes('senior')) {
        ageGroups = ['senior'];
      } else if (product.name.toLowerCase().includes('vitamin') || 
                 product.name.toLowerCase().includes('canxi')) {
        ageGroups = ['child', 'teen', 'adult', 'senior'];
      }

      // Update product
      product.usage = {
        instructions: product.usage || 'Theo chỉ định của bác sĩ',
        ageGroups: ageGroups
      };

      await product.save();
      updated++;

      if (updated % 10 === 0) {
        console.log(`✅ Đã cập nhật ${updated}/${products.length} sản phẩm`);
      }
    }

    console.log(`\n✅ Hoàn thành! Đã cập nhật ${updated} sản phẩm`);
    console.log('\n📊 Thống kê age groups:');
    
    // Show statistics
    const stats = await Product.aggregate([
      { $unwind: '$usage.ageGroups' },
      { $group: { _id: '$usage.ageGroups', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const ageGroupNames = {
      infant: 'Trẻ sơ sinh (0-1 tuổi)',
      toddler: 'Trẻ nhỏ (1-3 tuổi)',
      child: 'Trẻ em (3-12 tuổi)',
      teen: 'Thanh thiếu niên (12-18 tuổi)',
      adult: 'Người lớn (18-60 tuổi)',
      senior: 'Người cao tuổi (60+ tuổi)'
    };

    stats.forEach(stat => {
      console.log(`  ${ageGroupNames[stat._id]}: ${stat.count} sản phẩm`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

// Run
updateAgeGroups();
