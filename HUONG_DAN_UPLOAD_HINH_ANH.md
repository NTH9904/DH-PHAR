# Hướng Dẫn Upload Hình Ảnh Sản Phẩm

## ✅ Đã Thêm Chức Năng

### 1. Backend Upload API
**File**: `backend/routes/upload.js`

Endpoints:
- `POST /api/upload/product` - Upload 1 ảnh
- `POST /api/upload/products` - Upload nhiều ảnh (tối đa 5)
- `DELETE /api/upload/product/:filename` - Xóa ảnh

Tính năng:
- ✅ Upload file ảnh (JPEG, PNG, GIF, WebP)
- ✅ Giới hạn kích thước 5MB
- ✅ Tự động tạo tên file unique
- ✅ Lưu vào thư mục `uploads/products/`
- ✅ Trả về URL để sử dụng

### 2. Frontend Upload UI
**File**: `admin/pages/products.html`

Thêm:
- Input file để chọn ảnh
- Button "Upload" để upload
- Preview ảnh sau khi upload
- Button "Xóa ảnh" để xóa preview
- Vẫn giữ option nhập URL trực tiếp

### 3. Upload Logic
**File**: `admin/pages/products-main.js`

Chức năng:
- Upload ảnh lên server
- Hiển thị preview
- Validate file (type, size)
- Xử lý lỗi
- Tự động điền URL sau khi upload

### 4. API Wrapper
**File**: `admin/pages/api.js`

Thêm `uploadAPI`:
- `uploadProductImage(file)` - Upload 1 ảnh
- `uploadProductImages(files)` - Upload nhiều ảnh
- `deleteProductImage(filename)` - Xóa ảnh

## 🚀 Cách Sử Dụng

### Bước 1: Restart Server

Server cần restart để load route mới:

```bash
restart-server.bat
```

Hoặc manual:
```bash
Ctrl + C
node server.js
```

### Bước 2: Thêm Sản Phẩm Với Hình Ảnh

1. Đăng nhập admin: `http://localhost:3000/admin/pages/login.html`
2. Vào trang "Sản phẩm"
3. Click "➕ Thêm sản phẩm mới"
4. Điền thông tin sản phẩm
5. **Upload hình ảnh**:
   - Click "Choose File" và chọn ảnh
   - Click "📤 Upload"
   - Đợi upload xong (hiện preview)
6. Click "Lưu"

### Bước 3: Kiểm Tra

Sản phẩm sẽ hiển thị với hình ảnh đã upload trong danh sách.

## 📸 Upload Hình Ảnh

### Cách 1: Upload File (Khuyến nghị)

1. Click "Choose File"
2. Chọn file ảnh từ máy tính
3. Click "📤 Upload"
4. Đợi upload hoàn tất
5. Preview sẽ hiển thị
6. URL tự động được điền

**Ưu điểm**:
- ✅ Ảnh được lưu trên server
- ✅ Không phụ thuộc link bên ngoài
- ✅ Load nhanh hơn
- ✅ Kiểm soát được file

### Cách 2: Nhập URL

1. Bỏ qua phần upload file
2. Nhập URL ảnh trực tiếp vào ô "Hoặc nhập URL trực tiếp"
3. Preview sẽ hiển thị
4. Click "Lưu"

**Ưu điểm**:
- ✅ Nhanh nếu đã có URL
- ✅ Không tốn dung lượng server

## 🔧 Cấu Hình

### Giới Hạn Upload

**File**: `backend/routes/upload.js`

```javascript
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});
```

Thay đổi `5 * 1024 * 1024` để thay đổi giới hạn.

### Loại File Chấp Nhận

```javascript
const allowedTypes = /jpeg|jpg|png|gif|webp/;
```

Thêm loại file khác vào regex này.

### Thư Mục Lưu

```javascript
const uploadsDir = path.join(__dirname, '../../uploads/products');
```

Thay đổi path để lưu vào thư mục khác.

## 🧪 Test Upload

### Test Bằng Script

```bash
node test-upload.js
```

Kết quả mong đợi:
```
🧪 Testing Image Upload

1️⃣  Logging in...
   ✅ Login successful

2️⃣  Creating test image...
   ✅ Test image created

3️⃣  Uploading image...
   ✅ Upload successful
   URL: /uploads/products/test-image-1234567890.png
   Filename: test-image-1234567890.png
   Size: 67 bytes

4️⃣  Cleanup completed

🎉 Upload test completed!
```

### Test Bằng UI

1. Mở admin panel
2. Thêm sản phẩm mới
3. Upload ảnh
4. Kiểm tra Console (F12) - không có lỗi
5. Kiểm tra preview hiển thị
6. Lưu sản phẩm
7. Kiểm tra ảnh hiển thị trong danh sách

## 📁 Cấu Trúc Thư Mục

```
uploads/
  └── products/
      ├── .gitkeep
      └── product-image-1234567890.png
```

Ảnh được lưu với tên format:
```
[original-name]-[timestamp]-[random].ext
```

Ví dụ:
```
paracetamol-1700000000000-123456789.jpg
```

## 🔐 Bảo Mật

### Authentication
- ✅ Chỉ admin/pharmacist mới upload được
- ✅ Yêu cầu JWT token
- ✅ Middleware `protect` và `admin`

### Validation
- ✅ Kiểm tra loại file (chỉ ảnh)
- ✅ Kiểm tra kích thước (max 5MB)
- ✅ Kiểm tra extension và mimetype

### File Storage
- ✅ Tên file unique (tránh trùng)
- ✅ Lưu ngoài thư mục public
- ✅ Serve qua static middleware

## 📊 API Response

### Upload Success

```json
{
  "success": true,
  "message": "Upload ảnh thành công",
  "data": {
    "url": "/uploads/products/image-1234567890.png",
    "filename": "image-1234567890.png",
    "size": 123456,
    "mimetype": "image/png"
  }
}
```

### Upload Error

```json
{
  "success": false,
  "message": "Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp)"
}
```

## 🐛 Troubleshooting

### Lỗi "Vui lòng chọn file ảnh"
- Chưa chọn file
- Click "Choose File" và chọn ảnh

### Lỗi "File ảnh không được vượt quá 5MB"
- File quá lớn
- Nén ảnh hoặc chọn ảnh khác

### Lỗi "Chỉ chấp nhận file ảnh"
- File không phải ảnh
- Chọn file JPEG, PNG, GIF, hoặc WebP

### Upload thành công nhưng không hiển thị
- Kiểm tra Console (F12)
- Kiểm tra URL có đúng không
- Kiểm tra file có tồn tại trong `uploads/products/`

### Lỗi 401 Unauthorized
- Chưa đăng nhập
- Token hết hạn
- Đăng xuất và đăng nhập lại

### Lỗi 403 Forbidden
- Không có quyền admin
- Kiểm tra role trong database

## 💡 Tips

### Tối Ưu Ảnh Trước Khi Upload
- Nén ảnh để giảm kích thước
- Resize về kích thước phù hợp (800x800px)
- Dùng format WebP cho kích thước nhỏ hơn

### Đặt Tên File Có Ý Nghĩa
- Đặt tên file mô tả sản phẩm
- Ví dụ: `paracetamol-500mg.jpg`
- Giúp dễ quản lý sau này

### Backup Ảnh
- Thư mục `uploads/` nên được backup định kỳ
- Có thể dùng cloud storage (S3, Cloudinary)

## 🚀 Nâng Cao

### Upload Nhiều Ảnh

Để upload nhiều ảnh cho 1 sản phẩm:

```javascript
// Frontend
const files = document.getElementById('product-images').files;
const response = await window.API.upload.uploadProductImages(files);

// Response
{
  "success": true,
  "message": "Upload 3 ảnh thành công",
  "data": [
    { "url": "/uploads/products/image1.png", ... },
    { "url": "/uploads/products/image2.png", ... },
    { "url": "/uploads/products/image3.png", ... }
  ]
}
```

### Tích Hợp Cloud Storage

Để lưu ảnh lên cloud (S3, Cloudinary):

1. Cài package:
```bash
npm install cloudinary
```

2. Cấu hình trong `backend/routes/upload.js`
3. Upload lên cloud thay vì local

## 📝 Checklist

Sau khi thêm chức năng upload:

- [x] Backend route `/api/upload` đã tạo
- [x] Server đã thêm route upload
- [x] Static middleware cho `/uploads`
- [x] Frontend có input file
- [x] Frontend có button upload
- [x] Frontend có preview ảnh
- [x] API wrapper đã thêm uploadAPI
- [x] Thư mục `uploads/products/` đã tạo
- [x] Test upload thành công
- [ ] **Server đã RESTART**

## ✅ Hoàn Thành

Chức năng upload hình ảnh đã sẵn sàng!

**Bước cuối**: RESTART SERVER và test thử! 🎉
