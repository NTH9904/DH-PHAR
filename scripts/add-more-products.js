const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../backend/models/Product');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dh-pharmacy', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// More realistic products
const moreProducts = [
  // Thuốc tim mạch
  {
    name: 'Aspirin 100mg',
    genericName: 'Acetylsalicylic Acid',
    brand: 'Aspirin Bayer',
    manufacturer: 'Bayer',
    type: 'prescription',
    category: 'Thuốc tim mạch',
    description: 'Thuốc chống đông máu, phòng ngừa tai biến mạch máu não',
    indications: ['Phòng ngừa nhồi máu cơ tim', 'Phòng ngừa tai biến mạch máu não'],
    dosage: '1 viên/ngày',
    usage: {
      instructions: 'Uống sau ăn, dùng lâu dài theo chỉ định',
      ageGroups: ['adult', 'senior']
    },
    diseases: ['tim mạch', 'huyết áp'],
    price: 55000,
    stock: 300,
    images: [{ url: '/images/products/aspirin.jpg', isPrimary: true }]
  },
  {
    name: 'Atorvastatin 20mg',
    genericName: 'Atorvastatin',
    brand: 'Lipitor',
    manufacturer: 'Pfizer',
    type: 'prescription',
    category: 'Thuốc tim mạch',
    description: 'Thuốc giảm cholesterol, phòng ngừa bệnh tim mạch',
    indications: ['Tăng cholesterol máu', 'Phòng ngừa bệnh tim mạch'],
    dosage: '1 viên/ngày vào buổi tối',
    usage: {
      instructions: 'Uống vào buổi tối, có thể uống trước hoặc sau ăn',
      ageGroups: ['adult', 'senior']
    },
    price: 120000,
    stock: 200,
    images: [{ url: '/images/products/atorvastatin.jpg', isPrimary: true }]
  },

  // Thuốc tiểu đường
  {
    name: 'Metformin 500mg',
    genericName: 'Metformin HCl',
    brand: 'Glucophage',
    manufacturer: 'Merck',
    type: 'prescription',
    category: 'Thuốc tiểu đường',
    description: 'Thuốc điều trị đái tháo đường type 2',
    indications: ['Đái tháo đường type 2'],
    dosage: '500mg x 2-3 lần/ngày',
    usage: {
      instructions: 'Uống cùng hoặc sau bữa ăn',
      ageGroups: ['adult', 'senior']
    },
    diseases: ['tiểu đường'],
    price: 45000,
    stock: 250,
    images: [{ url: '/images/products/metformin.jpg', isPrimary: true }]
  },

  // Thuốc trẻ em
  {
    name: 'Siro Ho Trẻ Em Prospan Kids',
    genericName: 'Chiết xuất lá thường xuân',
    brand: 'Prospan',
    manufacturer: 'Engelhard',
    type: 'otc',
    category: 'Thuốc trẻ em',
    description: 'Siro ho dành riêng cho trẻ em, vị dâu thơm ngon',
    indications: ['Ho có đờm ở trẻ em', 'Viêm phế quản'],
    dosage: 'Trẻ 1-5 tuổi: 2.5ml x 3 lần/ngày. Trẻ 6-12 tuổi: 5ml x 3 lần/ngày',
    usage: {
      instructions: 'Uống trước hoặc sau ăn, lắc đều trước khi dùng',
      ageGroups: ['toddler', 'child']
    },
    price: 135000,
    stock: 180,
    images: [{ url: '/images/products/prospan-kids.jpg', isPrimary: true }]
  },
  {
    name: 'Paracetamol 250mg Trẻ Em',
    genericName: 'Paracetamol',
    brand: 'Hapacol Kids',
    manufacturer: 'DHG Pharma',
    type: 'otc',
    category: 'Thuốc trẻ em',
    description: 'Thuốc hạ sốt, giảm đau dành cho trẻ em',
    indications: ['Hạ sốt', 'Giảm đau nhẹ'],
    dosage: 'Trẻ 6-12 tuổi: 1-2 viên/lần, 3-4 lần/ngày',
    usage: {
      instructions: 'Uống sau ăn với nhiều nước',
      ageGroups: ['child', 'teen']
    },
    price: 22000,
    stock: 400,
    images: [{ url: '/images/products/hapacol-kids.jpg', isPrimary: true }]
  },

  // Vitamin cho trẻ
  {
    name: 'Vitamin Tổng Hợp Cho Trẻ Em',
    genericName: 'Multivitamin',
    brand: 'Kiddi Pharmaton',
    manufacturer: 'Boehringer Ingelheim',
    type: 'supplement',
    category: 'Thực phẩm chức năng',
    description: 'Vitamin tổng hợp giúp trẻ ăn ngon, phát triển toàn diện',
    indications: ['Bổ sung vitamin cho trẻ', 'Biếng ăn', 'Chậm lớn'],
    dosage: 'Trẻ 1-6 tuổi: 5ml/ngày. Trẻ trên 6 tuổi: 10ml/ngày',
    usage: {
      instructions: 'Uống sau bữa ăn sáng',
      ageGroups: ['toddler', 'child', 'teen']
    },
    price: 185000,
    stock: 220,
    images: [{ url: '/images/products/kiddi-pharmaton.jpg', isPrimary: true }]
  },
  {
    name: 'Canxi + D3 Cho Trẻ Em',
    genericName: 'Calcium Carbonate + Vitamin D3',
    brand: 'Calcimex',
    manufacturer: 'Pymepharco',
    type: 'supplement',
    category: 'Thực phẩm chức năng',
    description: 'Bổ sung canxi và vitamin D3 giúp xương chắc khỏe',
    indications: ['Bổ sung canxi', 'Phòng ngừa còi xương', 'Tăng chiều cao'],
    dosage: '1-2 viên/ngày',
    usage: {
      instructions: 'Uống sau bữa ăn hoặc trước khi ngủ',
      ageGroups: ['child', 'teen']
    },
    price: 95000,
    stock: 300,
    images: [{ url: '/images/products/calcimex.jpg', isPrimary: true }]
  },

  // Thuốc dị ứng
  {
    name: 'Cetirizine 10mg',
    genericName: 'Cetirizine',
    brand: 'Zyrtec',
    manufacturer: 'UCB',
    type: 'otc',
    category: 'Thuốc dị ứng',
    description: 'Thuốc chống dị ứng, giảm ngứa, mề đay',
    indications: ['Viêm mũi dị ứng', 'Mề đay', 'Ngứa'],
    dosage: 'Người lớn: 1 viên/ngày',
    usage: {
      instructions: 'Uống vào buổi tối trước khi ngủ',
      ageGroups: ['teen', 'adult', 'senior']
    },
    diseases: ['dị ứng'],
    symptoms: ['ngứa', 'mề đay', 'sổ mũi'],
    price: 48000,
    stock: 280,
    images: [{ url: '/images/products/cetirizine.jpg', isPrimary: true }]
  },
  {
    name: 'Loratadine 10mg',
    genericName: 'Loratadine',
    brand: 'Claritin',
    manufacturer: 'Schering-Plough',
    type: 'otc',
    category: 'Thuốc dị ứng',
    description: 'Thuốc chống dị ứng không gây buồn ngủ',
    indications: ['Viêm mũi dị ứng', 'Mề đay'],
    dosage: '1 viên/ngày',
    usage: {
      instructions: 'Uống bất kỳ lúc nào trong ngày',
      ageGroups: ['teen', 'adult', 'senior']
    },
    price: 52000,
    stock: 260,
    images: [{ url: '/images/products/loratadine.jpg', isPrimary: true }]
  },

  // Thuốc bôi ngoài da
  {
    name: 'Kem Bôi Trị Mụn Acnes',
    genericName: 'Benzoyl Peroxide',
    brand: 'Acnes',
    manufacturer: 'Rohto',
    type: 'otc',
    category: 'Thuốc ngoài da',
    description: 'Kem trị mụn, kháng khuẩn, giảm viêm',
    indications: ['Mụn trứng cá', 'Mụn viêm'],
    dosage: 'Bôi 1-2 lần/ngày lên vùng da bị mụn',
    usage: {
      instructions: 'Rửa mặt sạch, lau khô rồi bôi kem',
      ageGroups: ['teen', 'adult']
    },
    price: 65000,
    stock: 350,
    images: [{ url: '/images/products/acnes.jpg', isPrimary: true }]
  },
  {
    name: 'Dầu Gió Xanh Con Ó',
    genericName: 'Menthol + Camphor',
    brand: 'Con Ó',
    manufacturer: 'Công ty Dược phẩm Hà Nội',
    type: 'otc',
    category: 'Thuốc ngoài da',
    description: 'Dầu gió truyền thống, giảm đau đầu, say xe',
    indications: ['Đau đầu', 'Say xe', 'Ngứa do côn trùng cắn'],
    dosage: 'Xoa bóp nhẹ vào vùng thái dương, trán, gáy',
    usage: {
      instructions: 'Bôi ngoài da, tránh vùng mắt và niêm mạc',
      ageGroups: ['child', 'teen', 'adult', 'senior']
    },
    price: 15000,
    stock: 500,
    images: [{ url: '/images/products/dau-gio-xanh.jpg', isPrimary: true }]
  },

  // Thuốc mắt
  {
    name: 'Thuốc Nhỏ Mắt Rohto V',
    genericName: 'Vitamin B12 + Tetrahydrozoline',
    brand: 'Rohto',
    manufacturer: 'Rohto',
    type: 'otc',
    category: 'Thuốc mắt',
    description: 'Thuốc nhỏ mắt giảm mỏi mắt, đỏ mắt',
    indications: ['Mỏi mắt', 'Đỏ mắt', 'Khô mắt'],
    dosage: 'Nhỏ 1-2 giọt/lần, 3-4 lần/ngày',
    usage: {
      instructions: 'Nhỏ vào khoang kết mạc dưới',
      ageGroups: ['teen', 'adult', 'senior']
    },
    price: 58000,
    stock: 200,
    images: [{ url: '/images/products/rohto-v.jpg', isPrimary: true }]
  }
];

function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

moreProducts.forEach(product => {
  product.slug = generateSlug(product.name);
  product.isFeatured = Math.random() > 0.7;
  product.salesCount = Math.floor(Math.random() * 500);
  product.viewCount = Math.floor(Math.random() * 1000);
  product.ratings = {
    average: (Math.random() * 2 + 3).toFixed(1),
    count: Math.floor(Math.random() * 100)
  };
});

async function addMoreProducts() {
  try {
    console.log('🔄 Đang thêm thêm sản phẩm...');

    for (const productData of moreProducts) {
      const existing = await Product.findOne({ slug: productData.slug });
      
      if (existing) {
        await Product.findByIdAndUpdate(existing._id, productData);
        console.log(`✅ Cập nhật: ${productData.name}`);
      } else {
        await Product.create(productData);
        console.log(`✅ Thêm mới: ${productData.name}`);
      }
    }

    console.log(`\n🎉 Hoàn thành! Đã xử lý ${moreProducts.length} sản phẩm`);
    
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

addMoreProducts();
