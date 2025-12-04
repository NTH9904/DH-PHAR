# Hướng dẫn cấu hình OAuth

## 🔐 Google OAuth Setup

### Bước 1: Tạo Google Cloud Project
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Enable **Google+ API**

### Bước 2: Tạo OAuth Credentials
1. Vào **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Chọn **Web application**
4. Cấu hình:
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:3000/api/auth/google/callback`
5. Copy **Client ID** và **Client Secret**

### Bước 3: Cập nhật .env
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

---

## 📘 Facebook OAuth Setup

### Bước 1: Tạo Facebook App
1. Truy cập [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** > **Create App**
3. Chọn **Consumer** > **Next**
4. Nhập tên app và email

### Bước 2: Cấu hình Facebook Login
1. Vào **Dashboard** > **Add Product** > **Facebook Login**
2. Chọn **Web**
3. Cấu hình:
   - **Valid OAuth Redirect URIs**: `http://localhost:3000/api/auth/facebook/callback`
4. Vào **Settings** > **Basic**
5. Copy **App ID** và **App Secret**

### Bước 3: Cập nhật .env
```env
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret
```

---

## 🚀 Testing OAuth

### Development URLs:
- Google Login: `http://localhost:3000/api/auth/google`
- Facebook Login: `http://localhost:3000/api/auth/facebook`

### Production Setup:
1. Cập nhật **Authorized redirect URIs** với domain production
2. Cập nhật `FRONTEND_URL` trong `.env`
3. Enable HTTPS (bắt buộc cho production)

---

## ⚠️ Lưu ý

1. **Google OAuth**:
   - Cần verify domain cho production
   - User phải có email

2. **Facebook OAuth**:
   - App cần được review để public
   - Một số user có thể không có email

3. **Security**:
   - Không commit credentials vào Git
   - Sử dụng environment variables
   - Enable HTTPS cho production

---

## 🔧 Troubleshooting

### Lỗi "redirect_uri_mismatch"
- Kiểm tra redirect URI trong OAuth console
- Đảm bảo URL khớp chính xác (bao gồm http/https)

### Lỗi "invalid_client"
- Kiểm tra Client ID/Secret trong .env
- Đảm bảo không có khoảng trắng thừa

### User không có email
- Facebook: Yêu cầu permission `email`
- Xử lý trường hợp user không cung cấp email
