# Fix Lỗi 308 - ERR_NAME_NOT_RESOLVED

## 🐛 Lỗi Gặp Phải

Trong Console thấy lỗi:
```
Failed to load resource: net::ERR_NAME_NOT_RESOLVED (308:1)
```

## ✅ Đã Sửa

### 1. Sửa auth-check.js
**Vấn đề**: `auth-check.js` cố gắng dùng `window.API` trước khi nó được load.

**Giải pháp**: Dùng trực tiếp `localStorage` thay vì `window.API.getToken()`.

```javascript
// Trước (❌):
const token = window.API ? window.API.getToken() : localStorage.getItem('token');

// Sau (✅):
const token = localStorage.getItem('token');
```

### 2. Kiểm tra Script Loading Order
Scripts được load theo thứ tự:
1. `api.js` - Định nghĩa window.API
2. `auth-check.js` - Kiểm tra authentication
3. `products-main.js` - Logic chính

## 🔄 Cách Fix

### Bước 1: Clear Cache

**Trong Chrome/Edge:**
1. Nhấn `Ctrl + Shift + Delete`
2. Chọn "Cached images and files"
3. Click "Clear data"

**Hoặc Hard Refresh:**
- Nhấn `Ctrl + Shift + R`
- Hoặc `Ctrl + F5`

### Bước 2: Restart Server

```bash
# Trong terminal đang chạy server
Ctrl + C

# Khởi động lại
node server.js
```

### Bước 3: Test Lại

1. Mở Incognito/Private window: `Ctrl + Shift + N`
2. Truy cập: `http://localhost:3000/admin/pages/login.html`
3. Đăng nhập
4. Vào trang Products
5. Mở Console (F12) - Không còn lỗi 308

## 🔍 Nguyên Nhân Lỗi 308

### 1. HTTP 308 Permanent Redirect
- Server redirect từ HTTP sang HTTPS
- Hoặc redirect trailing slash
- Hoặc redirect domain

### 2. DNS Resolution Error
- Không resolve được domain name
- Thường xảy ra với external resources

### 3. Browser Cache
- Cache cũ còn lưu redirect
- Clear cache để fix

## 🧪 Test Scripts

### Test 1: Kiểm tra Server
```bash
curl http://localhost:3000/api/health
```

Kết quả mong đợi:
```json
{"status":"OK","timestamp":"..."}
```

### Test 2: Test Script Loading
Mở: `http://localhost:3000/admin/pages/test-simple.html`

Kiểm tra Console:
```
Script loaded
window.API: Object {...}
```

### Test 3: Test Products Page
1. Đăng nhập admin
2. Vào Products page
3. Mở Console (F12)
4. Kiểm tra:
   - ✅ "Authentication check passed"
   - ✅ Không có lỗi 308
   - ✅ Không có lỗi ERR_NAME_NOT_RESOLVED

## 📊 Kiểm Tra Network Tab

1. Mở DevTools (F12)
2. Tab "Network"
3. Reload trang (F5)
4. Kiểm tra:
   - ✅ `api.js` - Status 200
   - ✅ `auth-check.js` - Status 200
   - ✅ `products-main.js` - Status 200
   - ✅ `main.css` - Status 200
   - ✅ `products.css` - Status 200

Nếu có file nào Status 308 hoặc 404:
- Kiểm tra file có tồn tại không
- Kiểm tra đường dẫn đúng không
- Clear cache và reload

## 🛠️ Troubleshooting

### Vẫn còn lỗi 308?

**1. Kiểm tra file tồn tại:**
```bash
dir admin\pages\*.js
dir admin\pages\*.css
```

**2. Kiểm tra server đang chạy:**
```bash
netstat -ano | findstr :3000
```

**3. Kiểm tra CORS:**
Mở Console và chạy:
```javascript
fetch('http://localhost:3000/api/health')
  .then(r => r.json())
  .then(d => console.log('✅ Server OK:', d))
  .catch(e => console.error('❌ Error:', e));
```

**4. Kiểm tra auth:**
```javascript
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
```

### Lỗi "Cannot read properties of null"

Có element nào đó không tồn tại. Kiểm tra:
```javascript
console.log('btn-add-product:', document.getElementById('btn-add-product'));
console.log('btn-upload-image:', document.getElementById('btn-upload-image'));
console.log('product-form:', document.getElementById('product-form'));
```

### Lỗi "Failed to fetch"

Server không chạy hoặc CORS issue:
1. Restart server
2. Kiểm tra CORS config trong `server.js`
3. Kiểm tra firewall

## ✅ Checklist

Sau khi fix:

- [x] auth-check.js đã sửa (không dùng window.API)
- [x] Server đã restart
- [x] Cache đã clear
- [ ] Test trong Incognito mode
- [ ] Console không có lỗi 308
- [ ] Tất cả scripts load thành công (Status 200)
- [ ] Products page hoạt động bình thường
- [ ] Upload image hoạt động

## 🎯 Kết Luận

Lỗi 308 thường do:
1. ✅ **Cache cũ** - Clear cache
2. ✅ **Script loading order** - Đã sửa auth-check.js
3. ✅ **Server chưa restart** - Restart server

Sau khi làm 3 bước trên, lỗi sẽ hết!

---

**Quick Fix**: Clear cache + Restart server + Hard refresh (Ctrl+Shift+R)
