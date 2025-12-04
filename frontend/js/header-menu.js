// Header functionality
(function() {
    'use strict';

    function initHeader() {
        // Update user dropdown
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const isLoggedIn = !!localStorage.getItem('token');
        const userLink = document.getElementById('header-user-link');
        
        if (userLink) {
            // Remove old click handler
            userLink.onclick = null;
            
            if (isLoggedIn) {
                // Show avatar icon
                userLink.innerHTML = '<span>👤</span>';
                userLink.title = user.name || 'Tài khoản';
                // Create dropdown menu
                createUserDropdown(user);
            } else {
                // Show "Đăng nhập" text
                userLink.innerHTML = '<span style="font-size: 15px; font-weight: 500;">Đăng nhập</span>';
                userLink.href = '/pages/login.html';
                userLink.title = 'Đăng nhập';
            }
        }

        // Update cart badge
        updateCartBadge();
    }
    
    function createUserDropdown(user) {
        const userLink = document.getElementById('header-user-link');
        if (!userLink) return;
        
        // Remove href to prevent navigation
        userLink.removeAttribute('href');
        userLink.style.cursor = 'pointer';
        userLink.title = user.name || 'Tài khoản';
        
        // Ensure userLink has position relative (already in CSS but make sure)
        userLink.style.position = 'relative';
        
        // Check if dropdown already exists
        let dropdown = document.getElementById('user-dropdown');
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.id = 'user-dropdown';
            dropdown.className = 'user-dropdown';
            dropdown.style.cssText = `
                position: fixed;
                background: white;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                border-radius: 8px;
                padding: 8px 0;
                min-width: 200px;
                display: none;
                z-index: 10000;
            `;
            
            // Append dropdown to body for better positioning
            document.body.appendChild(dropdown);
        }
        
        // Build dropdown content based on role
        const roleText = user.role === 'admin' ? 'Quản trị viên' : user.role === 'pharmacist' ? 'Dược sĩ' : 'Khách hàng';
        const roleIcon = user.role === 'admin' ? '👑' : user.role === 'pharmacist' ? '💊' : '👤';
        const roleBadgeColor = user.role === 'admin' ? '#E74C3C' : user.role === 'pharmacist' ? '#27AE60' : '#3498DB';
        
        let dropdownHTML = `
            <div style="padding: 12px 16px; border-bottom: 1px solid #E1E8ED;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                    <strong style="color: #2C3E50;">${user.name || 'User'}</strong>
                    <span style="background: ${roleBadgeColor}; color: white; font-size: 10px; padding: 2px 8px; border-radius: 10px; font-weight: 600;">${roleIcon} ${roleText}</span>
                </div>
                <div style="font-size: 12px; color: #7F8C8D;">${user.email || ''}</div>
            </div>
        `;
        
        if (user.role === 'admin' || user.role === 'pharmacist') {
            const roleText = user.role === 'admin' ? 'Quản trị viên' : 'Dược sĩ';
            const roleIcon = user.role === 'admin' ? '👑' : '💊';
            
            dropdownHTML += `
                <a href="/admin/pages/dashboard.html" class="dropdown-item">
                    <span>📊</span> Dashboard
                </a>
                ${user.role === 'admin' ? `
                    <a href="/admin/pages/products.html" class="dropdown-item">
                        <span>💊</span> Quản lý sản phẩm
                    </a>
                    <a href="/admin/pages/users.html" class="dropdown-item">
                        <span>👥</span> Quản lý người dùng
                    </a>
                ` : ''}
                <a href="/admin/pages/orders.html" class="dropdown-item">
                    <span>📦</span> Quản lý đơn hàng
                </a>
                <a href="/admin/pages/prescriptions.html" class="dropdown-item">
                    <span>📋</span> Đơn thuốc
                </a>
                <a href="/admin/pages/inventory.html" class="dropdown-item">
                    <span>📦</span> Kho hàng
                </a>
                <div style="height: 1px; background: #E1E8ED; margin: 8px 0;"></div>
            `;
        } else {
            dropdownHTML += `
                <a href="/pages/profile.html" class="dropdown-item">
                    <span>👤</span> Thông tin cá nhân
                </a>
                <a href="/pages/orders.html" class="dropdown-item">
                    <span>📦</span> Đơn hàng của tôi
                </a>
                <a href="/pages/my-orders.html" class="dropdown-item">
                    <span>📋</span> Lịch sử mua hàng
                </a>
                <div style="height: 1px; background: #E1E8ED; margin: 8px 0;"></div>
            `;
        }
        
        dropdownHTML += `
            <a href="#" class="dropdown-item" id="logout-btn">
                <span>🚪</span> Đăng xuất
            </a>
        `;
        
        dropdown.innerHTML = dropdownHTML;
        
        // Add CSS for dropdown items
        const style = document.createElement('style');
        style.textContent = `
            .dropdown-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 10px 16px;
                color: #2C3E50;
                text-decoration: none;
                transition: background 0.2s;
                font-size: 14px;
            }
            .dropdown-item:hover {
                background: #F8F9FA;
            }
            .dropdown-item span {
                font-size: 16px;
            }
        `;
        if (!document.getElementById('dropdown-styles')) {
            style.id = 'dropdown-styles';
            document.head.appendChild(style);
        }
        
        // Toggle dropdown on click
        userLink.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (dropdown.style.display === 'block') {
                dropdown.style.display = 'none';
            } else {
                // Position dropdown before showing
                const rect = userLink.getBoundingClientRect();
                dropdown.style.top = (rect.bottom + 5) + 'px';
                dropdown.style.right = (window.innerWidth - rect.right + 12) + 'px';
                dropdown.style.display = 'block';
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!userLink.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
        
        // Reposition dropdown on window resize
        window.addEventListener('resize', function() {
            if (dropdown.style.display === 'block') {
                const rect = userLink.getBoundingClientRect();
                dropdown.style.top = (rect.bottom + 5) + 'px';
                dropdown.style.right = (window.innerWidth - rect.right + 12) + 'px';
            }
        });
        
        // Handle logout
        setTimeout(() => {
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/pages/index.html';
                });
            }
        }, 100);
    }

    function updateCartBadge() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const badge = document.querySelector('.header-cart-badge');
        if (badge) {
            badge.textContent = totalItems;
            badge.style.display = totalItems > 0 ? 'block' : 'none';
        }
    }

    // Search function
    window.performSearch = function() {
        const searchInput = document.getElementById('header-search-input');
        if (searchInput && searchInput.value.trim()) {
            window.location.href = `/pages/products.html?search=${encodeURIComponent(searchInput.value.trim())}`;
        }
    };

    // Enter key to search
    document.addEventListener('DOMContentLoaded', function() {
        const searchInput = document.getElementById('header-search-input');
        if (searchInput) {
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    window.performSearch();
                }
            });
        }
    });

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHeader);
    } else {
        initHeader();
    }

    // Listen for cart updates
    window.addEventListener('storage', function(e) {
        if (e.key === 'cart') {
            updateCartBadge();
        }
    });
})();
