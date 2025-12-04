# Phân quyền hệ thống DH Pharmacy

## 👥 Các vai trò (Roles)

### 1. 👤 Customer (Khách hàng)
**Quyền hạn:**
- ✅ Xem và mua sản phẩm
- ✅ Quản lý giỏ hàng
- ✅ Đặt hàng
- ✅ Upload đơn thuốc
- ✅ Xem lịch sử đơn hàng
- ✅ Cập nhật thông tin cá nhân
- ✅ Tư vấn qua Zalo/Hotline

**Dropdown Menu:**
- 👤 Thông tin cá nhân
- 📦 Đơn hàng của tôi
- 📋 Lịch sử mua hàng
- 🚪 Đăng xuất

---

### 2. 💊 Pharmacist (Dược sĩ)
**Quyền hạn:**
- ✅ Dashboard - Xem tổng quan
- ✅ Đơn hàng - Quản lý và xử lý
- ✅ Đơn thuốc - Duyệt và xác thực
- ✅ Kho hàng - Quản lý tồn kho
- ✅ Báo cáo - Xem thống kê
- ✅ Nhà cung cấp - Quản lý
- ✅ Cài đặt - Cấu hình
- ❌ Sản phẩm - KHÔNG được phép
- ❌ Người dùng - KHÔNG được phép

**Dropdown Menu:**
- 📊 Dashboard
- 📦 Quản lý đơn hàng
- 📋 Đơn thuốc
- 📦 Kho hàng
- 🚪 Đăng xuất

**Lưu ý:** Dược sĩ có thể truy cập Dashboard nhưng được redirect trực tiếp đến trang Đơn thuốc khi đăng nhập.

**Tài khoản test:**
- Email: `pharmacist@dhpharmacy.com`
- Password: `pharmacist123`

---

### 3. 👑 Admin (Quản trị viên)
**Quyền hạn:**
- ✅ Dashboard - Xem tổng quan
- ✅ Sản phẩm - Quản lý toàn bộ
- ✅ Đơn hàng - Quản lý và xử lý
- ✅ Người dùng - Quản lý thành viên
- ✅ Đơn thuốc - Duyệt và xác thực
- ✅ Kho hàng - Quản lý tồn kho
- ✅ Báo cáo - Xem thống kê
- ✅ Nhà cung cấp - Quản lý
- ✅ Cài đặt - Cấu hình hệ thống

**Dropdown Menu:**
- 📊 Dashboard
- 💊 Quản lý sản phẩm
- 👥 Quản lý người dùng
- 📦 Quản lý đơn hàng
- 📋 Đơn thuốc
- 📦 Kho hàng
- 🚪 Đăng xuất

**Tài khoản test:**
- Email: `admin@dhpharmacy.com`
- Password: `admin123`

---

## 🔐 Bảng so sánh quyền

| Chức năng | Customer | Pharmacist | Admin |
|-----------|----------|------------|-------|
| Mua hàng | ✅ | ✅ | ✅ |
| Dashboard | ❌ | ✅ | ✅ |
| Quản lý sản phẩm | ❌ | ❌ | ✅ |
| Quản lý đơn hàng | Của mình | ✅ | ✅ |
| Quản lý người dùng | ❌ | ❌ | ✅ |
| Duyệt đơn thuốc | ❌ | ✅ | ✅ |
| Quản lý kho | ❌ | ✅ | ✅ |
| Xem báo cáo | ❌ | ✅ | ✅ |
| Cài đặt hệ thống | ❌ | ✅ | ✅ |

---

## 🎯 Quy trình phân quyền

### Khi đăng nhập:
1. Hệ thống kiểm tra role
2. Redirect dựa trên role:
   - Customer → Trang chủ
   - Pharmacist → Trang Đơn thuốc
   - Admin → Admin Dashboard

### Khi truy cập trang admin:
1. Kiểm tra token
2. Kiểm tra role (admin hoặc pharmacist)
3. Nếu là pharmacist:
   - Ẩn menu "Sản phẩm" và "Người dùng" trong top navigation
   - Block truy cập trực tiếp vào Products và Users
   - Có thể truy cập Dashboard tự do
4. Hiển thị role badge trong dropdown

---

## 📝 Lưu ý

1. **Bảo mật**: Mỗi API endpoint đều có middleware kiểm tra quyền
2. **Frontend**: Chỉ ẩn UI, backend vẫn kiểm tra quyền
3. **Token**: JWT token chứa thông tin role
4. **Session**: Token hết hạn sau 7 ngày

---

## 🔧 Tạo tài khoản mới

### Tạo Pharmacist:
```bash
node scripts/create-pharmacist.js
```

### Tạo Admin:
```bash
node scripts/create-admin.js
```

### Đăng ký Customer:
- Truy cập: `/pages/register.html`
- Hoặc dùng Google/Facebook OAuth
