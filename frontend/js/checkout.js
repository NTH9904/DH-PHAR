async function loadCheckout() {
    const container = document.getElementById('checkout-content');
    const token = window.API.getToken();

    if (!token) {
        container.innerHTML = `
            <div class="alert alert-warning">
                <p>Vui lòng <a href="/pages/login.html">đăng nhập</a> để thanh toán</p>
            </div>
        `;
        return;
    }

    const cart = window.Cart.getCart();
    if (cart.items.length === 0) {
        container.innerHTML = `
            <div class="alert alert-warning">
                <p>Giỏ hàng trống. <a href="/pages/products.html">Tiếp tục mua sắm</a></p>
            </div>
        `;
        return;
    }

    try {
        // Load user addresses
        const addressesResponse = await window.API.users.getAddresses();
        const addresses = addressesResponse.data || [];

        // Calculate totals and check for prescription products
        let subtotal = 0;
        const items = [];
        let hasPrescriptionProduct = false;
        
        for (const item of cart.items) {
            const product = await window.API.products.getById(item.productId);
            const productData = product.data;
            const itemTotal = productData.price * item.quantity;
            subtotal += itemTotal;
            
            // Check if product requires prescription
            if (productData.type === 'prescription') {
                hasPrescriptionProduct = true;
            }
            
            items.push({
                productId: item.productId,
                quantity: item.quantity,
                name: productData.name,
                price: productData.price,
                type: productData.type
            });
        }

        const shippingFee = subtotal >= 500000 ? 0 : 30000;
        const total = subtotal + shippingFee;

        container.innerHTML = `
            <form id="checkout-form">
                <div class="grid grid-2" style="gap: 24px;">
                    <div>
                        <div class="card" style="margin-bottom: 24px;">
                            <div class="card-header">
                                <h3>Địa chỉ giao hàng</h3>
                            </div>
                            <div class="card-body">
                                ${addresses.length > 0 ? `
                                    <div class="form-group">
                                        <label class="form-label">Chọn địa chỉ:</label>
                                        <select class="form-control" id="address-select">
                                            <option value="">Chọn địa chỉ</option>
                                            ${addresses.map((addr, index) => `
                                                <option value="${index}" ${addr.isDefault ? 'selected' : ''}>
                                                    ${addr.name} - ${addr.address}, ${addr.ward}, ${addr.district}, ${addr.city}
                                                </option>
                                            `).join('')}
                                        </select>
                                    </div>
                                    <button type="button" class="btn btn-outline" data-action="show-new-address">Thêm địa chỉ mới</button>
                                ` : ''}

                                <div id="address-form" ${addresses.length > 0 ? 'style="display: none;"' : ''}>
                                    <div class="form-group">
                                        <label class="form-label">Họ tên *</label>
                                        <input type="text" class="form-control" id="name" required>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Số điện thoại *</label>
                                        <input type="tel" class="form-control" id="phone" required>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Địa chỉ *</label>
                                        <input type="text" class="form-control" id="address" required>
                                    </div>
                                    <div class="grid grid-3" style="gap: 16px;">
                                        <div class="form-group">
                                            <label class="form-label">Phường/Xã *</label>
                                            <input type="text" class="form-control" id="ward" required>
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">Quận/Huyện *</label>
                                            <input type="text" class="form-control" id="district" required>
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">Thành phố *</label>
                                            <input type="text" class="form-control" id="city" required>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="card" style="margin-bottom: 24px;">
                            <div class="card-header">
                                <h3>Thời gian giao hàng</h3>
                            </div>
                            <div class="card-body">
                                <div class="form-group">
                                    <label class="form-label">Ngày giao hàng *</label>
                                    <input type="date" class="form-control" id="delivery-date" required min="${new Date().toISOString().split('T')[0]}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Khung giờ *</label>
                                    <select class="form-control" id="delivery-time" required>
                                        <option value="morning">Sáng (8:00 - 12:00)</option>
                                        <option value="afternoon">Chiều (13:00 - 17:00)</option>
                                        <option value="evening">Tối (18:00 - 21:00)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="card">
                            <div class="card-header">
                                <h3>Phương thức thanh toán</h3>
                            </div>
                            <div class="card-body">
                                <div class="form-group">
                                    <label>
                                        <input type="radio" name="payment-method" value="cod" checked>
                                        Thanh toán khi nhận hàng (COD)
                                    </label>
                                </div>
                                <div class="form-group">
                                    <label>
                                        <input type="radio" name="payment-method" value="bank_transfer">
                                        Chuyển khoản ngân hàng
                                    </label>
                                </div>
                                <div class="form-group">
                                    <label>
                                        <input type="radio" name="payment-method" value="vnpay">
                                        VNPay
                                    </label>
                                </div>
                                <div class="form-group">
                                    <label>
                                        <input type="radio" name="payment-method" value="momo">
                                        MoMo
                                    </label>
                                </div>
                            </div>
                        </div>

                        ${hasPrescriptionProduct ? `
                        <div class="card" style="margin-top: 24px;">
                            <div class="card-header">
                                <h3>⚠️ Đơn thuốc kê đơn</h3>
                            </div>
                            <div class="card-body">
                                <div class="alert alert-warning" style="margin-bottom: 16px;">
                                    <strong>Lưu ý:</strong> Giỏ hàng của bạn có thuốc kê đơn. Vui lòng upload đơn thuốc từ bác sĩ.
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Upload đơn thuốc *</label>
                                    <input type="file" class="form-control" id="prescription-file" accept="image/*,.pdf" required>
                                    <small style="color: var(--text-light); display: block; margin-top: 8px;">
                                        Chấp nhận: JPG, PNG, PDF (tối đa 5MB)
                                    </small>
                                </div>
                                <div id="prescription-preview" style="margin-top: 16px; display: none;">
                                    <img id="preview-image" src="" alt="Preview" style="max-width: 100%; max-height: 300px; border-radius: 8px; border: 2px solid var(--border-color);">
                                </div>
                            </div>
                        </div>
                        ` : ''}

                        <div class="card" style="margin-top: 24px;">
                            <div class="card-body">
                                <div class="form-group">
                                    <label class="form-label">Ghi chú (tùy chọn)</label>
                                    <textarea class="form-control" id="notes" rows="3"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div class="card" style="position: sticky; top: 100px;">
                            <div class="card-header">
                                <h3>Đơn hàng</h3>
                            </div>
                            <div class="card-body">
                                <div id="order-items">
                                    ${items.map(item => `
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                                            <div>
                                                <div>${item.name}</div>
                                                <div style="font-size: 14px; color: var(--text-light);">x${item.quantity}</div>
                                            </div>
                                            <div>${window.utils?.formatCurrency(item.price * item.quantity) || (item.price * item.quantity).toLocaleString('vi-VN') + ' đ'}</div>
                                        </div>
                                    `).join('')}
                                </div>
                                <hr style="margin: 24px 0;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <span>Tạm tính:</span>
                                    <span>${window.utils?.formatCurrency(subtotal) || subtotal.toLocaleString('vi-VN') + ' đ'}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <span>Phí vận chuyển:</span>
                                    <span>${shippingFee === 0 ? 'Miễn phí' : window.utils?.formatCurrency(shippingFee) || shippingFee.toLocaleString('vi-VN') + ' đ'}</span>
                                </div>
                                <hr style="margin: 24px 0;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 24px;">
                                    <strong style="font-size: 18px;">Tổng cộng:</strong>
                                    <strong style="font-size: 20px; color: var(--primary-color);">
                                        ${window.utils?.formatCurrency(total) || total.toLocaleString('vi-VN') + ' đ'}
                                    </strong>
                                </div>
                                <button type="submit" class="btn btn-primary btn-block btn-lg">
                                    Đặt hàng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        `;

        // attach behaviors
        const addressSelect = document.getElementById('address-select');
        if (addressSelect) {
            addressSelect.addEventListener('change', selectAddress);
        }

        const showNewBtn = container.querySelector('[data-action="show-new-address"]');
        if (showNewBtn) showNewBtn.addEventListener('click', showNewAddressForm);

        // Prescription file preview
        const prescriptionFile = document.getElementById('prescription-file');
        if (prescriptionFile) {
            prescriptionFile.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    // Validate file size (5MB)
                    if (file.size > 5 * 1024 * 1024) {
                        alert('File quá lớn! Vui lòng chọn file nhỏ hơn 5MB.');
                        e.target.value = '';
                        return;
                    }
                    
                    // Show preview for images
                    if (file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            const preview = document.getElementById('prescription-preview');
                            const img = document.getElementById('preview-image');
                            img.src = e.target.result;
                            preview.style.display = 'block';
                        };
                        reader.readAsDataURL(file);
                    }
                }
            });
        }

        const form = document.getElementById('checkout-form');
        if (form) form.addEventListener('submit', submitOrder);

    } catch (error) {
        console.error('Error loading checkout:', error);
        container.innerHTML = '<p class="text-center text-error">Không thể tải trang thanh toán</p>';
    }
}

function selectAddress() {
    const select = document.getElementById('address-select');
    if (!select) return;
    if (select.value === '') {
        showNewAddressForm();
    } else {
        const form = document.getElementById('address-form');
        if (form) form.style.display = 'none';
    }
}

function showNewAddressForm() {
    const form = document.getElementById('address-form');
    const select = document.getElementById('address-select');
    if (form) form.style.display = 'block';
    if (select) select.value = '';
}

async function submitOrder(e) {
    e.preventDefault();
    const form = document.getElementById('checkout-form');
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang xử lý...';

    try {
        const cart = window.Cart.getCart();
        const items = cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity
        }));

        const addressSelect = document.getElementById('address-select');
        let deliveryAddress;

        if (addressSelect && addressSelect.value !== '') {
            const addressesResponse = await window.API.users.getAddresses();
            const addresses = addressesResponse.data || [];
            deliveryAddress = addresses[parseInt(addressSelect.value)];
        } else {
            deliveryAddress = {
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                ward: document.getElementById('ward').value,
                district: document.getElementById('district').value,
                city: document.getElementById('city').value
            };
        }

        const orderData = {
            items,
            deliveryAddress,
            deliveryTime: {
                preferredDate: document.getElementById('delivery-date').value,
                preferredTimeSlot: document.getElementById('delivery-time').value
            },
            paymentMethod: document.querySelector('input[name="payment-method"]:checked').value,
            customerNotes: document.getElementById('notes').value
        };

        const response = await window.API.orders.create(orderData);

        if (orderData.paymentMethod === 'cod') {
            window.Cart.clearCart();
            window.location.href = `/pages/orders.html?order=${response.data._id}`;
            return;
        }

        window.location.href = `/pages/payment.html?order=${response.data._id}&method=${orderData.paymentMethod}`;
    } catch (error) {
        alert('Có lỗi xảy ra: ' + (error.message || error));
        const form = document.getElementById('checkout-form');
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Đặt hàng';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCheckout();
});