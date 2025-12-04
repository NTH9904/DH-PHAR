
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../backend/models/User');
const Product = require('../backend/models/Product');
const Order = require('../backend/models/Order');
const Prescription = require('../backend/models/Prescription');
const Promotion = require('../backend/models/Promotion');

// Sample products data (60 medicines)
const productsData = [
  {
    name: 'Paracetamol 500mg',
    nameEn: 'Paracetamol 500mg',
    genericName: 'Paracetamol',
    brand: 'Hapacol',
    manufacturer: 'DHG Pharma',
    type: 'otc',
    category: 'Thuốc giảm đau, hạ sốt',
    description: 'Thuốc giảm đau, hạ sốt',
    indications: ['Giảm đau', 'Hạ sốt'],
    dosage: 'Người lớn: 1-2 viên/lần, 3-4 lần/ngày',
    usage: {
      instructions: 'Uống sau ăn',
      ageGroups: ['child', 'teen', 'adult', 'senior']
    },
    storage: 'Nơi khô ráo, tránh ánh sáng',
    price: 25000,
    stock: 100,
    images: [{ url: 'https://nhathuoclongchau.com.vn/images/products/2020/08/00003847_hapacol-500-1_5e8e8c0e.jpg', isPrimary: true }]
  },
  {
    name: 'Amoxicillin 500mg',
    nameEn: 'Amoxicillin 500mg',
    genericName: 'Amoxicillin',
    brand: 'Amoxicillin Stada',
    manufacturer: 'Stada',
    type: 'prescription',
    category: 'Kháng sinh',
    description: 'Kháng sinh điều trị nhiễm khuẩn',
    indications: ['Nhiễm khuẩn đường hô hấp', 'Nhiễm khuẩn đường tiết niệu'],
    dosage: 'Người lớn: 500mg x 3 lần/ngày',
    contraindications: ['Dị ứng Penicillin'],
    usage: {
      instructions: 'Uống sau ăn, đủ liệu trình',
      ageGroups: ['child', 'teen', 'adult', 'senior']
    },
    price: 45000,
    stock: 50,
    images: [{ url: 'https://nhathuoclongchau.com.vn/images/products/2020/08/00003847_amoxicillin-500-1_5e8e8c0e.jpg', isPrimary: true }]
  },
  {
    name: 'Vitamin C 1000mg',
    nameEn: 'Vitamin C 1000mg',
    genericName: 'Ascorbic Acid',
    brand: 'Vitamin C',
    manufacturer: 'DHG Pharma',
    type: 'supplement',
    category: 'Thực phẩm chức năng',
    description: 'Bổ sung Vitamin C',
    indications: ['Tăng sức đề kháng', 'Chống oxy hóa'],
    dosage: '1 viên/ngày',
    usage: {
      instructions: 'Uống sau ăn sáng',
      ageGroups: ['teen', 'adult', 'senior']
    },
    price: 35000,
    stock: 200,
    images: [{ url: 'https://nhathuoclongchau.com.vn/images/products/2020/08/00003847_vitamin-c-1_5e8e8c0e.jpg', isPrimary: true }]
  },
  // Add more products...
];

// Helper function to generate slug
function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Generate slugs for existing products
productsData.forEach(product => {
  if (!product.slug) {
    product.slug = generateSlug(product.name);
  }
});

// Age group mapping for categories
const categoryAgeGroups = {
  'Thuốc giảm đau, hạ sốt': ['child', 'teen', 'adult', 'senior'],
  'Kháng sinh': ['child', 'teen', 'adult', 'senior'],
  'Thuốc ho': ['toddler', 'child', 'teen', 'adult', 'senior'],
  'Thuốc cảm': ['toddler', 'child', 'teen', 'adult', 'senior'],
  'Thực phẩm chức năng': ['teen', 'adult', 'senior']
};

// Generate more products
for (let i = 4; i <= 60; i++) {
  const categories = ['Thuốc giảm đau, hạ sốt', 'Kháng sinh', 'Thuốc ho', 'Thuốc cảm', 'Thực phẩm chức năng'];
  const types = ['otc', 'prescription', 'supplement'];
  const randomType = types[Math.floor(Math.random() * types.length)];
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  
  const productName = `Thuốc ${i}`;
  productsData.push({
    name: productName,
    genericName: `Hoạt chất ${i}`,
    brand: `Brand ${i}`,
    manufacturer: 'DHG Pharma',
    type: randomType,
    category: randomCategory,
    description: `Mô tả sản phẩm ${i}`,
    indications: ['Công dụng 1', 'Công dụng 2'],
    dosage: 'Theo chỉ định của bác sĩ',
    usage: {
      instructions: 'Theo chỉ định của bác sĩ',
      ageGroups: categoryAgeGroups[randomCategory] || ['adult']
    },
    price: Math.floor(Math.random() * 200000) + 10000,
    stock: Math.floor(Math.random() * 200) + 10,
    slug: generateSlug(productName) + '-' + i, // Ensure unique slug
    images: [{ url: 'https://via.placeholder.com/300', isPrimary: true }]
  });
}

// Sample users
const usersData = [
  {
    name: 'Admin User',
    email: 'admin@dhpharmacy.com',
    password: 'admin123',
    role: 'admin',
    phone: '0900000001'
  },
  {
    name: 'Dược sĩ Nguyễn Văn A',
    email: 'pharmacist@dhpharmacy.com',
    password: 'pharmacist123',
    role: 'pharmacist',
    phone: '0900000002'
  },
  {
    name: 'Nguyễn Văn B',
    email: 'customer1@example.com',
    password: 'customer123',
    role: 'customer',
    phone: '0900000003'
  }
];

// Generate more customers
for (let i = 4; i <= 30; i++) {
  usersData.push({
    name: `Khách hàng ${i}`,
    email: `customer${i}@example.com`,
    password: 'customer123',
    role: 'customer',
    phone: `09000000${String(i).padStart(2, '0')}`
  });
}

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dh_pharmacy', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Prescription.deleteMany({});
    await Promotion.deleteMany({});

    // Seed Users
    console.log('👥 Seeding users...');
    const users = [];
    for (const userData of usersData) {
      try {
        // Use create so pre-save hooks (password hashing) run
        const user = await User.create(userData);
        users.push(user);
      } catch (error) {
        // If duplicate key (email), try updating password or skip
        if (error.code === 11000 && error.keyPattern?.email) {
          // Update existing user to ensure password is hashed
          const existing = await User.findOne({ email: userData.email }).select('+password');
          if (existing) {
            existing.password = userData.password;
            await existing.save();
            users.push(existing);
          }
        } else {
          throw error;
        }
      }
    }
    console.log(`✅ Created/updated ${users.length} users`);

    // Seed Products
    console.log('💊 Seeding products...');
    // Use create instead of insertMany to trigger pre-save hooks, or create in batches
    const products = [];
    for (const productData of productsData) {
      try {
        const product = await Product.create(productData);
        products.push(product);
      } catch (error) {
        // If duplicate slug, try with timestamp
        if (error.code === 11000 && error.keyPattern?.slug) {
          productData.slug = productData.slug + '-' + Date.now();
          const product = await Product.create(productData);
          products.push(product);
        } else {
          throw error;
        }
      }
    }
    console.log(`✅ Created ${products.length} products`);

    // Seed Orders
    console.log('📦 Seeding orders...');
    const orders = [];
    for (let i = 0; i < 50; i++) {
      const customer = users[Math.floor(Math.random() * (users.length - 2)) + 2]; // Skip admin and pharmacist
      const itemCount = Math.floor(Math.random() * 3) + 1;
      const orderItems = [];
      let subtotal = 0;

      for (let j = 0; j < itemCount; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const itemTotal = product.price * quantity;
        subtotal += itemTotal;

        orderItems.push({
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          subtotal: itemTotal
        });
      }

      const shippingFee = subtotal >= 500000 ? 0 : 30000;
      const total = subtotal + shippingFee;

      const statuses = ['pending', 'confirmed', 'processing', 'shipping', 'delivered'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const order = await Order.create({
        orderNumber: `DH${new Date().getFullYear()}${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`,
        user: customer._id,
        items: orderItems,
        subtotal,
        shippingFee,
        total,
        deliveryAddress: {
          name: customer.name,
          phone: customer.phone,
          address: '123 Đường ABC',
          ward: 'Phường 1',
          district: 'Quận 1',
          city: 'TP.HCM'
        },
        paymentMethod: ['cod', 'bank_transfer', 'vnpay'][Math.floor(Math.random() * 3)],
        paymentStatus: status === 'delivered' ? 'paid' : 'pending',
        status: status
      });

      orders.push(order);
    }
    console.log(`✅ Created ${orders.length} orders`);

    // Seed Promotions
    console.log('🎁 Seeding promotions...');
    const promotions = await Promotion.insertMany([
      {
        code: 'WELCOME10',
        name: 'Giảm 10% cho khách hàng mới',
        type: 'percentage',
        value: 10,
        minPurchaseAmount: 100000,
        maxDiscountAmount: 50000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      },
      {
        code: 'FREESHIP',
        name: 'Miễn phí vận chuyển',
        type: 'free_shipping',
        value: 0,
        minPurchaseAmount: 500000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days
      }
    ]);
    console.log(`✅ Created ${promotions.length} promotions`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Login credentials:');
    console.log('   Admin: admin@dhpharmacy.com / admin123');
    console.log('   Pharmacist: pharmacist@dhpharmacy.com / pharmacist123');
    console.log('   Customer: customer1@example.com / customer123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

