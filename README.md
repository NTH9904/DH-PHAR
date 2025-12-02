# 💊 DH Pharmacy - Hệ thống Nhà thuốc Trực tuyến

## 📋 Giới thiệu

DH Pharmacy là hệ thống quản lý nhà thuốc trực tuyến hoàn chỉnh, bao gồm:
- 🛒 Website bán hàng cho khách hàng
- 👨‍💼 Hệ thống quản trị Admin đầy đủ chức năng
- 📱 Responsive design, tương thích mọi thiết bị
- 🔐 Bảo mật cao với JWT authentication

## 🚀 Tính năng chính

### Phía Khách hàng (Frontend)
- ✅ Trang chủ với sản phẩm nổi bật
- ✅ Danh mục sản phẩm theo bệnh và nhóm tuổi
- ✅ Tìm kiếm và lọc sản phẩm thông minh
- ✅ Giỏ hàng và thanh toán
- ✅ Quản lý tài khoản cá nhân
- ✅ Lịch sử đơn hàng
- ✅ Upload đơn thuốc
- ✅ Tư vấn qua Zalo
- ✅ Đánh giá sản phẩm

### Phía Quản trị (Admin)
- ✅ **Dashboard** - Thống kê tổng quan
- ✅ **Quản lý Sản phẩm** - CRUD đầy đủ
- ✅ **Quản lý Đơn hàng** - Workflow hoàn chỉnh
- ✅ **Quản lý Người dùng** - Phân quyền
- ✅ **Quản lý Đơn thuốc** - Duyệt đơn
- ✅ **Quản lý Kho hàng** - Nhập xuất tồn
- ✅ **Quản lý Nhà cung cấp** - Thông tin NCC
- ✅ **Quản lý Khuyến mãi** - Mã giảm giá
- ✅ **Báo cáo & Thống kê** - Biểu đồ trực quan
- ✅ **Cài đặt** - Cấu hình hệ thống

## 🛠️ Công nghệ sử dụng

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling
- **JavaScript (ES6+)** - Logic
- **Chart.js** - Biểu đồ thống kê
- **Responsive Design** - Mobile-first

### Security
- **Helmet** - HTTP headers security
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API protection
- **Input Validation** - Data sanitization

## 📦 Cài đặt

### Yêu cầu hệ thống
- Node.js >= 14.x
- MongoDB >= 4.x
- npm hoặc yarn

### Các bước cài đặt

1. **Clone repository**
```bash
git clone <repository-url>
cd dh-pharmacy
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Cấu hình môi trường**

Tạo file `.env` trong thư mục gốc:
```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/dh-pharmacy

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# File Upload
MAX_FILE_SIZE=5242880
```

4. **Khởi tạo database**
```bash
# Seed dữ liệu mẫu
node scripts/seed.js

# Hoặc seed sản phẩm thực tế
node scripts/seed-realistic-products.js
```

5. **Chạy server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server sẽ chạy tại: `http://localhost:3000`

## 📁 Cấu trúc thư mục

```
dh-pharmacy/
├── backend/
│   ├── config/          # Cấu hình database
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth, error handling
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   └── utils/           # Helper functions
├── frontend/
│   ├── css/            # Stylesheets
│   ├── js/             # JavaScript files
│   ├── images/         # Images
│   └── pages/          # HTML pages
├── admin/
│   ├── ad css/         # Admin styles
│   ├── ad js/          # Admin scripts
│   └── pages/          # Admin pages
├── scripts/            # Database scripts
├── uploads/            # Uploaded files
├── md/                 # Documentation
├── server.js           # Entry point
└── package.json        # Dependencies
```

## 🔐 Tài khoản mặc định

### Admin
- Email: `admin@dhpharmacy.com`
- Password: `admin123`

### User (Test)
- Email: `user@test.com`
- Password: `123456`

## 📚 API Documentation

### Authentication
```
POST /api/auth/register    - Đăng ký
POST /api/auth/login       - Đăng nhập
GET  /api/auth/me          - Thông tin user
PUT  /api/auth/update      - Cập nhật profile
```

### Products
```
GET    /api/products              - Danh sách sản phẩm
GET    /api/products/:id          - Chi tiết sản phẩm
GET    /api/products/slug/:slug   - Sản phẩm theo slug
POST   /api/products              - Tạo sản phẩm (Admin)
PUT    /api/products/:id          - Cập nhật (Admin)
DELETE /api/products/:id          - Xóa (Admin)
```

### Orders
```
GET    /api/orders                - Đơn hàng của user
GET    /api/orders/:id            - Chi tiết đơn hàng
POST   /api/orders                - Tạo đơn hàng
PUT    /api/orders/:id/status     - Cập nhật trạng thái (Admin)
PUT    /api/orders/:id/cancel     - Hủy đơn hàng
GET    /api/orders/admin/all      - Tất cả đơn hàng (Admin)
```

### Users
```
GET    /api/users/admin/all       - Danh sách users (Admin)
GET    /api/users/:id             - Chi tiết user (Admin)
PUT    /api/users/:id             - Cập nhật user (Admin)
DELETE /api/users/:id             - Xóa user (Admin)
```

### Prescriptions
```
GET    /api/prescriptions         - Đơn thuốc của user
POST   /api/prescriptions         - Upload đơn thuốc
GET    /api/prescriptions/admin/all - Tất cả đơn thuốc (Admin)
PUT    /api/prescriptions/:id     - Duyệt/Từ chối (Admin)
```

## 🎨 Giao diện

### Frontend (Khách hàng)
- Trang chủ: `/`
- Sản phẩm: `/pages/products.html`
- Chi tiết SP: `/pages/product-detail.html?id=xxx`
- Giỏ hàng: `/pages/cart.html`
- Thanh toán: `/pages/checkout.html`
- Tài khoản: `/pages/account.html`
- Đăng nhập: `/pages/login.html`
- Đăng ký: `/pages/register.html`

### Admin
- Dashboard: `/admin/pages/dashboard.html`
- Sản phẩm: `/admin/pages/products.html`
- Đơn hàng: `/admin/pages/orders.html`
- Người dùng: `/admin/pages/users.html`
- Đơn thuốc: `/admin/pages/prescriptions.html`
- Kho hàng: `/admin/pages/inventory.html`
- Nhà cung cấp: `/admin/pages/suppliers.html`
- Khuyến mãi: `/admin/pages/promotions.html`
- Báo cáo: `/admin/pages/reports.html`
- Cài đặt: `/admin/pages/settings.html`

## 📊 Database Models

### User
- name, email, password
- phone, address
- role (user/admin)
- loyaltyPoints
- isActive

### Product
- name, genericName, brand
- type, category, subCategory
- price, originalPrice, stock
- description, indications, contraindications
- images, specifications
- diseases, symptoms, ageGroup

### Order
- orderNumber, user
- items (product, quantity, price)
- subtotal, shippingFee, discount, total
- deliveryAddress, deliveryTime
- paymentMethod, paymentStatus
- status, statusHistory

### Prescription
- user, patientName
- doctorName, hospitalName
- prescriptionDate
- images
- status (pending/approved/rejected)
- notes

## 🔧 Scripts hữu ích

```bash
# Seed dữ liệu
npm run seed

# Kiểm tra sản phẩm
node scripts/check-products.js

# Thêm sản phẩm mẫu
node scripts/add-more-products.js

# Cập nhật nhóm tuổi
node scripts/update-age-groups.js

# Fix slug index
node scripts/fix-slug-index.js
```

## 🐛 Troubleshooting

### Lỗi kết nối MongoDB
```bash
# Kiểm tra MongoDB đang chạy
mongod --version

# Khởi động MongoDB
mongod
```

### Lỗi JWT_SECRET
```bash
# Đảm bảo file .env có JWT_SECRET
echo "JWT_SECRET=your-secret-key" >> .env
```

### Lỗi port đã được sử dụng
```bash
# Thay đổi PORT trong .env
PORT=3001
```

## 📖 Tài liệu

- [Hướng dẫn Admin](./ADMIN_GUIDE.md)
- [Hướng dẫn chạy web](./md/HUONG_DAN_CHAY_WEB.md)
- [Khắc phục lỗi](./md/HUONG_DAN_KHAC_PHUC_LOI.md)
- [API Documentation](./md/API_DOCUMENTATION.md)
- [Architecture](./md/ARCHITECTURE.md)

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng:
1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📝 License

Dự án này được phát hành dưới giấy phép MIT.

## 👥 Tác giả

DH Pharmacy Team

## 📞 Liên hệ

- Website: https://dhpharmacy.com
- Email: contact@dhpharmacy.com
- Hotline: 1900 xxxx

---

**Phát triển với ❤️ bởi DH Pharmacy Team**
