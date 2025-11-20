# Hướng dẫn Chạy Web - DH Pharmacy

## 📋 Yêu cầu hệ thống

Trước khi chạy, đảm bảo bạn đã cài đặt:

1. **Node.js** (phiên bản 18 trở lên)
   - Tải về: https://nodejs.org/
   - Kiểm tra: `node --version`

2. **MongoDB** (phiên bản 6 trở lên)
   - Tải về: https://www.mongodb.com/try/download/community
   - Hoặc sử dụng MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

3. **npm** (thường đi kèm với Node.js)
   - Kiểm tra: `npm --version`

---

## 🚀 Các bước chạy web

### Bước 1: Cài đặt Dependencies

Mở terminal/command prompt trong thư mục dự án và chạy:

```bash
npm install
```

Lệnh này sẽ cài đặt tất cả các package cần thiết từ `package.json`.

### Bước 2: Cấu hình MongoDB

#### Option A: MongoDB Local (Khuyến nghị cho development)

1. Khởi động MongoDB service:
   - **Windows**: MongoDB thường tự động chạy như một service
   - **macOS**: `brew services start mongodb-community`
   - **Linux**: `sudo systemctl start mongod`

2. Kiểm tra MongoDB đang chạy:
   ```bash
   mongosh
   # Hoặc: mongo (phiên bản cũ)
   ```

#### Option B: MongoDB Atlas (Cloud - Không cần cài đặt)

1. Đăng ký tài khoản tại: https://www.mongodb.com/cloud/atlas
2. Tạo cluster miễn phí
3. Lấy connection string (sẽ dùng trong bước 3)

### Bước 3: Tạo file .env

Tạo file `.env` trong thư mục gốc của dự án với nội dung:

```env
# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database (chọn một trong hai)
# Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/dh-pharmacy

# Hoặc MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dh-pharmacy

# JWT Secret (thay đổi thành key bất kỳ)
JWT_SECRET=dh-pharmacy-super-secret-key-change-in-production
JWT_EXPIRE=7d
```

**Lưu ý**: Nếu dùng MongoDB Atlas, thay `username`, `password`, và `cluster` bằng thông tin thực tế của bạn.

### Bước 4: Seed Database (Tạo dữ liệu mẫu)

Chạy script để tạo dữ liệu mẫu (60 sản phẩm, 30 users, 50 orders):

```bash
node scripts/seed.js
```

Bạn sẽ thấy output như:
```
✅ MongoDB connected
🗑️  Clearing existing data...
👥 Seeding users...
✅ Created 30 users
💊 Seeding products...
✅ Created 60 products
📦 Seeding orders...
✅ Created 50 orders
🎁 Seeding promotions...
✅ Created 2 promotions

🎉 Database seeded successfully!
```

### Bước 5: Chạy Server

#### Development Mode (với auto-reload):

```bash
npm run dev
```

#### Production Mode:

```bash
npm start
```

Bạn sẽ thấy:
```
✅ MongoDB connected
🚀 Server running on port 3000
📱 Environment: development
```

---

## 🌐 Truy cập Website

Sau khi server chạy thành công, mở trình duyệt và truy cập:

### Frontend Pages:

- **Trang chủ**: http://localhost:3000/pages/index.html
- **Sản phẩm**: http://localhost:3000/pages/products.html
- **Giỏ hàng**: http://localhost:3000/pages/cart.html
- **Đăng nhập**: http://localhost:3000/pages/login.html
- **Đăng ký**: http://localhost:3000/pages/register.html

### Admin Dashboard:

- **Dashboard**: http://localhost:3000/admin/pages/dashboard.html

### API Endpoints:

- **Health Check**: http://localhost:3000/api/health
- **API Base**: http://localhost:3000/api

---

## 🔑 Tài khoản Test

Sau khi seed database, bạn có thể đăng nhập với:

### Admin:
- **Email**: `admin@dhpharmacy.com`
- **Password**: `admin123`

### Dược sĩ:
- **Email**: `pharmacist@dhpharmacy.com`
- **Password**: `pharmacist123`

### Khách hàng:
- **Email**: `customer1@example.com`
- **Password**: `customer123`

---

## ⚠️ Xử lý Lỗi Thường gặp

### Lỗi: "Cannot find module"
```bash
# Giải pháp: Cài đặt lại dependencies
npm install
```

### Lỗi: "MongoDB connection error"
```bash
# Kiểm tra MongoDB đang chạy:
# Windows: Services > MongoDB
# macOS/Linux: sudo systemctl status mongod

# Hoặc kiểm tra connection string trong .env
```

### Lỗi: "Port 3000 already in use"
```bash
# Thay đổi port trong .env:
PORT=3001

# Hoặc dừng process đang dùng port 3000
```

### Lỗi: "EADDRINUSE"
```bash
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9
```

---

## 📝 Lưu ý

1. **Development Mode**: Sử dụng `npm run dev` để tự động reload khi code thay đổi
2. **Production Mode**: Sử dụng `npm start` cho môi trường production
3. **Database**: Dữ liệu sẽ được lưu trong MongoDB. Nếu muốn reset, chạy lại `node scripts/seed.js`
4. **Port**: Mặc định là 3000, có thể thay đổi trong file `.env`

---

## 🎯 Bước tiếp theo

Sau khi web chạy thành công:

1. ✅ Đăng ký tài khoản mới hoặc đăng nhập với tài khoản test
2. ✅ Xem danh sách sản phẩm
3. ✅ Thêm sản phẩm vào giỏ hàng
4. ✅ Tạo đơn hàng
5. ✅ Quản lý đơn hàng trong Admin Dashboard

---

## 💡 Tips

- Sử dụng **Postman** hoặc **Thunder Client** để test API
- Xem **API_DOCUMENTATION.md** để biết các endpoints có sẵn
- Xem **README.md** để biết thêm thông tin về dự án

---

## 🆘 Cần hỗ trợ?

Nếu gặp vấn đề, kiểm tra:
1. Node.js version: `node --version` (cần >= 18)
2. MongoDB đang chạy
3. File `.env` đã được tạo đúng
4. Dependencies đã được cài đặt: `npm install`

Chúc bạn thành công! 🎉

