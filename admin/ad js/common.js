// Common admin functions

// Check authentication
function checkAdminAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    console.log('Current user:', user);
    console.log('Token:', token ? 'Present' : 'Missing');

    if (!token) {
        alert('Bạn cần đăng nhập');
        window.location.href = '/pages/login.html';
        return false;
    }

    if (user.role !== 'admin') {
        alert('Bạn cần quyền admin để truy cập trang này');
        window.location.href = '/pages/index.html';
        return false;
    }

    return true;
}

// Logout function
function logout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/pages/login.html';
    }
}

// Initialize admin page
function initAdminPage() {
    // Check auth on page load
    if (!checkAdminAuth()) {
        return;
    }
    
    console.log('Admin page initialized');
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initAdminPage();
});