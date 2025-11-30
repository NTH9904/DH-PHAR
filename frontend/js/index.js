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

// Dựa trên các ví dụ về hiệu ứng đánh máy cho placeholder
document.addEventListener('DOMContentLoaded', function() {
    const inputElement = document.getElementById('search-input');
    // Danh sách các từ khóa gợi ý sẽ được 'đánh máy'
    const words = [
        "Tìm kiếm thuốc ho,cảm cúm.....",
        "Tìm kiếm hoạt chất Paracetamol......",
        "Tìm kiếm triệu chứng đau đầu.....",
        "Tìm kiếm vitamin, thực phẩm chức năng....."
    ];
    let wordIndex = 0; // Chỉ số từ hiện tại trong mảng words
    let charIndex = 0; // Chỉ số ký tự hiện tại đang được gõ/xóa
    let isDeleting = false; // Trạng thái: đang xóa hay đang gõ
    const typingSpeed = 100; // Tốc độ gõ (ms)
    const deletingSpeed = 50; // Tốc độ xóa (ms)
    const pauseTime = 1500; // Thời gian dừng lại sau khi gõ xong một từ (ms)

    function typeEffect() {
        const currentWord = words[wordIndex % words.length];
        
        // 1. Logic cho trạng thái GÕ (Typing)
        if (!isDeleting) {
            // Lấy ký tự tiếp theo và gán vào placeholder
            charIndex++;
            inputElement.placeholder = currentWord.substring(0, charIndex);

            // Nếu đã gõ xong toàn bộ từ hiện tại
            if (charIndex === currentWord.length) {
                isDeleting = true; // Chuyển sang chế độ xóa
                setTimeout(typeEffect, pauseTime); // Tạm dừng trước khi xóa
                return;
            }
        // 2. Logic cho trạng thái XÓA (Deleting)
        } else {
            // Xóa lùi ký tự
            charIndex--;
            inputElement.placeholder = currentWord.substring(0, charIndex);

            // Nếu đã xóa xong toàn bộ
            if (charIndex === 0) {
                isDeleting = false; // Chuyển sang chế độ gõ
                wordIndex++; // Chuyển sang từ tiếp theo
            }
        }

        // 3. Tự động gọi lại hàm (Looping)
        let delay = isDeleting ? deletingSpeed : typingSpeed;
        
        // Ngăn chặn hiệu ứng chạy khi người dùng đang nhập liệu
        if (document.activeElement === inputElement && inputElement.value.length > 0) {
            // Nếu có dữ liệu, dừng hiệu ứng và đặt placeholder mặc định
            inputElement.placeholder = "Tìm kiếm thuốc, hoạt chất, triệu chứng...";
            return;
        }

        setTimeout(typeEffect, delay);
    }

    // Bắt đầu hiệu ứng
    typeEffect();
});