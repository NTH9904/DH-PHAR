(function(){
    const PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
            <rect width="100%" height="100%" fill="#f3f4f6"/>
            <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Arial, Helvetica, sans-serif" font-size="20">No image</text>
        </svg>
    `);

    async function loadFeaturedProducts() {
        try {
            const container = document.getElementById('featured-products');

            const response = await window.API.products.getFeatured();
            let products = response.data || [];

            if (!products || products.length === 0) {
                try {
                    const resp2 = await window.API.products.getAll({ page: 1, limit: 8 });
                    products = resp2.data || [];
                } catch (err) {
                    console.warn('Fallback to getAll failed:', err);
                    products = [];
                }
            }

            if (products.length === 0) {
                container.innerHTML = '<p class="text-center">Chưa có sản phẩm nổi bật</p>';
                return;
            }

            container.innerHTML = products.map(product => {
                let img = product.images?.[0]?.url || '';
                try {
                    const parsed = img ? new URL(img, window.location.href) : null;
                    if (!img) img = PLACEHOLDER;
                    else if (img.startsWith('data:')) img = img;
                    else if (parsed && parsed.origin === window.location.origin) img = parsed.href;
                    else img = PLACEHOLDER;
                } catch (e) {
                    img = PLACEHOLDER;
                }

                return `
                    <div class="product-card">
                        <img data-role="product-image" src="${img}" alt="${product.name}" class="product-card-image">
                        <div class="product-card-body">
                            <h3 class="product-card-title">${product.name}</h3>
                            <div class="product-card-price">${window.utils?.formatCurrency(product.price) || (product.price ? product.price.toLocaleString('vi-VN') + ' đ' : '')}</div>
                        </div>
                        <div class="product-card-footer">
                            <a href="/pages/product-detail.html?id=${product._id}" class="btn btn-primary btn-block">Xem chi tiết</a>
                        </div>
                    </div>
                `;
            }).join('');

            container.querySelectorAll('img[data-role="product-image"]').forEach(img => {
                img.addEventListener('error', () => img.src = PLACEHOLDER);
            });

        } catch (error) {
            console.error('Error loading featured products:', error);
            const el = document.getElementById('featured-products');
            if (el) el.innerHTML = '<p class="text-center text-error">Không thể tải sản phẩm</p>';
        }
    }

    async function loadCategories() {
        try {
            const response = await window.API.products.getCategories();
            const categories = response.data || [];
            const container = document.getElementById('categories');

            const categoryIcons = {
                'Thuốc kê đơn': '💊',
                'Thuốc không kê đơn': '💉',
                'Thực phẩm chức năng': '🥗',
                'Chăm sóc sức khỏe': '❤️',
                'Dụng cụ y tế': '🩺'
            };

            container.innerHTML = categories.map(cat => `
                <div class="card text-center" style="cursor: pointer;" data-action="goto-category" data-category="${encodeURIComponent(cat)}">
                    <div class="card-body">
                        <div style="font-size: 48px; margin-bottom: 16px;">${categoryIcons[cat] || '💊'}</div>
                        <h3>${cat}</h3>
                    </div>
                </div>
            `).join('');

            container.querySelectorAll('[data-action="goto-category"]').forEach(el => {
                el.addEventListener('click', () => {
                    const cat = decodeURIComponent(el.dataset.category);
                    window.location.href = `/pages/products.html?category=${encodeURIComponent(cat)}`;
                });
            });
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        loadFeaturedProducts();
        loadCategories();
    });
})();
