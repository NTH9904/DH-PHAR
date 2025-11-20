# Hướng dẫn Khắc phục: Trang Sản phẩm Không Hiển thị

## 🔍 Nguyên nhân thường gặp

### 1. ❌ Chưa chạy Seed Database
**Triệu chứng:** Trang hiển thị "Không tìm thấy sản phẩm nào"

**Giải pháp:**
```bash
node scripts/seed.js
```

Sau khi chạy, bạn sẽ thấy:
```
✅ MongoDB connected
💊 Seeding products...
✅ Created 60 products
```

### 2. ❌ Server chưa được khởi động
**Triệu chứng:** Trang hiển thị lỗi "Không thể kết nối đến server"

**Giải pháp:**
```bash
npm run dev
```

Hoặc:
```bash
npm start
```

Kiểm tra server đang chạy tại: http://localhost:3000

### 3. ❌ MongoDB chưa chạy
**Triệu chứng:** Lỗi "MongoDB connection error"

**Giải pháp:**

**Windows:**
- Mở Services (services.msc)
- Tìm "MongoDB" và Start service

**Hoặc dùng MongoDB Atlas (Cloud):**
- Đăng ký tại: https://www.mongodb.com/cloud/atlas
- Lấy connection string và cập nhật trong `.env`

### 4. ❌ File .env chưa được tạo
**Triệu chứng:** Lỗi kết nối database

**Giải pháp:**
Tạo file `.env` trong thư mục gốc với nội dung:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/dh-pharmacy
JWT_SECRET=dh-pharmacy-secret-key-123
JWT_EXPIRE=7d
```

## ✅ Checklist Khắc phục

Thực hiện theo thứ tự:

1. **Kiểm tra MongoDB đang chạy**
   ```bash
   # Windows: Kiểm tra Services
   # Hoặc dùng MongoDB Atlas
   ```

2. **Tạo file .env** (nếu chưa có)
   ```bash
   # Xem hướng dẫn ở trên
   ```

3. **Cài đặt dependencies** (nếu chưa có)
   ```bash
   npm install
   ```

4. **Seed database**
   ```bash
   node scripts/seed.js
   ```

5. **Khởi động server**
   ```bash
   npm run dev
   ```

6. **Mở trình duyệt**
   - Truy cập: http://localhost:3000/pages/products.html
   - Mở Console (F12) để xem lỗi nếu có

## 🔧 Kiểm tra nhanh

### Test API trực tiếp:
Mở trình duyệt và truy cập:
```
http://localhost:3000/api/products
```

Nếu thấy JSON data → API hoạt động tốt
Nếu thấy lỗi → Kiểm tra server và database

### Test Health Check:
```
http://localhost:3000/api/health
```

Nếu thấy `{"status":"OK"}` → Server đang chạy

## 🐛 Debug trong Console

Mở Developer Tools (F12) và kiểm tra:

1. **Console tab:** Xem có lỗi JavaScript không
2. **Network tab:** Xem request đến `/api/products` có thành công không
   - Status 200 = OK
   - Status 404 = Route không tồn tại
   - Status 500 = Server error

## 📝 Lệnh nhanh để chạy lại từ đầu

```bash
# 1. Dừng server (Ctrl+C)

# 2. Xóa và seed lại database
node scripts/seed.js

# 3. Khởi động lại server
npm run dev
```

## 💡 Tips

- Luôn chạy `node scripts/seed.js` sau khi thay đổi dữ liệu
- Kiểm tra MongoDB connection string trong `.env`
- Đảm bảo port 3000 không bị chiếm bởi ứng dụng khác
- Xem logs trong terminal để biết lỗi chi tiết

## 🆘 Vẫn không được?

1. Kiểm tra file `server.js` có đúng không
2. Kiểm tra file `backend/routes/products.js` có tồn tại không
3. Kiểm tra file `backend/models/Product.js` có đúng không
4. Xem logs trong terminal khi chạy `npm run dev`

Nếu vẫn gặp vấn đề, hãy cung cấp:
- Lỗi trong Console (F12)
- Lỗi trong terminal
- Screenshot trang web

