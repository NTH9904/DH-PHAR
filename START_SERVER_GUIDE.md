# 🚀 Hướng Dẫn Khởi Động Server

## Lỗi EADDRINUSE

### Nguyên nhân
Port 3000 đang được sử dụng bởi process khác

### Giải pháp

#### Cách 1: Kill Process Đang Dùng Port 3000

**Windows (PowerShell):**
```powershell
# Tìm process đang dùng port 3000
netstat -ano | findstr :3000

# Kết quả sẽ hiển thị PID (số cuối cùng)
# TCP    0.0.0.0:3000    0.0.0.0:0    LISTENING    12345
#                                                    ^^^^^
#                                                    PID

# Kill process (thay 12345 bằng PID thực tế)
taskkill /PID 12345 /F
```

**Windows (CMD):**
```cmd
netstat -ano | findstr :3000
taskkill /PID [PID] /F
```

#### Cách 2: Kill Tất Cả Node Process

```powershell
# Kill tất cả process Node.js
taskkill /IM node.exe /F
```

#### Cách 3: Đổi Port

Sửa file `.env`:
```env
PORT=3001
```

Hoặc sửa `server.js`:
```javascript
const PORT = process.env.PORT || 3001;
```

## Khởi Động Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Background Mode (Kiro)
Sử dụng Kiro IDE để start server:
1. Mở terminal trong Kiro
2. Chạy: `npm run dev`
3. Server sẽ chạy background

## Kiểm Tra Server Đang Chạy

### Cách 1: Check Port
```powershell
netstat -ano | findstr :3000
```

Nếu có kết quả → Server đang chạy

### Cách 2: Check Process
```powershell
Get-Process node
```

### Cách 3: Test HTTP
```powershell
curl http://localhost:3000
```

Hoặc mở browser: `http://localhost:3000`

## Troubleshooting

### Lỗi: Cannot find module
```bash
npm install
```

### Lỗi: MongoDB connection error
```bash
# Kiểm tra MongoDB đang chạy
# Windows: Mở Services → MongoDB Server

# Hoặc start MongoDB
net start MongoDB
```

### Lỗi: Permission denied
Chạy terminal/PowerShell với quyền Administrator

### Server không response
1. Check console có lỗi không
2. Check MongoDB đã kết nối chưa
3. Check port có đúng không
4. Restart server

## Logs

### Khi Server Start Thành Công
```
✅ MongoDB connected to: mongodb://localhost:27017/dh_pharmacy
🚀 Server running on port 3000
Dev debug routes mounted at /api/debug
```

### Khi Có Lỗi
```
❌ MongoDB connection error: ...
Error: listen EADDRINUSE: address already in use :::3000
```

## Quick Fix Script

Tạo file `kill-port-3000.ps1`:
```powershell
# Kill process on port 3000
$port = 3000
$process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($process) {
    $pid = $process.OwningProcess
    Write-Host "Killing process $pid on port $port"
    Stop-Process -Id $pid -Force
    Write-Host "✅ Process killed"
} else {
    Write-Host "✅ Port $port is free"
}
```

Chạy:
```powershell
.\kill-port-3000.ps1
npm run dev
```

## Recommended Workflow

1. **Trước khi start:**
   ```bash
   # Kill old processes
   taskkill /IM node.exe /F
   
   # Start fresh
   npm run dev
   ```

2. **Khi develop:**
   - Dùng `npm run dev` (nodemon auto-restart)
   - Không cần restart thủ công khi sửa code

3. **Khi gặp lỗi:**
   - Check console logs
   - Kill process và restart
   - Check MongoDB connection

4. **Trước khi commit:**
   - Stop server
   - Test lại từ đầu
   - Đảm bảo không có process zombie

## Environment Variables

Check `.env` file:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/dh_pharmacy
NODE_ENV=development
```

## Summary

✅ Kill process cũ: `taskkill /IM node.exe /F`
✅ Start server: `npm run dev`
✅ Check logs: Console output
✅ Test: `http://localhost:3000`

Server should now run without EADDRINUSE error! 🎉
