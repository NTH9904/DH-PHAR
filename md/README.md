# DH Pharmacy - E-Pharmacy Platform

Website bán thuốc trực tuyến cho thị trường Việt Nam với đầy đủ tính năng tư vấn dược, giao hàng nhanh và tuân thủ pháp luật.

## 🏗️ Kiến trúc Hệ thống

```
┌─────────────────┐
│   Frontend      │  HTML, CSS, JavaScript (Mobile-first)
│   (Client)      │
└────────┬────────┘
         │
         │ HTTPS/REST API
         │
┌────────▼────────┐
│   Backend API   │  Node.js + Express
│   (Server)      │
└────────┬────────┘
         │
    ┌────┴────┬──────────┬──────────┐
    │         │          │          │
┌───▼───┐ ┌──▼───┐ ┌────▼────┐ ┌───▼────┐
│MongoDB│ │Elastic│ │AWS S3/ │ │Payment │
│       │ │search │ │R2      │ │Gateway │
└───────┘ └───────┘ └────────┘ └────────┘
```

## 📋 Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Responsive Design (Mobile-first)
- Progressive Web App (PWA) ready

### Backend
- Node.js 18+
- Express.js 4.x
- MongoDB với Mongoose
- JWT Authentication
- OAuth 2.0 (Google, Facebook)

### Third-party Services
- Payment: VNPay, MoMo, ZaloPay
- SMS: Twilio
- Email: SendGrid
- Shipping: Giao Hàng Nhanh, Viettel Post
- Maps: Google Maps API
- Storage: AWS S3 / Cloudflare R2
- Search: Elasticsearch

## 🚀 Cài đặt và Chạy Project

### Yêu cầu hệ thống
- Node.js >= 18.0.0
- MongoDB >= 6.0
- npm hoặc yarn

### Bước 1: Clone và cài đặt dependencies

```bash
npm install
```

### Bước 2: Cấu hình môi trường

Tạo file `.env` trong thư mục gốc:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/dh-pharmacy

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# AWS S3 / Cloudflare R2
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=ap-southeast-1
S3_BUCKET_NAME=dh-pharmacy-uploads

# Payment
VNPAY_TMN_CODE=your-tmn-code
VNPAY_HASH_SECRET=your-hash-secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html

MOMO_PARTNER_CODE=your-partner-code
MOMO_ACCESS_KEY=your-access-key
MOMO_SECRET_KEY=your-secret-key

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+84xxxxxxxxx

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@dhpharmacy.com

# Shipping
GHN_API_KEY=your-ghn-api-key
GHN_SHOP_ID=your-shop-id

# Google Maps
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200
```

### Bước 3: Khởi tạo Database

```bash
# Chạy script seed data
node scripts/seed.js
```

### Bước 4: Chạy server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server sẽ chạy tại: `http://localhost:3000`

## 📁 Cấu trúc Thư mục

```
dh-pharmacy/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── cloudinary.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── userController.js
│   │   └── prescriptionController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── upload.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   └── Prescription.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   └── users.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   ├── sendEmail.js
│   │   └── sendSMS.js
│   └── validators/
│       └── productValidator.js
├── frontend/
│   ├── css/
│   │   ├── main.css
│   │   ├── components.css
│   │   └── responsive.css
│   ├── js/
│   │   ├── main.js
│   │   ├── api.js
│   │   ├── cart.js
│   │   └── auth.js
│   ├── pages/
│   │   ├── index.html
│   │   ├── products.html
│   │   ├── product-detail.html
│   │   ├── cart.html
│   │   ├── checkout.html
│   │   ├── profile.html
│   │   ├── orders.html
│   │   ├── consultation.html
│   │   ├── about.html
│   │   └── contact.html
│   └── assets/
│       ├── images/
│       └── icons/
├── admin/
│   ├── css/
│   ├── js/
│   └── pages/
│       ├── dashboard.html
│       ├── products.html
│       ├── orders.html
│       └── users.html
├── scripts/
│   ├── seed.js
│   └── migrate.js
├── tests/
│   ├── unit/
│   └── integration/
├── server.js
├── package.json
└── README.md
```

## 🔐 Bảo mật

- ✅ Mã hóa dữ liệu (AES-256)
- ✅ HTTPS/SSL certificate
- ✅ GDPR/PDPA compliance
- ✅ 2FA authentication
- ✅ Rate limiting
- ✅ Input validation & sanitization
- ✅ SQL injection protection
- ✅ XSS protection

## 📚 API Documentation

Xem chi tiết tại: `/api-docs` (Swagger UI)

### Endpoints chính:

- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/products` - Danh sách sản phẩm
- `GET /api/products/:id` - Chi tiết sản phẩm
- `POST /api/orders` - Tạo đơn hàng
- `GET /api/orders` - Lịch sử đơn hàng
- `POST /api/prescriptions/upload` - Upload đơn thuốc

## 🚢 Deployment

### Production Checklist

1. Set `NODE_ENV=production`
2. Cấu hình SSL certificate
3. Setup MongoDB Atlas hoặc self-hosted
4. Cấu hình CDN cho static files
5. Setup monitoring (PM2, New Relic)
6. Backup database định kỳ

## 📄 License

ISC

## 👥 Support

Liên hệ: support@dhpharmacy.com

