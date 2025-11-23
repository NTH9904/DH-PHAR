// Lấy mã định danh sản phẩm từ URL (id hoặc slug)
const urlParams = new URLSearchParams(window.location.search);
const productIdParam = urlParams.get('id') || urlParams.get('slug');

// tải thông tin sản phẩm
async function loadProductDetail() {
    const container = document.getElementById('product-detail');

    if (!productIdParam) {
        container.innerHTML = '<p class="text-center text-error">Không tìm thấy sản phẩm</p>';
        return;
    }

    try {
        let product = null;

        // dùng try fetching by ID trước (tìm kiếm theo ID)
        try {
            const response = await window.API.products.getById(productIdParam);
            product = response.data;
        } catch (err) {
            // nếu tìm theo ID thất bại thì dùng slug
            try {
                const resp2 = await window.API.products.getBySlug(productIdParam);
                product = resp2.data;
            } catch (err2) {
                throw err; // làm lại bản gốc
            }
        }

        if (!product) {
            container.innerHTML = '<p class="text-center text-error">Không tìm thấy sản phẩm</p>';
            return;
        }

        // Determine a safe image src: only allow same-origin or data: URIs, otherwise use inline SVG placeholder
        const PLACEHOLDER_DATA_URI = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
                <rect width="100%" height="100%" fill="#f3f4f6"/>
                <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Arial, Helvetica, sans-serif" font-size="20">No image</text>
            </svg>
        `);
        let imageUrl = product.images?.[0]?.url;
        let imageSrc = PLACEHOLDER_DATA_URI;
        if (imageUrl) {
            try {
                const parsed = new URL(imageUrl, window.location.href);
                if (parsed.origin === window.location.origin || imageUrl.startsWith('/')) {
                    imageSrc = imageUrl;
                } else if (imageUrl.startsWith('data:')) {
                    imageSrc = imageUrl;
                } else {
                    // external host not allowed by CSP - fall back to placeholder
                    imageSrc = '/assets/images/placeholder.jpg';
                }
            } catch (e) {
                imageSrc = '/assets/images/placeholder.jpg';
            }
        }

        container.innerHTML = `
                    <div class="grid grid-2" style="gap: 40px; margin-bottom: 40px;">
                        <div>
                            <img data-role="product-image" src="${imageSrc}" 
                                 alt="${product.name}" 
                                 style="width: 100%; border-radius: 12px; box-shadow: var(--shadow-lg);">
                        </div>
                        <div>
                            <h1 style="margin-bottom: 16px;">${product.name}</h1>
                            ${product.nameEn ? `<p style="color: var(--text-light); margin-bottom: 16px;">${product.nameEn}</p>` : ''}
                            
                            <div style="margin-bottom: 24px;">
                                <div style="font-size: 32px; font-weight: 700; color: var(--primary-color); margin-bottom: 8px;">
                                    ${window.utils?.formatCurrency(product.price) || (product.price ? product.price.toLocaleString('vi-VN') + ' đ' : '')}
                                </div>
                                ${product.originalPrice ? `
                                    <div style="color: var(--text-light); text-decoration: line-through;">
                                        ${window.utils?.formatCurrency(product.originalPrice) || product.originalPrice.toLocaleString('vi-VN') + ' đ'}
                                    </div>
                                ` : ''}
                            </div>

                            ${product.type === 'prescription' ? `
                                <div class="alert alert-warning" style="margin-bottom: 24px;">
                                    <strong>⚠️ Thuốc kê đơn:</strong> Sản phẩm này cần có đơn thuốc từ bác sĩ.
                                </div>
                            ` : ''}

                            <div style="margin-bottom: 24px;">
                                <label class="form-label">Số lượng:</label>
                                    <div style="display: flex; gap: 16px; align-items: center;">
                                    <button class="btn btn-outline" data-action="qty-decrease">-</button>
                                    <input type="number" id="quantity" value="1" min="1" max="${product.maxOrderQuantity || 10}" 
                                           style="width: 80px; text-align: center;" class="form-control">
                                    <button class="btn btn-outline" data-action="qty-increase">+</button>
                                    <span style="color: var(--text-light);">
                                        (Còn ${product.stock} sản phẩm)
                                    </span>
                                </div>
                            </div>

                            <div style="display: flex; gap: 16px; margin-bottom: 24px;">
                                <button class="btn btn-primary btn-lg" data-action="add-to-cart" style="flex: 1;">
                                    🛒 Thêm vào giỏ hàng
                                </button>
                                <button class="btn btn-secondary btn-lg" data-action="buy-now" style="flex: 1;">
                                    Mua ngay
                                </button>
                            </div>

                            <div class="card">
                                <div class="card-body">
                                    <h3 style="margin-bottom: 16px;">Thông tin sản phẩm</h3>
                                    <table style="width: 100%;">
                                        <tr>
                                            <td style="padding: 8px 0; font-weight: 600;">Hoạt chất:</td>
                                            <td style="padding: 8px 0;">${product.genericName || 'N/A'}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0; font-weight: 600;">Nhà sản xuất:</td>
                                            <td style="padding: 8px 0;">${product.manufacturer || 'N/A'}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0; font-weight: 600;">Quy cách:</td>
                                            <td style="padding: 8px 0;">${product.specifications?.packageSize || 'N/A'}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 8px 0; font-weight: 600;">Đánh giá:</td>
                                            <td style="padding: 8px 0;">
                                                ⭐ ${product.ratings?.average?.toFixed(1) || '0.0'} 
                                                (${product.ratings?.count || 0} đánh giá)
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card" style="margin-bottom: 40px;">
                        <div class="card-body">
                            <h2 style="margin-bottom: 24px;">Mô tả sản phẩm</h2>
                            <div style="margin-bottom: 24px;">
                                <h3>Công dụng:</h3>
                                <ul>
                                    ${(product.indications && product.indications.length) ? product.indications.map(ind => `<li>${ind}</li>`).join('') : '<li>N/A</li>'}
                                </ul>
                            </div>
                            ${product.dosage ? `
                                <div style="margin-bottom: 24px;">
                                    <h3>Liều dùng:</h3>
                                    <p>${product.dosage}</p>
                                </div>
                            ` : ''}
                            ${product.usage ? `
                                <div style="margin-bottom: 24px;">
                                    <h3>Cách dùng:</h3>
                                    <p>${product.usage}</p>
                                </div>
                            ` : ''}
                            ${product.contraindications?.length > 0 ? `
                                <div style="margin-bottom: 24px;">
                                    <h3>Chống chỉ định:</h3>
                                    <ul>
                                        ${product.contraindications.map(cont => `<li>${cont}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                            ${product.sideEffects?.length > 0 ? `
                                <div style="margin-bottom: 24px;">
                                    <h3>Tác dụng phụ:</h3>
                                    <ul>
                                        ${product.sideEffects.map(eff => `<li>${eff}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                            ${product.storage ? `
                                <div>
                                    <h3>Bảo quản:</h3>
                                    <p>${product.storage}</p>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
        // Attach event listeners for image error and controls (avoid inline handlers to satisfy CSP)
        const imgEl = container.querySelector('img[data-role="product-image"]');
        if (imgEl) {
            imgEl.addEventListener('error', () => {
                imgEl.src = PLACEHOLDER_DATA_URI;
            });
        }

        // quantity buttons
        const decBtn = container.querySelector('button[data-action="qty-decrease"]');
        const incBtn = container.querySelector('button[data-action="qty-increase"]');
        if (decBtn) decBtn.addEventListener('click', () => updateQuantity(-1));
        if (incBtn) incBtn.addEventListener('click', () => updateQuantity(1));

        // add to cart / buy now
        const addBtn = container.querySelector('button[data-action="add-to-cart"]');
        const buyBtn = container.querySelector('button[data-action="buy-now"]');
        if (addBtn) addBtn.addEventListener('click', addToCartProductDetail);
        if (buyBtn) buyBtn.addEventListener('click', buyNow);
    } catch (error) {
        console.error('Error loading product:', error);
        container.innerHTML = '<p class="text-center text-error">Không thể tải thông tin sản phẩm</p>';
    }
}

function updateQuantity(change) {
    const input = document.getElementById('quantity');
    const current = parseInt(input.value) || 1;
    const max = parseInt(input.max) || 10;
    const newValue = Math.max(1, Math.min(max, current + change));
    input.value = newValue;
}

function addToCartProductDetail() {
    const quantityEl = document.getElementById('quantity');
    if (!quantityEl) {
        console.error('Không tìm thấy input quantity');
        return;
    }
    const quantity = parseInt(quantityEl.value) || 1;

    // Gọi hàm addToCart từ cart.js
    window.Cart.addToCart(productIdParam, quantity);
}

function buyNow() {
    const quantity = parseInt(document.getElementById('quantity').value) || 1;
    window.Cart.addToCart(productIdParam, quantity);
    window.location.href = '/pages/checkout.html';
}

// expose for inline handlers (if any)
window.addToCartProductDetail = addToCartProductDetail;
window.buyNow = buyNow;

// khởi tạo
loadProductDetail();