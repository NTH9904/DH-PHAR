// Lấy mã định danh sản phẩm từ URL (id hoặc slug)
const urlParams = new URLSearchParams(window.location.search);
const productIdParam = urlParams.get('id') || urlParams.get('slug');

// Store the actual product ID (not slug) for cart operations
let actualProductId = null;

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

        // Store the actual product ID for cart operations
        actualProductId = product._id;

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
                    <style>
                        .product-detail-grid {
                            display: grid;
                            grid-template-columns: 45% 55%;
                            gap: 32px;
                            margin-bottom: 40px;
                        }
                        @media (max-width: 768px) {
                            .product-detail-grid {
                                grid-template-columns: 1fr;
                            }
                        }
                    </style>
                    <div class="product-detail-grid">
                        <div style="background: white; padding: 32px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); display: flex; align-items: center; justify-content: center; min-height: 700px;">
                            <img data-role="product-image" src="${imageSrc}" 
                                 alt="${product.name}" 
                                 style="width: 100%; height: 650px; border-radius: 12px; object-fit: contain;">
                        </div>
                        <div style="background: white; padding: 32px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

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

                            <div style="margin-bottom: 24px; background: #f8f9fa; padding: 16px; border-radius: 8px;">
                                <label class="form-label" style="font-weight: 600; margin-bottom: 12px; display: block;">Số lượng:</label>
                                <div style="display: flex; gap: 12px; align-items: center;">
                                    <button class="btn btn-outline" data-action="qty-decrease" 
                                            style="width: 40px; height: 40px; padding: 0; font-size: 20px; font-weight: bold;">-</button>
                                    <input type="number" id="quantity" value="1" min="1" max="${product.maxOrderQuantity || 10}" 
                                           style="width: 80px; text-align: center; font-size: 18px; font-weight: 600; height: 40px;" class="form-control">
                                    <button class="btn btn-outline" data-action="qty-increase" 
                                            style="width: 40px; height: 40px; padding: 0; font-size: 20px; font-weight: bold;">+</button>
                                    <span style="color: #28a745; font-weight: 500; margin-left: 8px;">
                                        ✓ Còn ${product.stock} sản phẩm
                                    </span>
                                </div>
                            </div>

                            <div style="display: flex; gap: 12px; margin-bottom: 24px;">
                                <button class="btn btn-primary btn-lg" data-action="add-to-cart" 
                                        style="flex: 1; font-size: 16px; font-weight: 600; padding: 14px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
                                    🛒 Thêm vào giỏ hàng
                                </button>
                                <button class="btn btn-secondary btn-lg" data-action="buy-now" 
                                        style="flex: 1; font-size: 16px; font-weight: 600; padding: 14px; background: #28a745; border-color: #28a745; box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);">
                                    ⚡ Mua ngay
                                </button>
                            </div>

                            <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; border-left: 4px solid var(--primary-color);">
                                <h3 style="margin-bottom: 16px; color: var(--primary-color);">📋 Thông tin sản phẩm</h3>
                                <table style="width: 100%;">
                                    <tr>
                                        <td style="padding: 12px 0; font-weight: 600; color: #495057; width: 40%;">Hoạt chất:</td>
                                        <td style="padding: 12px 0; color: #212529;">${product.genericName || 'N/A'}</td>
                                    </tr>
                                    <tr style="border-top: 1px solid #e9ecef;">
                                        <td style="padding: 12px 0; font-weight: 600; color: #495057;">Nhà sản xuất:</td>
                                        <td style="padding: 12px 0; color: #212529;">${product.manufacturer || 'N/A'}</td>
                                    </tr>
                                    <tr style="border-top: 1px solid #e9ecef;">
                                        <td style="padding: 12px 0; font-weight: 600; color: #495057;">Quy cách:</td>
                                        <td style="padding: 12px 0; color: #212529;">${product.specifications?.packageSize || 'N/A'}</td>
                                    </tr>
                                    <tr style="border-top: 1px solid #e9ecef;">
                                        <td style="padding: 12px 0; font-weight: 600; color: #495057;">Đánh giá:</td>
                                        <td style="padding: 12px 0; color: #212529;">
                                            <span style="color: #ffc107;">⭐</span> ${product.ratings?.average?.toFixed(1) || '0.0'} 
                                            <span style="color: #6c757d;">(${product.ratings?.count || 0} đánh giá)</span>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div style="background: white; padding: 32px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 40px;">
                        <h2 style="margin-bottom: 32px; color: #212529; font-size: 28px; border-bottom: 3px solid var(--primary-color); padding-bottom: 12px; display: inline-block;">
                            📖 Mô tả sản phẩm
                        </h2>
                        
                        <div style="display: grid; gap: 24px;">
                            ${(product.indications && product.indications.length) ? `
                                <div style="background: #e7f3ff; padding: 20px; border-radius: 12px; border-left: 4px solid #0066cc;">
                                    <h3 style="color: #0066cc; margin-bottom: 12px; font-size: 18px;">✅ Công dụng</h3>
                                    <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
                                        ${product.indications.map(ind => `<li style="color: #495057;">${ind}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                            
                            ${product.dosage ? `
                                <div style="background: #fff3cd; padding: 20px; border-radius: 12px; border-left: 4px solid #ffc107;">
                                    <h3 style="color: #856404; margin-bottom: 12px; font-size: 18px;">💊 Liều dùng</h3>
                                    <p style="margin: 0; color: #495057; line-height: 1.8;">${product.dosage}</p>
                                </div>
                            ` : ''}
                            
                            ${product.usage ? `
                                <div style="background: #d1ecf1; padding: 20px; border-radius: 12px; border-left: 4px solid #17a2b8;">
                                    <h3 style="color: #0c5460; margin-bottom: 12px; font-size: 18px;">📝 Cách dùng</h3>
                                    <p style="margin: 0; color: #495057; line-height: 1.8;">
                                        ${typeof product.usage === 'object' ? product.usage.instructions : product.usage}
                                    </p>
                                </div>
                            ` : ''}
                            
                            ${product.contraindications?.length > 0 ? `
                                <div style="background: #f8d7da; padding: 20px; border-radius: 12px; border-left: 4px solid #dc3545;">
                                    <h3 style="color: #721c24; margin-bottom: 12px; font-size: 18px;">⚠️ Chống chỉ định</h3>
                                    <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
                                        ${product.contraindications.map(cont => `<li style="color: #495057;">${cont}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                            
                            ${product.sideEffects?.length > 0 ? `
                                <div style="background: #fff3e0; padding: 20px; border-radius: 12px; border-left: 4px solid #ff9800;">
                                    <h3 style="color: #e65100; margin-bottom: 12px; font-size: 18px;">⚡ Tác dụng phụ</h3>
                                    <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
                                        ${product.sideEffects.map(eff => `<li style="color: #495057;">${eff}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                            
                            ${product.storage ? `
                                <div style="background: #e8f5e9; padding: 20px; border-radius: 12px; border-left: 4px solid #4caf50;">
                                    <h3 style="color: #2e7d32; margin-bottom: 12px; font-size: 18px;">🌡️ Bảo quản</h3>
                                    <p style="margin: 0; color: #495057; line-height: 1.8;">${product.storage}</p>
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

    // Use actual product ID, not slug
    if (!actualProductId) {
        console.error('Product ID not loaded yet');
        return;
    }
    window.Cart.addToCart(actualProductId, quantity);
}

function buyNow() {
    const quantity = parseInt(document.getElementById('quantity').value) || 1;
    
    // Use actual product ID, not slug
    if (!actualProductId) {
        console.error('Product ID not loaded yet');
        return;
    }
    window.Cart.addToCart(actualProductId, quantity);
    window.location.href = '/pages/checkout.html';
}

// expose for inline handlers (if any)
window.addToCartProductDetail = addToCartProductDetail;
window.buyNow = buyNow;

// khởi tạo
loadProductDetail();