// Cart page script (moved from inline in cart.html)
// Depends on: window.API, window.Cart, window.utils

async function loadCart() {
    const container = document.getElementById('cart-content');
    const cart = window.Cart.getCart();

    if (!cart || !cart.items || cart.items.length === 0) {
        container.innerHTML = `
            <div class="text-center" style="padding: 60px 0;">
                <div style="font-size: 64px; margin-bottom: 24px;">🛒</div>
                <h2>Giỏ hàng trống</h2>
                <p style="margin-bottom: 24px;">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
                <a href="/pages/products.html" class="btn btn-primary">Tiếp tục mua sắm</a>
            </div>
        `;
        return;
    }

    try {
        let total = 0;
        const itemsHTML = [];

        // Shared placeholder image for missing images or products
        const PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
                <rect width="100%" height="100%" fill="#f3f4f6"/>
                <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Arial, Helvetica, sans-serif" font-size="20">No image</text>
            </svg>
        `);

        for (const item of cart.items) {
            let productData = null;

            // Try to fetch product by id. If that fails, and the id doesn't look like
            // a Mongo ObjectId, try fetching by slug. If still failing, render an
            // unavailable placeholder for this cart item and continue.
            try {
                const productResp = await window.API.products.getById(item.productId);
                productData = productResp.data;
            } catch (e) {
                console.warn('Product fetch by id failed for', item.productId, e && e.message);
                // If productId is not a 24-char hex string, attempt slug lookup
                const isObjectId = typeof item.productId === 'string' && /^[0-9a-fA-F]{24}$/.test(item.productId);
                if (!isObjectId && typeof item.productId === 'string') {
                    try {
                        const productResp = await window.API.products.getBySlug(item.productId);
                        productData = productResp.data;
                    } catch (e2) {
                        console.warn('Product fetch by slug also failed for', item.productId, e2 && e2.message);
                    }
                }
            }

            if (!productData) {
                // Product no longer exists or cannot be loaded — show a removable placeholder
                itemsHTML.push(`
                <div class="card" style="margin-bottom: 16px; opacity: .9;">
                    <div class="card-body">
                        <div style="display: flex; gap: 24px; align-items: center;">
                            <div style="width:120px; height:120px; background:#f3f4f6; display:flex; align-items:center; justify-content:center; border-radius:8px;">
                                <span style="color:#9ca3af">Không có hình</span>
                            </div>
                            <div style="flex: 1;">
                                <h3 style="margin-bottom: 8px;">Sản phẩm không tồn tại</h3>
                                <p style="color: var(--text-light); margin-bottom: 16px;">Sản phẩm có thể đã bị xóa hoặc không còn hợp lệ.</p>
                                <div style="display:flex; gap:12px; align-items:center;">
                                    <button class="btn btn-sm btn-outline" data-action="remove-item" data-id="${item.productId}" style="color: var(--error-color);">🗑️ Xóa</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                `);
                // Do not add anything to total for this item
                continue;
            }

            const itemTotal = (productData.price || 0) * item.quantity;
            total += itemTotal;

            // prepare safe image src

            let imgSrc = productData.images?.[0]?.url || '';
            try {
                const parsed = imgSrc ? new URL(imgSrc, window.location.href) : null;
                if (!imgSrc) imgSrc = PLACEHOLDER;
                else if (imgSrc.startsWith('data:')) imgSrc = imgSrc;
                else if (parsed && parsed.origin === window.location.origin) imgSrc = parsed.href;
                else imgSrc = PLACEHOLDER;
            } catch (e) {
                imgSrc = PLACEHOLDER;
            }

            itemsHTML.push(`
                <div class="card" style="margin-bottom: 16px;">
                    <div class="card-body">
                        <div style="display: flex; gap: 24px; align-items: center;">
                            <img data-role="cart-image" src="${imgSrc}" 
                                 alt="${productData.name}" 
                                 style="width: 120px; height: 120px; object-fit: cover; border-radius: 8px;">
                            <div style="flex: 1;">
                                <h3 style="margin-bottom: 8px;">${productData.name}</h3>
                                <p style="color: var(--text-light); margin-bottom: 16px;">${productData.genericName || ''}</p>
                                <div style="display: flex; gap: 24px; align-items: center;">
                                    <div>
                                        <label class="form-label">Số lượng:</label>
                                        <div style="display: flex; gap: 8px; align-items: center;">
                                            <button class="btn btn-sm btn-outline" data-action="qty-decrease" data-id="${item.productId}">-</button>
                                            <span style="min-width: 40px; text-align: center;">${item.quantity}</span>
                                            <button class="btn btn-sm btn-outline" data-action="qty-increase" data-id="${item.productId}">+</button>
                                        </div>
                                    </div>
                                    <div>
                                        <div style="font-size: 20px; font-weight: 700; color: var(--primary-color);">
                                            ${window.utils?.formatCurrency(productData.price) || (productData.price ? productData.price.toLocaleString('vi-VN') + ' đ' : '0 đ')}
                                        </div>
                                        <div style="font-size: 16px; color: var(--text-light);">
                                            Tổng: ${window.utils?.formatCurrency(itemTotal) || itemTotal.toLocaleString('vi-VN') + ' đ'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button class="btn btn-outline" data-action="remove-item" data-id="${item.productId}" style="color: var(--error-color);">
                                🗑️ Xóa
                            </button>
                        </div>
                    </div>
                </div>
            `);
        }

        container.innerHTML = `
            <div class="grid grid-2" style="gap: 24px;">
                <div>
                    ${itemsHTML.join('')}
                </div>
                <div>
                    <div class="card" style="position: sticky; top: 100px;">
                        <div class="card-header">
                            <h3>Tóm tắt đơn hàng</h3>
                        </div>
                        <div class="card-body">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                                <span>Tạm tính:</span>
                                <span>${window.utils?.formatCurrency(total) || total.toLocaleString('vi-VN') + ' đ'}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                                <span>Phí vận chuyển:</span>
                                <span>${total >= 500000 ? 'Miễn phí' : '30.000 đ'}</span>
                            </div>
                            <hr style="margin: 24px 0; border: none; border-top: 1px solid var(--border-color);">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 24px;">
                                <strong style="font-size: 18px;">Tổng cộng:</strong>
                                <strong style="font-size: 20px; color: var(--primary-color);">
                                    ${window.utils?.formatCurrency(total + (total >= 500000 ? 0 : 30000)) || (total + (total >= 500000 ? 0 : 30000)).toLocaleString('vi-VN') + ' đ'}
                                </strong>
                            </div>
                            <a href="/pages/checkout.html" class="btn btn-primary btn-block btn-lg">
                                Thanh toán
                            </a>
                            <a href="/pages/products.html" class="btn btn-outline btn-block" style="margin-top: 16px;">
                                Tiếp tục mua sắm
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // attach listeners for qty and remove
        container.querySelectorAll('button[data-action="qty-decrease"]').forEach(b => {
            const id = b.dataset.id;
            b.addEventListener('click', () => updateItemQuantity(id, -1));
        });
        container.querySelectorAll('button[data-action="qty-increase"]').forEach(b => {
            const id = b.dataset.id;
            b.addEventListener('click', () => updateItemQuantity(id, 1));
        });
        container.querySelectorAll('button[data-action="remove-item"]').forEach(b => {
            const id = b.dataset.id;
            b.addEventListener('click', () => removeItem(id));
        });

        // image error handlers
        container.querySelectorAll('img[data-role="cart-image"]').forEach(img => {
            img.addEventListener('error', () => {
                img.src = PLACEHOLDER;
            });
        });
    } catch (error) {
        console.error('Error loading cart:', error);
        container.innerHTML = '<p class="text-center text-error">Không thể tải giỏ hàng</p>';
    }
}

function updateItemQuantity(productId, change) {
    const cart = window.Cart.getCart();
    const item = cart.items.find(i => i.productId === productId);
    if (item) {
        const newQuantity = Math.max(1, item.quantity + change);
        window.Cart.updateCartItem(productId, newQuantity);
        loadCart();
    }
}

function removeItem(productId) {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
        window.Cart.removeFromCart(productId);
        loadCart();
    }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    // Ensure dependencies loaded
    if (!window.API || !window.Cart || !window.utils) {
        // Defer slightly to give other scripts time to initialize
        setTimeout(loadCart, 200);
    } else {
        loadCart();
    }
});