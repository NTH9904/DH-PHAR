// Admin/Pharmacist Authentication Check
(function() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Check if user is logged in
    if (!token || !user.role) {
        alert('Vui lòng đăng nhập');
        window.location.href = '/pages/login.html';
        return;
    }
    
    // Check if user has admin or pharmacist role
    if (user.role !== 'admin' && user.role !== 'pharmacist') {
        alert('Bạn không có quyền truy cập trang này');
        window.location.href = '/pages/index.html';
        return;
    }
    
    // Restrict certain pages for pharmacist
    if (user.role === 'pharmacist') {
        // Get current page
        const currentPage = window.location.pathname;
        
        // List of restricted pages for pharmacist (only Products and Users)
        const restrictedPages = [
            '/admin/pages/products.html',
            '/admin/pages/users.html'
        ];
        
        // Check if current page is restricted
        if (restrictedPages.some(page => currentPage.includes(page))) {
            alert('Dược sĩ không có quyền truy cập trang này');
            window.location.href = '/admin/pages/prescriptions.html';
            return;
        }
        
        // Hide restricted menu items (but allow Dashboard access)
        document.addEventListener('DOMContentLoaded', function() {
            // Hide Products link
            const productsLink = document.querySelector('a[href*="products.html"]');
            if (productsLink) {
                productsLink.style.display = 'none';
            }
            
            // Hide Users link
            const usersLink = document.querySelector('a[href*="users.html"]');
            if (usersLink) {
                usersLink.style.display = 'none';
            }
        });
    }
    
    // Display user info
    document.addEventListener('DOMContentLoaded', function() {
        const userInfo = document.getElementById('admin-user-info');
        if (userInfo) {
            const roleText = user.role === 'admin' ? 'Quản trị viên' : 'Dược sĩ';
            const roleIcon = user.role === 'admin' ? '👑' : '💊';
            userInfo.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-weight: 600;">${roleIcon} ${user.name}</span>
                    <span style="font-size: 12px; background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 12px;">${roleText}</span>
                </div>
            `;
        }
    });
})();
