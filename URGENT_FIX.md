# 🚨 URGENT FIX - Lỗi 404 Upload

## ❌ Lỗi Hiện Tại

```
Failed to load resource: the server responded with a status of 404 (Not Found)
/3000/api/upload/productui
```

## 🔍 Nguyên Nhân

**SERVER CHƯA RESTART!**

Route `/api/upload` đã được thêm vào code nhưng server đang chạy chưa có route này.

## ✅ GIẢI PHÁP - RESTART SERVER NGAY

### Bước 1: Dừng Server Hiện Tại

**Tìm terminal đang chạy `node server.js`:**
1. Tìm cửa sổ terminal/command prompt
2. Nhấn `Ctrl + C`
3. Đợi server dừng

**Hoặc kill process:**
```bash
# Tìm process
netstat -ano | findstr :3000

# Kill process (thay PID bằng số thực tế)
taskkill /F /PID <PID>
```

### Bước 2: Khởi Động Lại Server

```bash
node server.js
```

Hoặc dùng script:
```bash
restart-server.bat
```

### Bước 3: Kiểm Tra Server Đã Load Route

Mở browser và truy cập:
```
http://localhost:3000/api/health
```

Kết quả mong đợi:
```json
{"status":"OK","timestamp":"..."}
```

### Bước 4: Test Upload Route

Mở Console (F12) và chạy:
```javascript
fetch('http://localhost:3000/api/upload/product', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(d => console.log('Response:', d))
.catch(e => console.error('Error:', e));
```

Kết quả mong đợi (lỗi 400 là OK vì chưa có file):
```json
{"success":false,"message":"Vui lòng chọn file ảnh"}
```

**KHÔNG được 404!**

## 🧪 Test Sau Khi Restart

### 1. Test Health Check
```bash
curl http://localhost:3000/api/health
```

### 2. Test Upload Endpoint Exists
```bash
curl http://localhost:3000/api/upload/product
```

Kết quả mong đợi: **KHÔNG phải 404**

### 3. Test Upload Image

1. Đăng nhập admin
2. Vào Products page
3. Click "Thêm sản phẩm mới"
4. Chọn file ảnh
5. Click "📤 Upload"
6. Kiểm tra Console - **KHÔNG có lỗi 404**

## 📊 Checklist

- [ ] Server đã dừng (Ctrl+C)
- [ ] Server đã khởi động lại (node server.js)
- [ ] Health check OK (http://localhost:3000/api/health)
- [ ] Upload endpoint không 404
- [ ] Test upload ảnh thành công
- [ ] Console không có lỗi

## 🎯 Kết Quả Mong Đợi

Sau khi restart server:

✅ `/api/upload/product` - Status 400 (nếu không có file) hoặc 200 (nếu có file)  
✅ Upload ảnh thành công  
✅ Preview ảnh hiển thị  
✅ Ảnh được lưu vào `uploads/products/`  
✅ Sản phẩm lưu với URL ảnh đúng  

## ⚠️ LƯU Ý QUAN TRỌNG

**MỖI KHI THAY ĐỔI CODE BACKEND, PHẢI RESTART SERVER!**

Các thay đổi cần restart:
- ✅ Thêm route mới
- ✅ Sửa controller
- ✅ Sửa middleware
- ✅ Sửa model
- ✅ Thay đổi config

Các thay đổi KHÔNG cần restart:
- ❌ Sửa HTML
- ❌ Sửa CSS
- ❌ Sửa JavaScript frontend
- ❌ Thêm file static

## 🚀 Quick Commands

```bash
# Kill server on port 3000
taskkill /F /IM node.exe

# Start server
node server.js

# Or use restart script
restart-server.bat

# Test health
curl http://localhost:3000/api/health

# Test upload endpoint
curl -X POST http://localhost:3000/api/upload/product
```

---

**TÓM TẮT: RESTART SERVER NGAY! (Ctrl+C rồi node server.js)**
