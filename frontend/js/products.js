let currentPage = 1;
        const limit = 20;

        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search') || '';
        const categoryFilter = urlParams.get('category') || '';

        // Initialize filters - with null checks
        const searchInput = document.getElementById('search-input') || document.getElementById('header-search-input');
        if (searchInput && searchQuery) {
            searchInput.value = searchQuery;
        }
        
        const categorySelect = document.getElementById('filter-category');
        if (categorySelect && categoryFilter) {
            categorySelect.value = categoryFilter;
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
                    limit
                };
                
                // Add filters with null checks
                const typeFilter = document.getElementById('filter-type');
                if (typeFilter && typeFilter.value) {
                    params.type = typeFilter.value;
                }
                
                const catFilter = document.getElementById('filter-category');
                if (catFilter && catFilter.value) {
                    params.category = catFilter.value;
                }
                
                const sortBy = document.getElementById('sort-by');
                if (sortBy && sortBy.value) {
                    params.sort = sortBy.value;
                }

                if (searchQuery) {
                    params.search = searchQuery;
                }

                const ageFilter = document.getElementById('filter-age');
                if (ageFilter && ageFilter.value) {
                    params.ageGroup = ageFilter.value;
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
                            <div class="product-card" onclick="window.location.href='/pages/product-detail.html?id=${product._id}'" style="cursor: pointer;">
                                <div class="product-image-link">
                                    <img data-role="product-image" 
                                         data-product-id="${product._id}"
                                         src="${img}" 
                                         alt="${product.name}" 
                                         class="product-card-image"
                                         style="transition: transform 0.3s ease;"
                                         onmouseover="this.style.transform='scale(1.05)'"
                                         onmouseout="this.style.transform='scale(1)'">
                                </div>
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
                            </div>
                        `}).join('')}
                    </div>
                `;

                // Attach error handlers and click handlers for images
                const imgs = container.querySelectorAll('img[data-role="product-image"]');
                imgs.forEach(imgEl => {
                    // Error handler
                    imgEl.addEventListener('error', () => {
                        imgEl.src = PLACEHOLDER;
                    });
                    
                    // Click handler - redirect to product detail
                    imgEl.addEventListener('click', (e) => {
                        e.preventDefault();
                        const productId = imgEl.getAttribute('data-product-id');
                        if (productId) {
                            console.log('🖱️ Clicked on product image:', productId);
                            window.location.href = `/pages/product-detail.html?id=${productId}`;
                        }
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

        // Event listeners - with null checks
        const filterType = document.getElementById('filter-type');
        if (filterType) {
            filterType.addEventListener('change', () => loadProducts(1));
        }
        
        const filterCategory = document.getElementById('filter-category');
        if (filterCategory) {
            filterCategory.addEventListener('change', () => loadProducts(1));
        }
        
        const sortBySelect = document.getElementById('sort-by');
        if (sortBySelect) {
            sortBySelect.addEventListener('change', () => loadProducts(1));
        }
        
        const filterAge = document.getElementById('filter-age');
        if (filterAge) {
            filterAge.addEventListener('change', () => loadProducts(1));
        }

        const searchForm = document.querySelector('.search-bar form');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const searchInput = document.getElementById('search-input') || document.getElementById('header-search-input');
                const query = searchInput ? searchInput.value : '';
                window.location.href = `/pages/products.html?search=${encodeURIComponent(query)}`;
            });
        }

        // Initialize
        loadCategories();
        loadProducts(1);