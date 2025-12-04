# Hướng dẫn cập nhật Header cho tất cả trang

## Cách 1: Sử dụng inject-header.js (Nhanh nhất)

Thêm script này vào **TẤT CẢ** các file HTML trong `frontend/pages/`:

```html
<script src="/js/inject-header.js"></script>
<script src="/js/header-menu.js"></script>
```

Đặt ngay sau thẻ `<script src="/js/api.js"></script>`

### Danh sách file cần cập nhật:
- ✅ index.html (đã xong)
- ✅ products.html (đã xong)
- ⏳ about.html
- ⏳ cart.html
- ⏳ checkout.html
- ⏳ consultation.html
- ⏳ contact.html
- ⏳ login.html
- ⏳ register.html
- ⏳ product-detail.html
- ⏳ my-orders.html
- ⏳ profile.html
- ⏳ orders.html
- ⏳ payment.html
- ⏳ order-tracking.html

## Cách 2: Thay thế HTML trực tiếp

Thay thế toàn bộ phần `<header class="header">...</header>` bằng nội dung trong file:
`frontend/includes/header-template.html`

## Lưu ý:
- Header mới có 3 phần: header-top, header-main, header-nav
- Thanh tìm kiếm ở giữa
- Icon user và giỏ hàng bên phải
- Menu ngang ở dưới cùng
- CSS đã được cập nhật trong `frontend/css/main.css`
