# 🔧 Fix Admin Dashboard Errors

## Vấn Đề

### 1. Git Conflict Markers
```html
<<<<<<< HEAD
    <link rel="stylesheet" href="../ad css/main.css">
=======
    <link rel="stylesheet" href="main.css">
>>>>>>> 96a7be08267c38a82cef3d6be56654721136045f
```

### 2. MIME Type Error
```
Refused to apply style from '<URL>' because its MIME type ('application/json') 
is not a supported stylesheet MIME type
```

### 3. 404 Errors
```
Failed to load resource: 404 (Not Found)
- api.js
- dashboard.js
```

## Giải Pháp

### 1. Resolved Git Conflicts
✅ Xóa tất cả conflict markers
✅ Chọn version đúng:
- `<link rel="stylesheet" href="main.css">`
- `<script src="/js/api.js"></script>`

### 2. Fixed Script Paths
**Trước:**
```html
<script src="api.js"></script>
<script src="dashboard.js"></script>
```

**Sau:**
```html
<script src="/js/api.js"></script>
<script src="notification.js"></script>
<script src="dashboard.js"></script>
```

### 3. Created Missing Files
✅ Created `admin/pages/dashboard.js`
✅ Using `/js/api.js` from frontend (shared API)

## File Structure

```
admin/pages/
├── dashboard.html          ✅ Fixed conflicts
├── dashboard.js            ✅ Created
├── notification.js         ✅ Exists
├── auth-check.js          ✅ Exists
├── main.css               ⚠️  Need to check
└── ...
```

## Scripts Loading Order

1. `/js/api.js` - Shared API functions
2. `notification.js` - Notification system
3. `dashboard.js` - Dashboard specific logic
4. Inline script - Dashboard initialization

## CSS Path

Current: `href="main.css"`
- Looks for: `/admin/pages/main.css`
- Should exist or create it

## Test

### 1. Check Console
```javascript
// Should not see:
❌ MIME type error
❌ 404 errors
❌ Syntax errors

// Should see:
✅ MongoDB connected
✅ Dashboard data loaded
```

### 2. Check Dashboard
- Stats cards show numbers
- Recent orders table populated
- Low stock products displayed
- No error messages

### 3. Check Network Tab
All resources should load with 200 status:
- ✅ main.css (200)
- ✅ /js/api.js (200)
- ✅ notification.js (200)
- ✅ dashboard.js (200)

## If Still Have Errors

### MIME Type Error
Check server.js for correct MIME types:
```javascript
app.use(express.static('admin', {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));
```

### 404 for main.css
Create or check if file exists:
```bash
# Check if exists
ls admin/pages/main.css

# If not, copy from another location or create
```

### API Errors
Check if server is running:
```bash
npm run dev
```

Check if logged in as admin:
```javascript
// Console
localStorage.getItem('token')
JSON.parse(localStorage.getItem('user')).role // Should be 'admin'
```

## Summary

✅ Resolved Git conflicts
✅ Fixed script paths
✅ Created missing dashboard.js
✅ Using shared /js/api.js
✅ No more syntax errors

Dashboard should now load without errors! 🎉
