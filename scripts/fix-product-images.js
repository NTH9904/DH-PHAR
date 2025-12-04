const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../backend/models/Product');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dh_pharmacy', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Image mapping by category
const categoryImages = {
  'Thuốc giảm đau, hạ sốt': 'https://cdn.nhathuoclongchau.com.vn/unsafe/375x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/00003847_hapacol_500_hdv_100v_8936067100037_1_e5e8e8c0e6.jpg',
  'Kháng sinh': 'https://cdn.nhathuoclongchau.com.vn/unsafe/375x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/00011866_amoxicillin_500mg_stada_10x10_8936067100044_1_large.jpg',
  'Thuốc ho': 'https://cdn.nhathuoclongchau.com.vn/unsafe/375x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/00011868_prospan_100ml_engelhard_4032651001019_1_large.jpg',
  'Thuốc cảm': 'https://cdn.nhathuoclongchau.com.vn/unsafe/375x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/00011870_decolgen_nd_unilab_20v_8936067100068_1_large.jpg',
  'Thực phẩm chức năng': 'https://cdn.nhathuoclongchau.com.vn/unsafe/375x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/00011872_vitamin_c_1000mg_blackmores_60v_9300807285015_1_large.jpg',
  'Thuốc dạ dày': 'https://cdn.nhathuoclongchau.com.vn/unsafe/375x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/00011875_omeprazole_20mg_stada_30v_8936067100082_1_large.jpg',
  'Thuốc tim mạch': 'https://cdn.nhathuoclongchau.com.vn/unsafe/375x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/00503234_aspirin_100mg_bayer_3x10_4046896014018_7569_62a5_large.jpg',
  'Thuốc tiểu đường': 'https://cdn.nhathuoclongchau.com.vn/unsafe/375x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/00502234_metformin_500mg_merck_10x10_8936067100099_1_large.jpg',
  'Thuốc trẻ em': 'https://cdn.nhathuoclongchau.com.vn/unsafe/375x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/00011868_prospan_100ml_engelhard_4032651001019_1_large.jpg',
  'Thuốc dị ứng': 'https://cdn.nhathuoclongchau.com.vn/unsafe/375x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/00502235_cetirizine_10mg_ucb_10x10_8936067100105_1_large.jpg',
  'Thuốc ngoài da': 'https://cdn.nhathuoclongchau.com.vn/unsafe/375x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/00502236_acnes_cream_rohto_25g_8936067100112_1_large.jpg',
  'Thuốc mắt': 'https://cdn.nhathuoclongchau.com.vn/unsafe/375x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/00502237_rohto_v_eye_drops_13ml_8936067100129_1_large.jpg'
};

// Fallback image
const fallbackImage = 'https://cdn.nhathuoclongchau.com.vn/unsafe/375x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/smalls/00503234_thuoc_vien_nen_8936067100136_1_large.jpg';

async function fixProductImages() {
  try {
    console.log('🔄 Đang cập nhật hình ảnh cho tất cả sản phẩm...');

    const products = await Product.find({});
    console.log(`📦 Tìm thấy ${products.length} sản phẩm`);

    let updated = 0;
    for (const product of products) {
      // Skip if product already has valid image
      if (product.images && product.images.length > 0 && 
          product.images[0].url && 
          !product.images[0].url.includes('placeholder') &&
          !product.images[0].url.includes('via.placeholder')) {
        console.log(`⏭️  Bỏ qua: ${product.name} (đã có hình)`);
        continue;
      }

      // Get image based on category
      const imageUrl = categoryImages[product.category] || fallbackImage;

      // Update product
      product.images = [{
        url: imageUrl,
        alt: product.name,
        isPrimary: true
      }];

      await product.save();
      updated++;
      console.log(`✅ Cập nhật: ${product.name}`);
    }

    console.log(`\n✅ Hoàn thành! Đã cập nhật ${updated}/${products.length} sản phẩm`);

    // Show statistics
    const withImages = await Product.countDocuments({ 
      'images.0.url': { $exists: true, $ne: '' } 
    });
    console.log(`\n📊 Thống kê:`);
    console.log(`  Tổng sản phẩm: ${products.length}`);
    console.log(`  Có hình ảnh: ${withImages}`);
    console.log(`  Không có hình: ${products.length - withImages}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

// Run
fixProductImages();
