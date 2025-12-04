// Auto-inject new header for all pages
(function() {
    'use strict';

    const newHeaderHTML = `
        <div class="header-top">
            <div class="container">
                <div>📞 Hotline: 0344864576 | 💬 Zalo: 0344864576</div>
                <div>🚚 Giao hàng nhanh 2-4 giờ | ✅ Đảm bảo chất lượng</div>
            </div>
        </div>
        <div class="header-main">
            <div class="container">
                <a href="/pages/index.html" class="logo">
                    <span>💊</span>
                    <span>DH Pharmacy</span>
                </a>
                
                <div class="header-search">
                    <input type="text" id="header-search-input" placeholder="Mua thuốc, thực phẩm chức năng...">
                    <button type="button" onclick="performSearch()">🔍</button>
                </div>
                
                <div class="header-actions">
                    <a href="/pages/account.html" class="header-user-icon" id="header-user-link">
                        <span>👤</span>
                    </a>
                    <a href="/pages/cart.html" class="header-cart-icon">
                        <span>🛒</span>
                        <span>Giỏ hàng</span>
                        <span class="header-cart-badge">0</span>
                    </a>
                </div>
            </div>
        </div>
        
        <div class="header-nav">
            <div class="container">
                <a href="/pages/index.html">Trang chủ</a>
                <a href="/pages/products.html">Sản phẩm</a>
                <a href="/pages/consultation.html">Tư vấn</a>
                <a href="/pages/about.html">Giới thiệu</a>
            </div>
        </div>
    `;

    function injectHeader() {
        const header = document.querySelector('.header');
        if (!header) return;

        // Replace header content
        header.innerHTML = newHeaderHTML;

        // Set active nav link based on current page
        const currentPage = window.location.pathname;
        const navLinks = header.querySelectorAll('.header-nav a');
        
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPage || 
                (currentPage.includes(link.getAttribute('href').replace('/pages/', '')) && 
                 link.getAttribute('href') !== '/pages/index.html')) {
                link.classList.add('active');
            }
        });
    }

    // Inject header when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectHeader);
    } else {
        injectHeader();
    }
})();
