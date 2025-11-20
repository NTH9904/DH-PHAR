# 🚀 Hướng dẫn Chạy Web Nhanh - DH Pharmacy

## ⚡ Cách nhanh nhất (Windows)

### 1. Double-click file `start.bat`
Hoặc chạy trong terminal:
```bash
start.bat
```

Script sẽ tự động:
- ✅ Tạo file `.env` nếu chưa có
- ✅ Cài đặt dependencies nếu chưa có
- ✅ Khởi động server

---

## 📝 Cách thủ công (Tất cả hệ điều hành)

### Bước 1: Cài đặt Dependencies
```bash
npm install
```

### Bước 2: Tạo file .env
Tạo file `.env` trong thư mục gốc:

**Windows (PowerShell):**
```powershell
@"
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/dh-pharmacy
JWT_SECRET=dh-pharmacy-secret-key-123
JWT_EXPIRE=7d
"@ | Out-File -FilePath .env -Encoding utf8
```

**macOS/Linux:**
```bash
cat > .env << EOF
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/dh-pharmacy
JWT_SECRET=dh-pharmacy-secret-key-123
JWT_EXPIRE=7d
EOF
```

### Bước 3: Khởi động MongoDB

**Windows:**
- MongoDB thường tự động chạy như service
- Hoặc mở Services và start "MongoDB"

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Hoặc dùng MongoDB Atlas (Cloud - Không cần cài):**
- Đăng ký: https://www.mongodb.com/cloud/atlas
- Lấy connection string và thay vào `.env`

### Bước 4: Tạo dữ liệu mẫu (Optional)
```bash
node scripts/seed.js
```

### Bước 5: Chạy Server
```bash
npm run dev
```

---

## 🌐 Truy cập Website

Sau khi server chạy, mở trình duyệt:

| Trang | URL |
|-------|-----|
| 🏠 Trang chủ | http://localhost:3000/pages/index.html |
| 💊 Sản phẩm | http://localhost:3000/pages/products.html |
| 🛒 Giỏ hàng | http://localhost:3000/pages/cart.html |
| 👤 Đăng nhập | http://localhost:3000/pages/login.html |
| 📊 Admin | http://localhost:3000/admin/pages/dashboard.html |
| 🔍 API Health | http://localhost:3000/api/health |

---

## 🔑 Tài khoản Test

Sau khi chạy `node scripts/seed.js`:

| Vai trò | Email | Password |
|---------|-------|----------|
| 👨‍💼 Admin | admin@dhpharmacy.com | admin123 |
| 👨‍⚕️ Dược sĩ | pharmacist@dhpharmacy.com | pharmacist123 |
| 👤 Khách hàng | customer1@example.com | customer123 |

---

## ⚠️ Xử lý Lỗi

### ❌ "Cannot find module"
```bash
npm install
```

### ❌ "MongoDB connection error"
- Kiểm tra MongoDB đang chạy
- Hoặc dùng MongoDB Atlas (cloud)

### ❌ "Port 3000 already in use"
Thay đổi port trong `.env`:
```env
PORT=3001
```

---

## ✅ Checklist

Trước khi chạy, đảm bảo:
- [ ] Node.js đã cài (kiểm tra: `node --version`)
- [ ] MongoDB đang chạy hoặc có MongoDB Atlas
- [ ] File `.env` đã được tạo
- [ ] Đã chạy `npm install`
- [ ] Đã chạy `node scripts/seed.js` (optional)

---

## 🎯 Sau khi chạy thành công

1. ✅ Mở http://localhost:3000/pages/index.html
2. ✅ Đăng ký tài khoản mới hoặc đăng nhập
3. ✅ Xem danh sách sản phẩm
4. ✅ Thêm vào giỏ hàng và đặt hàng
5. ✅ Quản lý trong Admin Dashboard

---

## 📚 Tài liệu thêm

- **HUONG_DAN_CHAY_WEB.md** - Hướng dẫn chi tiết
- **README.md** - Tổng quan dự án
- **API_DOCUMENTATION.md** - Tài liệu API

Chúc bạn thành công! 🎉

