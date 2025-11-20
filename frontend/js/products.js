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

                container.innerHTML = `
                    <div class="grid grid-4">
                        ${products.map(product => `
                            <div class="product-card">
                                <img src="${product.images?.[0]?.url || '/assets/images/placeholder.jpg'}" 
                                     alt="${product.name}" 
                                     class="product-card-image"
                                     onerror="this.src='/assets/images/placeholder.jpg'">
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
                        `).join('')}
                    </div>
                `;

                // Pagination
                if (pages > 1) {
                    let paginationHTML = '<div style="display: flex; gap: 8px; justify-content: center; align-items: center;">';
                    
                    if (page > 1) {
                        paginationHTML += `<button class="btn btn-outline" onclick="loadProducts(${page - 1})">Trước</button>`;
                    }

                    for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i++) {
                        paginationHTML += `<button class="btn ${i === page ? 'btn-primary' : 'btn-outline'}" onclick="loadProducts(${i})">${i}</button>`;
                    }

                    if (page < pages) {
                        paginationHTML += `<button class="btn btn-outline" onclick="loadProducts(${page + 1})">Sau</button>`;
                    }

                    paginationHTML += '</div>';
                    document.getElementById('pagination').innerHTML = paginationHTML;
                } else {
                    document.getElementById('pagination').innerHTML = '';
                }

                currentPage = page;
            } catch (error) {
                console.error('Error loading products:', error);
                container.innerHTML = `
                    <div class="alert alert-error">
                        <p><strong>Lỗi khi tải sản phẩm:</strong> ${error.message || 'Không thể kết nối đến server'}</p>
                        <p style="margin-top: 16px;"><strong>Vui lòng kiểm tra:</strong></p>
                        <ul style="text-align: left; margin-top: 8px;">
                            <li>Server đã được khởi động? Chạy: <code>npm run dev</code></li>
                            <li>Database đã được seed? Chạy: <code>node scripts/seed.js</code></li>
                            <li>MongoDB đang chạy?</li>
                            <li>Mở Console (F12) để xem lỗi chi tiết</li>
                        </ul>
                        <button class="btn btn-primary" onclick="loadProducts(1)" style="margin-top: 16px;">Thử lại</button>
                    </div>
                `;
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