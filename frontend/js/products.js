let currentPage = 1;
        const limit = 20;

        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search') || '';
        const categoryFilter = urlParams.get('category') || '';

        // Initialize filters
        document.getElementById('search-input').value = searchQuery;
        if (categoryFilter) {
            document.getElementById('filter-category').value = categoryFilter;
        }

        // Load categories
        async function loadCategories() {
            try {
                const response = await window.API.products.getCategories();
                const categories = response.data || [];
                const select = document.getElementById('filter-category');
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category;
                    option.textContent = category;
                    if (category === categoryFilter) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                });
            } catch (error) {
                console.error('Error loading categories:', error);
            }
        }

        // Load products
        async function loadProducts(page = 1) {
            const container = document.getElementById('products-container');
            container.innerHTML = '<div class="text-center"><div class="spinner"></div><p style="margin-top: 16px;">Đang tải sản phẩm...</p></div>';

            try {
                // Check if API is available
                if (!window.API || !window.API.products) {
                    container.innerHTML = `
                        <div class="alert alert-error">
                            <p><strong>Lỗi:</strong> API không khả dụng. Vui lòng kiểm tra:</p>
                            <ul style="text-align: left; margin-top: 16px;">
                                <li>Server đã được khởi động chưa? (npm run dev hoặc npm start)</li>
                                <li>Đã chạy seed database chưa? (node scripts/seed.js)</li>
                                <li>Mở Console (F12) để xem lỗi chi tiết</li>
                            </ul>
                        </div>
                    `;
                    return;
                }

                const params = {
                    page,
                    limit,
                    type: document.getElementById('filter-type').value,
                    category: document.getElementById('filter-category').value,
                    sort: document.getElementById('sort-by').value
                };

                if (searchQuery) {
                    params.search = searchQuery;
                }

                const priceFilter = document.getElementById('filter-price').value;
                if (priceFilter) {
                    const [min, max] = priceFilter.split('-');
                    if (min) params.minPrice = min;
                    if (max) params.maxPrice = max;
                }

                const response = await window.API.products.getAll(params);
                const products = response.data || [];
                const total = response.total || 0;
                const pages = response.pages || 1;

                if (products.length === 0) {
                    container.innerHTML = `
                        <div class="alert alert-warning">
                            <p><strong>Không tìm thấy sản phẩm nào</strong></p>
                            <p style="margin-top: 16px;">Có thể bạn chưa chạy seed database. Hãy chạy lệnh:</p>
                            <code style="display: block; background: #f4f4f4; padding: 8px; margin-top: 8px; border-radius: 4px;">node scripts/seed.js</code>
                        </div>
                    `;
                    return;
                }

                // Use same-origin or data: placeholder for images to avoid CSP img-src violations
                const PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
                        <rect width="100%" height="100%" fill="#f3f4f6"/>
                        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Arial, Helvetica, sans-serif" font-size="20">No image</text>
                    </svg>
                `);

                container.innerHTML = `
                    <div class="grid grid-4">
                        ${products.map(product => {
                            // determine safe image src
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
                                <img data-role="product-image" src="${img}" 
                                     alt="${product.name}" 
                                     class="product-card-image">
                                <div class="product-card-body">
                                    <h3 class="product-card-title">${product.name}</h3>
                                    <p style="font-size: 14px; color: var(--text-light); margin-bottom: 8px;">
                                        ${product.genericName || ''}
                                    </p>
                                    <div class="product-card-price">
                                        ${window.utils?.formatCurrency(product.price) || product.price.toLocaleString('vi-VN') + ' đ'}
                                    </div>
                                    ${product.type === 'prescription' ? '<span class="badge badge-warning">Cần đơn thuốc</span>' : ''}
                                </div>
                                <div class="product-card-footer">
                                    <a href="/pages/product-detail.html?id=${product._id}" class="btn btn-primary btn-block">Xem chi tiết</a>
                                </div>
                            </div>
                        `}).join('')}
                    </div>
                `;

                // Attach error handlers for images
                const imgs = container.querySelectorAll('img[data-role="product-image"]');
                imgs.forEach(imgEl => {
                    imgEl.addEventListener('error', () => {
                        imgEl.src = PLACEHOLDER;
                    });
                });

                // Pagination
                if (pages > 1) {
                    const paginationContainer = document.getElementById('pagination');
                    paginationContainer.innerHTML = '';
                    const wrap = document.createElement('div');
                    wrap.style.display = 'flex';
                    wrap.style.gap = '8px';
                    wrap.style.justifyContent = 'center';
                    wrap.style.alignItems = 'center';

                    if (page > 1) {
                        const prev = document.createElement('button');
                        prev.className = 'btn btn-outline';
                        prev.dataset.page = page - 1;
                        prev.textContent = 'Trước';
                        wrap.appendChild(prev);
                    }

                    for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i++) {
                        const btn = document.createElement('button');
                        btn.className = `btn ${i === page ? 'btn-primary' : 'btn-outline'}`;
                        btn.dataset.page = i;
                        btn.textContent = i;
                        wrap.appendChild(btn);
                    }

                    if (page < pages) {
                        const next = document.createElement('button');
                        next.className = 'btn btn-outline';
                        next.dataset.page = page + 1;
                        next.textContent = 'Sau';
                        wrap.appendChild(next);
                    }

                    paginationContainer.appendChild(wrap);

                    // attach listeners
                    paginationContainer.querySelectorAll('button[data-page]').forEach(b => {
                        b.addEventListener('click', () => loadProducts(Number(b.dataset.page)));
                    });
                } else {
                    document.getElementById('pagination').innerHTML = '';
                }

                currentPage = page;
            } catch (error) {
                console.error('Error loading products:', error);
                const errHtml = document.createElement('div');
                errHtml.className = 'alert alert-error';
                errHtml.innerHTML = `
                    <p><strong>Lỗi khi tải sản phẩm:</strong> ${error.message || 'Không thể kết nối đến server'}</p>
                    <p style="margin-top: 16px;"><strong>Vui lòng kiểm tra:</strong></p>
                    <ul style="text-align: left; margin-top: 8px;">
                        <li>Server đã được khởi động? Chạy: <code>npm run dev</code></li>
                        <li>Database đã được seed? Chạy: <code>node scripts/seed.js</code></li>
                        <li>MongoDB đang chạy?</li>
                        <li>Mở Console (F12) để xem lỗi chi tiết</li>
                    </ul>
                `;
                const retryBtn = document.createElement('button');
                retryBtn.className = 'btn btn-primary';
                retryBtn.style.marginTop = '16px';
                retryBtn.textContent = 'Thử lại';
                retryBtn.addEventListener('click', () => loadProducts(1));
                errHtml.appendChild(retryBtn);
                container.innerHTML = '';
                container.appendChild(errHtml);
            }
        }

        // Event listeners
        document.getElementById('filter-type').addEventListener('change', () => loadProducts(1));
        document.getElementById('filter-category').addEventListener('change', () => loadProducts(1));
        document.getElementById('sort-by').addEventListener('change', () => loadProducts(1));
        document.getElementById('filter-price').addEventListener('change', () => loadProducts(1));

        document.querySelector('.search-bar form').addEventListener('submit', (e) => {
            e.preventDefault();
            const query = document.getElementById('search-input').value;
            window.location.href = `/pages/products.html?search=${encodeURIComponent(query)}`;
        });

        // Initialize
        loadCategories();
        loadProducts(1);