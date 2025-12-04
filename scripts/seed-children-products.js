// Script thêm sản phẩm dành cho trẻ nhỏ
const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../backend/models/Product');

// Sản phẩm dành cho trẻ nhỏ
const childrenProducts = [
  // Thuốc hạ sốt cho trẻ
  {
    name: 'Paracetamol Trẻ Em 250mg (Siro)',
    nameEn: 'Children Paracetamol 250mg Syrup',
    genericName: 'Paracetamol',
    brand: 'Hapacol Kids',
    manufacturer: 'DHG Pharma',
    type: 'otc',
    category: 'Thuốc cho trẻ em',
    subCategory: 'Hạ sốt, giảm đau',
    description: 'Siro hạ sốt, giảm đau dành cho trẻ em từ 1 tháng tuổi. Vị dâu thơm ngon, dễ uống.',
    indications: [
      'Hạ sốt cho trẻ em',
      'Giảm đau nhẹ và vừa',
      'Giảm đau sau tiêm chủng',
      'Giảm đau khi mọc răng'
    ],
    contraindications: [
      'Trẻ dưới 1 tháng tuổi',
      'Dị ứng với Paracetamol',
      'Suy gan nặng'
    ],
    sideEffects: ['Hiếm gặp: Phát ban, buồn nôn'],
    dosage: 'Trẻ 1-3 tuổi: 5ml/lần, 3-4 lần/ngày. Trẻ 3-6 tuổi: 7.5ml/lần, 3-4 lần/ngày',
    usage: 'Uống trực tiếp hoặc pha loãng với nước. Lắc đều trước khi dùng.',
    storage: 'Nơi khô mát, tránh ánh sáng. Nhiệt độ dưới 30°C',
    price: 45000,
    originalPrice: 55000,
    stock: 150,
    minOrderQuantity: 1,
    maxOrderQuantity: 5,
    images: [{ 
      url: 'https://via.placeholder.com/300x300/FFB6C1/000000?text=Hapacol+Kids+Syrup',
      alt: 'Siro Hapacol Kids',
      isPrimary: true 
    }],
    specifications: {
      packageSize: 'Chai 60ml',
      unit: 'chai',
      registrationNumber: 'VD-12345-20',
      barcode: '8934567890123'
    },
    isFeatured: true
  },
  
  // Vitamin tổng hợp cho trẻ
  {
    name: 'Vitamin Tổng Hợp Cho Trẻ Em (Siro)',
    nameEn: 'Children Multivitamin Syrup',
    genericName: 'Multivitamin Complex',
    brand: 'KidVit Plus',
    manufacturer: 'Traphaco',
    type: 'supplement',
    category: 'Thuốc cho trẻ em',
    subCategory: 'Vitamin & khoáng chất',
    description: 'Vitamin tổng hợp giúp bé ăn ngon, tăng cường sức đề kháng, phát triển toàn diện.',
    indications: [
      'Bổ sung vitamin cho trẻ biếng ăn',
      'Tăng cường sức đề kháng',
      'Hỗ trợ phát triển chiều cao',
      'Cải thiện trí nhớ, tập trung'
    ],
    dosage: 'Trẻ 1-3 tuổi: 5ml/ngày. Trẻ 3-6 tuổi: 10ml/ngày. Trẻ trên 6 tuổi: 15ml/ngày',
    usage: 'Uống sau bữa ăn sáng',
    storage: 'Nơi khô mát, tránh ánh sáng',
    price: 85000,
    originalPrice: 100000,
    stock: 200,
    images: [{ 
      url: 'https://via.placeholder.com/300x300/87CEEB/000000?text=KidVit+Plus',
      alt: 'Vitamin KidVit Plus',
      isPrimary: true 
    }],
    specifications: {
      packageSize: 'Chai 120ml',
      unit: 'chai',
      barcode: '8934567890124'
    },
    isFeatured: true
  },

  // Thuốc ho cho trẻ
  {
    name: 'Siro Ho Trẻ Em Prospan',
    nameEn: 'Prospan Cough Syrup for Children',
    genericName: 'Hedera helix extract',
    brand: 'Prospan Kids',
    manufacturer: 'Engelhard',
    type: 'otc',
    category: 'Thuốc cho trẻ em',
    subCategory: 'Thuốc ho',
    description: 'Siro ho từ thảo dược tự nhiên, an toàn cho trẻ từ 1 tuổi. Giúp long đờm, giảm ho hiệu quả.',
    indications: [
      'Ho có đờm',
      'Viêm phế quản cấp',
      'Viêm đường hô hấp trên'
    ],
    contraindications: [
      'Trẻ dưới 1 tuổi',
      'Dị ứng với thành phần thuốc'
    ],
    dosage: 'Trẻ 1-5 tuổi: 2.5ml x 3 lần/ngày. Trẻ 6-12 tuổi: 5ml x 3 lần/ngày',
    usage: 'Uống trực tiếp, không pha loãng',
    storage: 'Nơi khô mát, nhiệt độ dưới 25°C',
    price: 120000,
    stock: 100,
    images: [{ 
      url: 'https://via.placeholder.com/300x300/98FB98/000000?text=Prospan+Kids',
      alt: 'Siro Prospan Kids',
      isPrimary: true 
    }],
    specifications: {
      packageSize: 'Chai 100ml',
      unit: 'chai',
      registrationNumber: 'VD-12346-20',
      barcode: '8934567890125'
    },
    isFeatured: true
  },

  // Men vi sinh cho trẻ
  {
    name: 'Men Vi Sinh Bio-Gaia Protectis Drops',
    nameEn: 'Bio-Gaia Protectis Probiotic Drops',
    genericName: 'Lactobacillus reuteri',
    brand: 'Bio-Gaia',
    manufacturer: 'Bio-Gaia AB',
    type: 'supplement',
    category: 'Thuốc cho trẻ em',
    subCategory: 'Men vi sinh',
    description: 'Men vi sinh dạng nhỏ giọt cho trẻ sơ sinh và trẻ nhỏ. Giúp cân bằng hệ vi sinh đường ruột.',
    indications: [
      'Rối loạn tiêu hóa ở trẻ',
      'Đầy hơi, khó tiêu',
      'Tiêu chảy',
      'Táo bón',
      'Đau bụng do đầy hơi'
    ],
    dosage: 'Trẻ sơ sinh và trẻ nhỏ: 5 giọt/ngày',
    usage: 'Nhỏ trực tiếp vào miệng hoặc trộn với sữa, nước (nhiệt độ phòng)',
    storage: 'Nhiệt độ phòng, tránh ánh sáng trực tiếp',
    price: 350000,
    originalPrice: 400000,
    stock: 80,
    images: [{ 
      url: 'https://via.placeholder.com/300x300/FFD700/000000?text=Bio-Gaia+Drops',
      alt: 'Bio-Gaia Protectis Drops',
      isPrimary: true 
    }],
    specifications: {
      packageSize: 'Chai 5ml',
      unit: 'chai',
      barcode: '8934567890126'
    },
    isFeatured: true
  },

  // Canxi cho trẻ
  {
    name: 'Canxi + D3 Cho Trẻ Em (Viên Nhai)',
    nameEn: 'Calcium + D3 Chewable for Kids',
    genericName: 'Calcium Carbonate + Vitamin D3',
    brand: 'CalciKids',
    manufacturer: 'Dược Hậu Giang',
    type: 'supplement',
    category: 'Thuốc cho trẻ em',
    subCategory: 'Canxi & Vitamin D',
    description: 'Viên nhai vị sữa thơm ngon, bổ sung canxi và vitamin D3 giúp xương chắc khỏe.',
    indications: [
      'Bổ sung canxi cho trẻ đang phát triển',
      'Phòng ngừa còi xương, chậm lớn',
      'Hỗ trợ phát triển chiều cao',
      'Răng chắc khỏe'
    ],
    dosage: 'Trẻ 2-6 tuổi: 1 viên/ngày. Trẻ trên 6 tuổi: 2 viên/ngày',
    usage: 'Nhai kỹ sau bữa ăn',
    storage: 'Nơi khô mát, tránh ánh sáng',
    price: 95000,
    stock: 150,
    images: [{ 
      url: 'https://via.placeholder.com/300x300/FFA07A/000000?text=CalciKids',
      alt: 'CalciKids Chewable',
      isPrimary: true 
    }],
    specifications: {
      packageSize: 'Hộp 30 viên',
      unit: 'hộp',
      barcode: '8934567890127'
    }
  },

  // Thuốc nhỏ mũi cho trẻ
  {
    name: 'Nước Muối Sinh Lý Nasaline (Trẻ Em)',
    nameEn: 'Nasaline Saline Solution for Kids',
    genericName: 'Sodium Chloride 0.9%',
    brand: 'Nasaline Kids',
    manufacturer: 'OPC Pharma',
    type: 'otc',
    category: 'Thuốc cho trẻ em',
    subCategory: 'Thuốc mũi họng',
    description: 'Nước muối sinh lý dạng xịt mũi cho trẻ. Làm sạch mũi, giảm nghẹt mũi an toàn.',
    indications: [
      'Vệ sinh mũi hàng ngày',
      'Nghẹt mũi do cảm lạnh',
      'Viêm mũi dị ứng',
      'Làm ẩm niêm mạc mũi'
    ],
    dosage: 'Xịt 1-2 lần mỗi bên mũi, 2-3 lần/ngày',
    usage: 'Xịt vào mũi, đầu ngửa ra sau một chút',
    storage: 'Nhiệt độ phòng',
    price: 65000,
    stock: 120,
    images: [{ 
      url: 'https://via.placeholder.com/300x300/ADD8E6/000000?text=Nasaline+Kids',
      alt: 'Nasaline Kids Spray',
      isPrimary: true 
    }],
    specifications: {
      packageSize: 'Chai xịt 30ml',
      unit: 'chai',
      barcode: '8934567890128'
    }
  },

  // Kem bôi cho trẻ
  {
    name: 'Kem Chống Hăm Tã Bepanthen Baby',
    nameEn: 'Bepanthen Baby Diaper Rash Cream',
    genericName: 'Dexpanthenol',
    brand: 'Bepanthen',
    manufacturer: 'Bayer',
    type: 'otc',
    category: 'Thuốc cho trẻ em',
    subCategory: 'Chăm sóc da',
    description: 'Kem chống hăm tã, bảo vệ và phục hồi da bé. An toàn, không chứa paraben.',
    indications: [
      'Phòng ngừa và điều trị hăm tã',
      'Kích ứng da nhẹ',
      'Phục hồi da bị tổn thương',
      'Bảo vệ da vùng tã'
    ],
    dosage: 'Thoa một lớp mỏng lên vùng da bị hăm sau khi thay tã',
    usage: 'Làm sạch và lau khô da trước khi thoa',
    storage: 'Nhiệt độ dưới 25°C',
    price: 180000,
    originalPrice: 200000,
    stock: 90,
    images: [{ 
      url: 'https://via.placeholder.com/300x300/FFE4E1/000000?text=Bepanthen+Baby',
      alt: 'Bepanthen Baby Cream',
      isPrimary: true 
    }],
    specifications: {
      packageSize: 'Tuýp 30g',
      unit: 'tuýp',
      barcode: '8934567890129'
    },
    isFeatured: true
  },

  // Siro tăng cường miễn dịch
  {
    name: 'Siro Tăng Sức Đề Kháng Immunokid',
    nameEn: 'Immunokid Immunity Booster Syrup',
    genericName: 'Echinacea + Vitamin C + Zinc',
    brand: 'ImmunoKid',
    manufacturer: 'Pymepharco',
    type: 'supplement',
    category: 'Thuốc cho trẻ em',
    subCategory: 'Tăng cường miễn dịch',
    description: 'Siro tăng cường hệ miễn dịch, giúp bé khỏe mạnh, ít ốm vặt.',
    indications: [
      'Tăng cường sức đề kháng',
      'Phòng ngừa cảm cúm',
      'Hỗ trợ điều trị nhiễm khuẩn',
      'Trẻ hay ốm vặt'
    ],
    dosage: 'Trẻ 1-3 tuổi: 5ml/ngày. Trẻ 3-6 tuổi: 10ml/ngày',
    usage: 'Uống sau bữa ăn',
    storage: 'Nơi khô mát',
    price: 110000,
    stock: 130,
    images: [{ 
      url: 'https://via.placeholder.com/300x300/90EE90/000000?text=ImmunoKid',
      alt: 'ImmunoKid Syrup',
      isPrimary: true 
    }],
    specifications: {
      packageSize: 'Chai 100ml',
      unit: 'chai',
      barcode: '8934567890130'
    }
  },

  // DHA cho trẻ
  {
    name: 'DHA Omega-3 Cho Trẻ Em (Viên Nang Mềm)',
    nameEn: 'DHA Omega-3 Softgels for Kids',
    genericName: 'DHA + EPA',
    brand: 'SmartKid DHA',
    manufacturer: 'Nordic Naturals',
    type: 'supplement',
    category: 'Thuốc cho trẻ em',
    subCategory: 'DHA & Omega-3',
    description: 'DHA từ dầu cá biển sâu, hỗ trợ phát triển não bộ và thị lực cho trẻ.',
    indications: [
      'Hỗ trợ phát triển não bộ',
      'Cải thiện trí nhớ, tập trung',
      'Hỗ trợ thị lực',
      'Tăng cường miễn dịch'
    ],
    dosage: 'Trẻ 2-6 tuổi: 1 viên/ngày. Trẻ trên 6 tuổi: 2 viên/ngày',
    usage: 'Uống sau bữa ăn',
    storage: 'Nơi khô mát, tránh ánh sáng',
    price: 250000,
    originalPrice: 280000,
    stock: 100,
    images: [{ 
      url: 'https://via.placeholder.com/300x300/4169E1/FFFFFF?text=SmartKid+DHA',
      alt: 'SmartKid DHA',
      isPrimary: true 
    }],
    specifications: {
      packageSize: 'Hộp 60 viên',
      unit: 'hộp',
      barcode: '8934567890131'
    },
    isFeatured: true
  },

  // Thuốc nhỏ mắt cho trẻ
  {
    name: 'Nước Nhỏ Mắt Rohto Kids',
    nameEn: 'Rohto Kids Eye Drops',
    genericName: 'Sodium Chloride + Vitamin B12',
    brand: 'Rohto Kids',
    manufacturer: 'Rohto',
    type: 'otc',
    category: 'Thuốc cho trẻ em',
    subCategory: 'Thuốc mắt',
    description: 'Nước nhỏ mắt dành cho trẻ em, giúp làm sạch, dịu mát mắt.',
    indications: [
      'Vệ sinh mắt',
      'Mắt khô, mỏi mắt',
      'Kích ứng mắt nhẹ',
      'Sau khi bơi'
    ],
    dosage: 'Nhỏ 1-2 giọt mỗi mắt, 2-3 lần/ngày',
    usage: 'Nhỏ vào khoang kết mạc',
    storage: 'Nhiệt độ phòng, tránh ánh sáng',
    price: 55000,
    stock: 110,
    images: [{ 
      url: 'https://via.placeholder.com/300x300/00CED1/000000?text=Rohto+Kids',
      alt: 'Rohto Kids Eye Drops',
      isPrimary: true 
    }],
    specifications: {
      packageSize: 'Chai 10ml',
      unit: 'chai',
      barcode: '8934567890132'
    }
  }
];

async function seedChildrenProducts() {
  try {
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║                                                               ║');
    console.log('║         THÊM SẢN PHẨM DÀNH CHO TRẺ NHỎ VÀO DATABASE         ║');
    console.log('║                                                               ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');

    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dh_pharmacy';
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected\n');

    // Generate slugs
    console.log('🔄 Generating slugs...');
    childrenProducts.forEach(product => {
      if (!product.slug) {
        product.slug = product.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
    });
    console.log('✅ Slugs generated\n');

    // Insert products
    console.log('💊 Inserting children products...');
    let insertedCount = 0;
    let skippedCount = 0;

    for (const productData of childrenProducts) {
      try {
        // Check if product already exists
        const existing = await Product.findOne({ slug: productData.slug });
        if (existing) {
          console.log(`⏭️  Skipped: ${productData.name} (already exists)`);
          skippedCount++;
          continue;
        }

        const product = await Product.create(productData);
        console.log(`✅ Added: ${product.name}`);
        insertedCount++;
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⏭️  Skipped: ${productData.name} (duplicate)`);
          skippedCount++;
        } else {
          console.error(`❌ Error adding ${productData.name}:`, error.message);
        }
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('📊 SUMMARY:');
    console.log(`   Total products: ${childrenProducts.length}`);
    console.log(`   ✅ Inserted: ${insertedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Show categories
    const categories = await Product.distinct('category');
    console.log('📋 Available categories:');
    categories.forEach(cat => console.log(`   - ${cat}`));
    console.log();

    // Show children products count
    const childrenCount = await Product.countDocuments({ category: 'Thuốc cho trẻ em' });
    console.log(`👶 Total children products in database: ${childrenCount}\n`);

    console.log('🎉 Done! Children products added successfully!\n');
    console.log('📝 Next steps:');
    console.log('   1. Restart server: npm run dev');
    console.log('   2. Visit: http://localhost:3000/pages/products.html');
    console.log('   3. Filter by category: "Thuốc cho trẻ em"\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run
seedChildrenProducts();
