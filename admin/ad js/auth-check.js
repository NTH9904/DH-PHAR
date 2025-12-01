// Admin authentication check
(function() {
    const currentPath = window.location.pathname;
    const isLoginPage = currentPath.includes('login.html');
    
    // Skip check on login page
    if (isLoginPage) {
        return;
    }

    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!token || !user) {
        console.log('No authentication found, redirecting to login...');
        window.location.href = '/admin/pages/login.html';
        return;
    }

    // Check if user has admin or pharmacist role
    if (user.role !== 'admin' && user.role !== 'pharmacist') {
        console.log('User does not have admin privileges, redirecting...');
        alert('Bạn không có quyền truy cập trang này');
        window.location.href = '/';
        return;
    }

    console.log('✅ Authentication check passed for:', user.name, '(' + user.role + ')');
})();
