const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên thuốc'],
    trim: true,
    index: true
  },
  nameEn: String, // English name
  genericName: {
    type: String,
    required: true,
    index: true // For search by active ingredient
  },
  brand: String,
  manufacturer: String,
  // Product type
  type: {
    type: String,
    enum: ['prescription', 'otc', 'supplement'], // prescription, over-the-counter, thực phẩm chức năng
    required: true,
    index: true
  },
  // Category
  category: {
    type: String,
    required: true,
    index: true
  },
  subCategory: String,
  // Description
  description: String,
  indications: [String], // Công dụng
  contraindications: [String], // Chống chỉ định
  sideEffects: [String], // Tác dụng phụ
  dosage: String, // Liều dùng
  usage: {
    instructions: String, // Cách dùng
    ageGroups: [{
      type: String,
      enum: ['infant', 'toddler', 'child', 'teen', 'adult', 'senior']
    }] // Nhóm tuổi phù hợp
  },
  storage: String, // Bảo quản
  // Disease and Age targeting
  diseases: [String], // Bệnh: ['cảm cúm', 'đau đầu', 'ho', 'sốt']
  symptoms: [String], // Triệu chứng: ['sốt', 'ho', 'đau họng']
  ageGroup: {
    min: Number, // Tuổi tối thiểu (0 = trẻ sơ sinh)
    max: Number, // Tuổi tối đa (null = không giới hạn)
    description: String // 'Trẻ em', 'Người lớn', 'Người cao tuổi'
  },
  // Pricing
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: Number, // Giá gốc (for discounts)
  // Inventory
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  minOrderQuantity: {
    type: Number,
    default: 1
  },
  maxOrderQuantity: {
    type: Number,
    default: 10
  },
  // Images
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  // Specifications
  specifications: {
    packageSize: String, // Quy cách đóng gói
    unit: String, // Đơn vị (viên, chai, hộp)
    expiryDate: Date,
    registrationNumber: String, // Số đăng ký
    barcode: String
  },
  // Drug interactions
  interactions: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    },
    description: String
  }],
  // SEO
  slug: {
    type: String,
    unique: true,
    sparse: true, // Allow multiple null values
    index: true
  },
  metaTitle: String,
  metaDescription: String,
  keywords: [String],
  // Ratings & Reviews
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  // Status
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  // Sales tracking
  salesCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Generate slug from name
ProductSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Text search index
ProductSchema.index({
  name: 'text',
  genericName: 'text',
  description: 'text',
  indications: 'text',
  diseases: 'text',
  symptoms: 'text'
});

module.exports = mongoose.model('Product', ProductSchema);

