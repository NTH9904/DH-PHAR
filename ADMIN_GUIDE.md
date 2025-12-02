# Hướng dẫn sử dụng Hệ thống Admin - DH Pharmacy

## 📋 Tổng quan

Hệ thống quản trị DH Pharmacy cung cấp đầy đủ các chức năng để quản lý nhà thuốc trực tuyến một cách hiệu quả và chuyên nghiệp.

## 🔐 Đăng nhập

- URL: `http://localhost:3000/admin/pages/login.html`
- Tài khoản admin mặc định:
  - Email: `admin@dhpharmacy.com`
  - Password: `admin123`

## 📊 Các chức năng chính

### 1. Dashboard (Trang chủ)
**Đường dẫn:** `/admin/pages/dashboard.html`

**Chức năng:**
- Xem tổng quan doanh thu, đơn hàng, sản phẩm, khách hàng
- Theo dõi đơn hàng gần đây
- Cảnh báo sản phẩm sắp hết hàng
- Thống kê theo thời gian thực

**Các chỉ số hiển thị:**
- Tổng đơn hàng và % tăng trưởng
- Doanh thu và xu hướng
- Số lượng sản phẩm
- Số lượng khách hàng mới

---

### 2. Quản lý Sản phẩm
**Đường dẫn:** `/admin/pages/products.html`

**Chức năng:**
- ✅ Thêm sản phẩm mới
- ✅ Sửa thông tin sản phẩm
- ✅ Xóa sản phẩm
- ✅ Tìm kiếm và lọc sản phẩm
- ✅ Quản lý hình ảnh sản phẩm
- ✅ Cập nhật giá và tồn kho
- ✅ Phân loại theo danh mục

**Thông tin sản phẩm:**
- Tên thuốc (tiếng Việt và tiếng Anh)
- Hoạt chất (Generic name)
- Nhà sản xuất
- Loại thuốc (Kê đơn/Không kê đơn/Thực phẩm chức năng)
- Giá bán và giá gốc
- Tồn kho
- Hình ảnh
- Mô tả chi tiết
- Công dụng, chống chỉ định
- Liều dùng và cách sử dụng
- Nhóm tuổi phù hợp
- Bệnh và triệu chứng điều trị

---

### 3. Quản lý Đơn hàng
**Đường dẫn:** `/admin/pages/orders.html`

**Chức năng:**
- ✅ Xem danh sách đơn hàng
- ✅ Cập nhật trạng thái đơn hàng
- ✅ Xem chi tiết đơn hàng
- ✅ Lọc theo trạng thái, thanh toán, ngày
- ✅ Xóa đơn hàng
- ✅ In hóa đơn
- ✅ Quản lý vận chuyển

**Trạng thái đơn hàng:**
1. **Chờ xử lý** (pending) - Đơn hàng mới tạo
2. **Đã xác nhận** (confirmed) - Admin đã xác nhận
3. **Đang xử lý** (processing) - Đang chuẩn bị hàng
4. **Đang giao** (shipping) - Đã giao cho đơn vị vận chuyển
5. **Đã giao** (delivered) - Giao hàng thành công
6. **Đã hủy** (cancelled) - Đơn hàng bị hủy

**Thông tin đơn hàng:**
- Mã đơn hàng
- Thông tin khách hàng
- Danh sách sản phẩm
- Tổng tiền, phí vận chuyển, giảm giá
- Địa chỉ giao hàng
- Phương thức thanh toán
- Trạng thái thanh toán
- Lịch sử cập nhật trạng thái

---

### 4. Quản lý Người dùng
**Đường dẫn:** `/admin/pages/users.html`

**Chức năng:**
- ✅ Xem danh sách người dùng
- ✅ Tìm kiếm người dùng
- ✅ Xem chi tiết thông tin
- ✅ Xem lịch sử đơn hàng của người dùng
- ✅ Khóa/Mở khóa tài khoản
- ✅ Phân quyền (Admin/User)

**Thông tin người dùng:**
- Họ tên
- Email
- Số điện thoại
- Địa chỉ
- Ngày đăng ký
- Tổng đơn hàng
- Tổng chi tiêu
- Điểm tích lũy

---

### 5. Quản lý Đơn thuốc
**Đường dẫn:** `/admin/pages/prescriptions.html`

**Chức năng:**
- ✅ Xem danh sách đơn thuốc
- ✅ Duyệt/Từ chối đơn thuốc
- ✅ Xem hình ảnh đơn thuốc
- ✅ Ghi chú của dược sĩ
- ✅ Liên kết với đơn hàng

**Quy trình xử lý:**
1. Khách hàng upload đơn thuốc
2. Admin/Dược sĩ kiểm tra
3. Duyệt hoặc từ chối với lý do
4. Khách hàng đặt hàng theo đơn

---

### 6. Quản lý Kho hàng
**Đường dẫn:** `/admin/pages/inventory.html`

**Chức năng:**
- ✅ Xem tồn kho tất cả sản phẩm
- ✅ Nhập hàng mới
- ✅ Điều chỉnh số lượng tồn kho
- ✅ Cảnh báo sắp hết hàng
- ✅ Cảnh báo hết hàng
- ✅ Theo dõi hạn sử dụng
- ✅ Cảnh báo sản phẩm sắp hết hạn

**Thống kê kho:**
- Tổng số sản phẩm
- Số sản phẩm sắp hết (< 20)
- Số sản phẩm hết hàng (= 0)
- Số sản phẩm sắp hết hạn (< 90 ngày)

**Nhập hàng:**
- Chọn sản phẩm
- Nhập số lượng
- Cập nhật hạn sử dụng
- Ghi chú nhập hàng

---

### 7. Quản lý Nhà cung cấp
**Đường dẫn:** `/admin/pages/suppliers.html`

**Chức năng:**
- ✅ Thêm nhà cung cấp mới
- ✅ Sửa thông tin nhà cung cấp
- ✅ Xóa nhà cung cấp
- ✅ Theo dõi số lượng sản phẩm từ mỗi NCC
- ✅ Quản lý thông tin liên hệ

**Thông tin NCC:**
- Tên công ty
- Số điện thoại
- Email
- Địa chỉ
- Số lượng sản phẩm cung cấp
- Trạng thái hoạt động

---

### 8. Quản lý Khuyến mãi
**Đường dẫn:** `/admin/pages/promotions.html`

**Chức năng:**
- ✅ Tạo mã khuyến mãi
- ✅ Sửa/Xóa khuyến mãi
- ✅ Theo dõi lượt sử dụng
- ✅ Kích hoạt/Tạm dừng khuyến mãi

**Loại khuyến mãi:**
1. **Giảm theo phần trăm** - Giảm X% giá trị đơn hàng
2. **Giảm số tiền cố định** - Giảm X VNĐ

**Cài đặt khuyến mãi:**
- Mã khuyến mãi (CODE)
- Tên chương trình
- Loại giảm giá
- Giá trị giảm
- Giảm tối đa (cho % discount)
- Đơn hàng tối thiểu
- Thời gian áp dụng
- Số lượng mã
- Giới hạn sử dụng/người

---

### 9. Báo cáo & Thống kê
**Đường dẫn:** `/admin/pages/reports.html`

**Chức năng:**
- ✅ Báo cáo doanh thu theo thời gian
- ✅ Biểu đồ doanh thu
- ✅ Top sản phẩm bán chạy
- ✅ Thống kê theo danh mục
- ✅ Xuất báo cáo

**Các chỉ số:**
- Doanh thu theo ngày/tuần/tháng
- Số đơn hàng
- Giá trị trung bình đơn hàng
- Số khách hàng mới
- Tỷ lệ tăng trưởng

**Biểu đồ:**
- Biểu đồ đường: Doanh thu theo thời gian
- Biểu đồ cột: Top sản phẩm bán chạy
- Biểu đồ tròn: Phân bổ theo danh mục

---

### 10. Cài đặt
**Đường dẫn:** `/admin/pages/settings.html`

**Các tab cài đặt:**

#### a) Cài đặt chung
- Tên cửa hàng
- Số điện thoại
- Email
- Địa chỉ
- Giờ làm việc

#### b) Cài đặt vận chuyển
- Phí vận chuyển mặc định
- Miễn phí vận chuyển cho đơn từ X VNĐ
- Thời gian giao hàng dự kiến
- Bật/tắt giao hàng nhanh

#### c) Cài đặt thanh toán
- Thanh toán khi nhận hàng (COD)
- Chuyển khoản ngân hàng
- VNPay
- MoMo
- Thông tin tài khoản ngân hàng

#### d) Cài đặt Email
- Email gửi đi
- Tên người gửi
- Bật/tắt email xác nhận đơn hàng
- Bật/tắt email thông báo giao hàng

#### e) Cài đặt SEO
- Meta Title
- Meta Description
- Keywords

---

## 🎯 Quy trình làm việc

### Quy trình xử lý đơn hàng:
1. Khách hàng đặt hàng → Trạng thái: **Chờ xử lý**
2. Admin kiểm tra và xác nhận → **Đã xác nhận**
3. Chuẩn bị hàng → **Đang xử lý**
4. Giao cho đơn vị vận chuyển → **Đang giao**
5. Khách nhận hàng → **Đã giao**

### Quy trình quản lý kho:
1. Kiểm tra tồn kho định kỳ
2. Nhập hàng khi sắp hết
3. Cập nhật hạn sử dụng
4. Xử lý sản phẩm sắp hết hạn

### Quy trình khuyến mãi:
1. Tạo chương trình khuyến mãi
2. Thiết lập điều kiện áp dụng
3. Kích hoạt mã
4. Theo dõi hiệu quả
5. Kết thúc hoặc gia hạn

---

## 📱 Responsive Design

Hệ thống admin được thiết kế responsive, hoạt động tốt trên:
- 💻 Desktop (1920x1080 trở lên)
- 💻 Laptop (1366x768)
- 📱 Tablet (768x1024)
- 📱 Mobile (375x667)

---

## 🔒 Bảo mật

- Xác thực JWT Token
- Phân quyền Admin/User
- Session timeout
- HTTPS (production)
- Rate limiting
- Input validation

---

## 🚀 Tips & Tricks

### Tối ưu hiệu suất:
- Sử dụng bộ lọc để giảm dữ liệu tải
- Phân trang cho danh sách lớn
- Cache dữ liệu thường xuyên truy cập

### Quản lý hiệu quả:
- Kiểm tra dashboard hàng ngày
- Xử lý đơn hàng "Chờ xử lý" ngay
- Theo dõi sản phẩm sắp hết hàng
- Cập nhật giá và khuyến mãi thường xuyên

### Chăm sóc khách hàng:
- Phản hồi nhanh các đơn hàng mới
- Cập nhật trạng thái đơn hàng kịp thời
- Ghi chú rõ ràng khi từ chối đơn thuốc
- Theo dõi phản hồi của khách hàng

---

## 📞 Hỗ trợ

Nếu gặp vấn đề kỹ thuật, vui lòng liên hệ:
- Email: support@dhpharmacy.com
- Hotline: 1900 xxxx

---

## 📝 Changelog

### Version 1.0.0 (2024)
- ✅ Dashboard với thống kê tổng quan
- ✅ Quản lý sản phẩm đầy đủ
- ✅ Quản lý đơn hàng với workflow hoàn chỉnh
- ✅ Quản lý người dùng
- ✅ Quản lý đơn thuốc
- ✅ Quản lý kho hàng
- ✅ Quản lý nhà cung cấp
- ✅ Quản lý khuyến mãi
- ✅ Báo cáo và thống kê với biểu đồ
- ✅ Cài đặt hệ thống

---

**Cập nhật lần cuối:** 02/12/2024
