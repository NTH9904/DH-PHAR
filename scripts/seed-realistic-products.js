const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../backend/models/Product');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dh_pharmacy', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Realistic products with proper images
const realisticProducts = [
  // Thuốc giảm đau, hạ sốt
  {
    name: 'Paracetamol 500mg Hapacol',
    genericName: 'Paracetamol',
    brand: 'Hapacol',
    manufacturer: 'DHG Pharma',
    type: 'otc',
    category: 'Thuốc giảm đau, hạ sốt',
    description: 'Thuốc giảm đau, hạ sốt hiệu quả cho người lớn và trẻ em',
    indications: ['Giảm đau nhẹ và vừa', 'Hạ sốt', 'Đau đầu', 'Đau răng'],
    contraindications: ['Suy gan nặng', 'Quá mẫn với Paracetamol'],
    sideEffects: ['Buồn nôn', 'Nôn', 'Phát ban'],
    dosage: 'Người lớn: 1-2 viên/lần, 3-4 lần/ngày. Trẻ em: Theo chỉ định bác sĩ',
    usage: {
      instructions: 'Uống sau ăn với nhiều nước',
      ageGroups: ['child', 'teen', 'adult', 'senior']
    },
    storage: 'Nơi khô ráo, tránh ánh sáng, nhiệt độ dưới 30°C',
    diseases: ['đau đầu', 'sốt', 'cảm cúm'],
    symptoms: ['đau', 'sốt'],
    price: 25000,
    originalPrice: 30000,
    stock: 500,
    images: [{
      url: 'https://cdn.nhathuoclongchau.com.vn/unsafe/375x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/00003847_hapacol_500_hdv_100v_8936067100037_1_e5e8e8c0e6.jpg',
      isPrimary: true
    }],
    specifications: {
      packageSize: 'Hộp 10 vỉ x 10 viên',
      unit: 'viên',
      registrationNumber: 'VD-12345-12'
    }
  },
  {
    name: 'Efferalgan 500mg',
    genericName: 'Paracetamol',
    brand: 'Efferalgan',
    manufacturer: 'Bristol-Myers Squibb',
    type: 'otc',
    category: 'Thuốc giảm đau, hạ sốt',
    description: 'Thuốc giảm đau, hạ sốt dạng sủi bọt, tan nhanh',
    indications: ['Giảm đau', 'Hạ sốt', 'Cảm cúm'],
    dosage: 'Người lớn: 1 viên sủi/lần, 2-3 lần/ngày',
    usage: {
      instructions: 'Hòa tan trong nước, uống ngay',
      ageGroups: ['teen', 'adult', 'senior']
    },
    price: 45000,
    stock: 300,
    images: [{
      url: 'https://cdn.nhathuoclongchau.com.vn/unsafe/375x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/00030223_efferalgan_500mg_bristol_myers_squibb_16v_3400936292017_9569_62a5_large.jpg',
      isPrimary: true
    }]
  },

  // Kháng sinh
  {
    name: 'Amoxicillin 500mg',
    genericName: 'Amoxicillin',
    brand: 'Amoxicillin Stada',
    manufacturer: 'Stada Vietnam',
    type: 'prescription',
    category: 'Kháng sinh',
    description: 'Kháng sinh nhóm Penicillin điều trị nhiễm khuẩn',
    indications: ['Nhiễm khuẩn đường hô hấp', 'Nhiễm khuẩn đường tiết niệu', 'Nhiễm khuẩn da'],
    contraindications: ['Dị ứng Penicillin', 'Dị ứng Beta-lactam'],
    sideEffects: ['Tiêu chảy', 'Buồn nôn', 'Phát ban'],
    dosage: 'Người lớn: 500mg x 3 lần/ngày. Trẻ em: Theo cân nặng',
    usage: {
      instructions: 'Uống sau ăn, đủ liệu trình 7-10 ngày',
      ageGroups: ['child', 'teen', 'adult', 'senior']
    },
    diseases: ['viêm phổi', 'viêm họng', 'viêm tai'],
    price: 45000,
    stock: 200,
    images: [{
      url: 'https://cdn.nhathuoclongchau.com.vn/unsafe/375x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/00011866_amoxicillin_500mg_stada_10x10_8936067100044_1_large.jpg',
      isPrimary: true
    }]
  },
  {
    name: 'Augmentin 625mg',
    genericName: 'Amoxicillin + Clavulanic Acid',
    brand: 'Augmentin',
    manufacturer: 'GlaxoSmithKline',
    type: 'prescription',
    category: 'Kháng sinh',
    description: 'Kháng sinh phối hợp điều trị nhiễm khuẩn nặng',
    indications: ['Nhiễm khuẩn đường hô hấp', 'Nhiễm khuẩn da và mô mềm'],
    dosage: 'Người lớn: 1 viên x 2-3 lần/ngày',
    usage: {
      instructions: 'Uống đầu bữa ăn, đủ liệu trình',
      ageGroups: ['teen', 'adult', 'senior']
    },
    price: 85000,
    stock: 150,
    images: [{
      url: 'https://cdn.nhathuoclongchau.com.vn/unsafe/375x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/00011867_augmentin_625mg_gsk_14v_8936067100051_1_large.jpg',
      isPrimary: true
    }]
  },

  // Thuốc ho
  {
    name: 'Prospan Siro 100ml',
    genericName: 'Chiết xuất lá thường xuân',
    brand: 'Prospan',
    manufacturer: 'Engelhard Arzneimittel',
    type: 'otc',
    category: 'Thuốc ho',
    description: 'Siro long đờm, giảm ho từ thảo dược',
    indications: ['Ho có đờm', 'Viêm phế quản'],
    dosage: 'Người lớn: 5-7.5ml x 3 lần/ngày. Trẻ em: 2.5-5ml x 3 lần/ngày',
    usage: {
      instructions: 'Uống trước hoặc sau ăn, lắc đều trước khi dùng',
      ageGroups: ['toddler', 'child', 'teen', 'adult', 'senior']
    },
    diseases: ['ho', 'viêm phế quản'],
    symptoms: ['ho có đờm'],
    price: 125000,
    stock: 180,
    images: [{
      url: 'https://cdn.nhathuoclongchau.com.vn/unsafe/375x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/00011868_prospan_100ml_engelhard_4032651001019_1_large.jpg',
      isPrimary: true
    }]
  },
  {
    name: 'Bisolvon 8mg',
    genericName: 'Bromhexine',
    brand: 'Bisolvon',
    manufacturer: 'Boehringer Ingelheim',
    type: 'otc',
    category: 'Thuốc ho',
    description: 'Thuốc long đờm, làm loãng đờm',
    indications: ['Ho có đờm', 'Viêm phế quản cấp và mãn tính'],
    dosage: 'Người lớn: 1-2 viên x 3 lần/ngày',
    usage: {
      instructions: 'Uống sau ăn với nhiều nước',
      ageGroups: ['child', 'teen', 'adult', 'senior']
    },
    price: 55000,
    stock: 250,
    images: [{
      url: 'https://cdn.nhathuoclongchau.com.vn/unsafe/375x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/00011869_bisolvon_8mg_boehringer_25v_4015588002014_1_large.jpg',
      isPrimary: true
    }]
  },

  // Thuốc cảm cúm
  {
    name: 'Decolgen ND',
    genericName: 'Paracetamol + Phenylephrine + CPM',
    brand: 'Decolgen',
    manufacturer: 'United Laboratories',
    type: 'otc',
    category: 'Thuốc cảm',
    description: 'Thuốc cảm cúm, giảm nghẹt mũi, sổ mũi',
    indications: ['Cảm cúm', 'Sổ mũi', 'Nghẹt mũi', 'Hắt hơi'],
    dosage: 'Người lớn: 1 viên x 3-4 lần/ngày',
    usage: {
      instructions: 'Uống sau ăn',
      ageGroups: ['teen', 'adult', 'senior']
    },
    diseases: ['cảm cúm', 'viêm mũi'],
    symptoms: ['sổ mũi', 'nghẹt mũi', 'hắt hơi'],
    price: 35000,
    stock: 400,
    images: [{
      url: 'https://cdn.nhathuoclongchau.com.vn/unsafe/375x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/00011870_decolgen_nd_unilab_20v_8936067100068_1_large.jpg',
      isPrimary: true
    }]
  },
  {
    name: 'Tiffy Day',
    genericName: 'Paracetamol + Pseudoephedrine + Dextromethorphan',
    brand: 'Tiffy',
    manufacturer: 'Sanofi',
    type: 'otc',
    category: 'Thuốc cảm',
    description: 'Thuốc cảm cúm ban ngày, không gây buồn ngủ',
    indications: ['Cảm cúm', 'Ho', 'Sổ mũi'],
    dosage: 'Người lớn: 1-2 viên x 3 lần/ngày',
    usage: {
      instructions: 'Uống sau ăn, dùng ban ngày',
      ageGroups: ['teen', 'adult']
    },
    price: 42000,
    stock: 350,
    images: [{
      url: 'https://cdn.nhathuoclongchau.com.vn/unsafe/375x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/00011871_tiffy_day_sanofi_10v_8936067100075_1_large.jpg',
      isPrimary: true
    }]
  },

  // Vitamin & Thực phẩm chức năng
  {
    name: 'Vitamin C 1000mg Blackmores',
    genericName: 'Ascorbic Acid',
    brand: 'Blackmores',
    manufacturer: 'Blackmores Australia',
    type: 'supplement',
    category: 'Thực phẩm chức năng',
    description: 'Bổ sung Vitamin C, tăng sức đề kháng',
    indications: ['Tăng sức đề kháng', 'Chống oxy hóa', 'Làm đẹp da'],
    dosage: '1 viên/ngày',
    usage: {
      instructions: 'Uống sau bữa ăn sáng',
      ageGroups: ['teen', 'adult', 'senior']
    },
    price: 285000,
    stock: 200,
    images: [{
      url: 'https://cdn.nhathuoclongchau.com.vn/unsafe/375x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/00011872_vitamin_c_1000mg_blackmores_60v_9300807285015_1_large.jpg',
      isPrimary: true
    }]
  },
  {
    name: 'Centrum Silver 50+',
    genericName: 'Multivitamin & Minerals',
    brand: 'Centrum',
    manufacturer: 'Pfizer',
    type: 'supplement',
    category: 'Thực phẩm chức năng',
    description: 'Vitamin tổng hợp cho người trên 50 tuổi',
    indications: ['Bổ sung vitamin', 'Tăng cường sức khỏe người cao tuổi'],
    dosage: '1 viên/ngày',
    usage: {
      instructions: 'Uống sau bữa ăn chính',
      ageGroups: ['senior']
    },
    price: 450000,
    stock: 150,
    images: [{
      url: 'https://cdn.nhathuoclongchau.com.vn/unsafe/375x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/00011873_centrum_silver_pfizer_100v_3574661361017_1_large.jpg',
      isPrimary: true
    }]
  },
  {
    name: 'Omega 3 Fish Oil',
    genericName: 'Omega-3 Fatty Acids',
    brand: 'Nature Made',
    manufacturer: 'Nature Made',
    type: 'supplement',
    category: 'Thực phẩm chức năng',
    description: 'Dầu cá Omega 3 tốt cho tim mạch và não bộ',
    indications: ['Hỗ trợ tim mạch', 'Tăng cường trí nhớ', 'Giảm cholesterol'],
    dosage: '1-2 viên/ngày',
    usage: {
      instructions: 'Uống cùng bữa ăn',
      ageGroups: ['adult', 'senior']
    },
    price: 380000,
    stock: 180,
    images: [{
      url: 'https://cdn.nhathuoclongchau.com.vn/unsafe/375x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/00011874_omega_3_nature_made_100v_31604026714_1_large.jpg',
      isPrimary: true
    }]
  },

  // Thuốc dạ dày
  {
    name: 'Omeprazole 20mg',
    genericName: 'Omeprazole',
    brand: 'Omeprazole Stada',
    manufacturer: 'Stada Vietnam',
    type: 'prescription',
    category: 'Thuốc dạ dày',
    description: 'Thuốc điều trị loét dạ dày, trào ngược dạ dày',
    indications: ['Loét dạ dày', 'Trào ngược dạ dày thực quản', 'Viêm loét dạ dày'],
    dosage: 'Người lớn: 1 viên/ngày, uống trước ăn sáng',
    usage: {
      instructions: 'Uống trước ăn 30 phút, nuốt nguyên viên',
      ageGroups: ['adult', 'senior']
    },
    diseases: ['loét dạ dày', 'trào ngược dạ dày'],
    price: 65000,
    stock: 220,
    images: [{
      url: 'https://cdn.nhathuoclongchau.com.vn/unsafe/375x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/00011875_omeprazole_20mg_stada_30v_8936067100082_1_large.jpg',
      isPrimary: true
    }]
  },
  {
    name: 'Gaviscon Suspension',
    genericName: 'Sodium Alginate + Sodium Bicarbonate',
    brand: 'Gaviscon',
    manufacturer: 'Reckitt Benckiser',
    type: 'otc',
    category: 'Thuốc dạ dày',
    description: 'Thuốc trị ợ nóng, khó tiêu',
    indications: ['Ợ nóng', 'Khó tiêu', 'Trào ngược dạ dày nhẹ'],
    dosage: '10-20ml sau bữa ăn và trước khi ngủ',
    usage: {
      instructions: 'Lắc đều trước khi dùng, uống sau ăn',
      ageGroups: ['teen', 'adult', 'senior']
    },
    price: 95000,
    stock: 160,
    images: [{
      url: 'https://cdn.nhathuoclongchau.com.vn/unsafe/375x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/00011876_gaviscon_reckitt_150ml_5000347008016_1_large.jpg',
      isPrimary: true
    }]
  }
];

// Generate slugs
function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

realisticProducts.forEach(product => {
  product.slug = generateSlug(product.name);
  product.isFeatured = Math.random() > 0.7; // 30% featured
  product.salesCount = Math.floor(Math.random() * 500);
  product.viewCount = Math.floor(Math.random() * 1000);
  product.ratings = {
    average: (Math.random() * 2 + 3).toFixed(1), // 3.0 - 5.0
    count: Math.floor(Math.random() * 100)
  };
});

async function seedRealisticProducts() {
  try {
    console.log('🔄 Đang thêm sản phẩm thực tế vào database...');

    for (const productData of realisticProducts) {
      // Check if product exists
      const existing = await Product.findOne({ slug: productData.slug });
      
      if (existing) {
        // Update existing product
        await Product.findByIdAndUpdate(existing._id, productData);
        console.log(`✅ Cập nhật: ${productData.name}`);
      } else {
        // Create new product
        await Product.create(productData);
        console.log(`✅ Thêm mới: ${productData.name}`);
      }
    }

    console.log(`\n🎉 Hoàn thành! Đã xử lý ${realisticProducts.length} sản phẩm`);
    
    // Show statistics
    const total = await Product.countDocuments();
    const byCategory = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log(`\n📊 Thống kê:`);
    console.log(`  Tổng số sản phẩm: ${total}`);
    console.log(`\n  Theo danh mục:`);
    byCategory.forEach(cat => {
      console.log(`    ${cat._id}: ${cat.count} sản phẩm`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

// Run
seedRealisticProducts();
