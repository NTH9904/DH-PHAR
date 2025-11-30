(function(){
    const statusLabels = {
        'pending': 'Chờ xác nhận',
        'confirmed': 'Đã xác nhận',
        'processing': 'Đang xử lý',
        'shipping': 'Đang giao hàng',
        'delivered': 'Đã giao hàng',
        'cancelled': 'Đã hủy',
        'returned': 'Đã trả hàng'
    };

    const statusColors = {
        'pending': 'warning',
        'confirmed': 'primary',
        'processing': 'primary',
        'shipping': 'primary',
        'delivered': 'success',
        'cancelled': 'danger',
        'returned': 'danger'
    };

    async function loadOrders() {
        const container = document.getElementById('orders-content');
        const orderId = new URLSearchParams(window.location.search).get('order');

        try {
            if (orderId) {
                const response = await window.API.orders.getById(orderId);
                const order = response.data;
                container.innerHTML = renderOrderDetail(order);
                attachCancelListeners(container);
            } else {
                const response = await window.API.orders.getMyOrders();
                const orders = response.data || [];

                if (orders.length === 0) {
                    container.innerHTML = `
                        <div class="text-center" style="padding: 60px 0;">
                            <div style="font-size: 64px; margin-bottom: 24px;">📦</div>
                            <h2>Chưa có đơn hàng nào</h2>
                            <p style="margin-bottom: 24px;">Bắt đầu mua sắm ngay!</p>
                            <a href="/pages/products.html" class="btn btn-primary">Mua sắm ngay</a>
                        </div>
                    `;
                    return;
                }

                container.innerHTML = orders.map(order => renderOrderCard(order)).join('');
                attachCancelListeners(container);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            if (error.message && error.message.includes('401')) {
                window.location.href = '/pages/login.html';
            } else {
                container.innerHTML = '<p class="text-center text-error">Không thể tải đơn hàng</p>';
            }
        }
    }

    function renderOrderCard(order) {
        return `
            <div class="card" style="margin-bottom: 24px;">
                <div class="card-body">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                        <div>
                            <h3>Đơn hàng #${order.orderNumber}</h3>
                            <p style="color: var(--text-light); margin-top: 4px;">${window.utils?.formatDate(order.createdAt) || new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                        <div>
                            <span class="badge badge-${statusColors[order.status] || 'primary'}">${statusLabels[order.status] || order.status}</span>
                        </div>
                    </div>
                    <div style="margin-bottom: 16px;">
                        ${order.items.map(item => `
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <span>${item.name} x${item.quantity}</span>
                                <span>${window.utils?.formatCurrency(item.subtotal) || item.subtotal.toLocaleString('vi-VN') + ' đ'}</span>
                            </div>
                        `).join('')}
                    </div>
                    <hr style="margin: 16px 0;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>Tổng cộng: ${window.utils?.formatCurrency(order.total) || order.total.toLocaleString('vi-VN') + ' đ'}</strong>
                        </div>
                        <div>
                            <a href="/pages/orders.html?order=${order._id}" class="btn btn-outline">Xem chi tiết</a>
                            ${['pending', 'confirmed'].includes(order.status) ? `<button class="btn btn-outline" data-action="cancel-order" data-id="${order._id}" style="color: var(--error-color); margin-left: 8px;">Hủy đơn</button>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderOrderDetail(order) {
        return `
            <div class="card">
                <div class="card-header">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h2>Đơn hàng #${order.orderNumber}</h2>
                        <span class="badge badge-${statusColors[order.status] || 'primary'}">${statusLabels[order.status] || order.status}</span>
                    </div>
                </div>
                <div class="card-body">
                    <div class="grid grid-2" style="gap: 24px; margin-bottom: 24px;">
                        <div>
                            <h3>Thông tin giao hàng</h3>
                            <p><strong>${order.deliveryAddress.name}</strong></p>
                            <p>${order.deliveryAddress.phone}</p>
                            <p>${order.deliveryAddress.address}, ${order.deliveryAddress.ward}, ${order.deliveryAddress.district}, ${order.deliveryAddress.city}</p>
                        </div>
                        <div>
                            <h3>Thông tin thanh toán</h3>
                            <p><strong>Phương thức:</strong> ${order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : order.paymentMethod}</p>
                            <p><strong>Trạng thái:</strong> ${order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</p>
                        </div>
                    </div>

                    <h3 style="margin-bottom: 16px;">Sản phẩm</h3>
                    <table style="width: 100%; margin-bottom: 24px;">
                        <thead>
                            <tr style="border-bottom: 2px solid var(--border-color);">
                                <th style="text-align: left; padding: 12px 0;">Sản phẩm</th>
                                <th style="text-align: right; padding: 12px 0;">Số lượng</th>
                                <th style="text-align: right; padding: 12px 0;">Giá</th>
                                <th style="text-align: right; padding: 12px 0;">Tổng</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr style="border-bottom: 1px solid var(--border-color);">
                                    <td style="padding: 12px 0;">${item.name}</td>
                                    <td style="text-align: right; padding: 12px 0;">${item.quantity}</td>
                                    <td style="text-align: right; padding: 12px 0;">${window.utils?.formatCurrency(item.price) || item.price.toLocaleString('vi-VN') + ' đ'}</td>
                                    <td style="text-align: right; padding: 12px 0;">${window.utils?.formatCurrency(item.subtotal) || item.subtotal.toLocaleString('vi-VN') + ' đ'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div style="text-align: right; margin-bottom: 24px;">
                        <p>Tạm tính: ${window.utils?.formatCurrency(order.subtotal) || order.subtotal.toLocaleString('vi-VN') + ' đ'}</p>
                        <p>Phí vận chuyển: ${window.utils?.formatCurrency(order.shippingFee) || order.shippingFee.toLocaleString('vi-VN') + ' đ'}</p>
                        ${order.discount > 0 ? `<p>Giảm giá: -${window.utils?.formatCurrency(order.discount) || order.discount.toLocaleString('vi-VN') + ' đ'}</p>` : ''}
                        <p><strong style="font-size: 18px;">Tổng cộng: ${window.utils?.formatCurrency(order.total) || order.total.toLocaleString('vi-VN') + ' đ'}</strong></p>
                    </div>

                    <div style="margin-top: 24px;">
                        <a href="/pages/orders.html" class="btn btn-outline">Quay lại danh sách</a>
                        ${['pending', 'confirmed'].includes(order.status) ? `
                            <button class="btn btn-outline" data-action="cancel-order" data-id="${order._id}" style="color: var(--error-color); margin-left: 8px;">Hủy đơn hàng</button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    function attachCancelListeners(container) {
        container.querySelectorAll('button[data-action="cancel-order"]').forEach(b => {
            b.addEventListener('click', () => cancelOrder(b.dataset.id));
        });
    }

    async function cancelOrder(orderId) {
        const reason = prompt('Lý do hủy đơn hàng:');
        if (!reason) return;

        if (confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
            try {
                await window.API.orders.cancel(orderId, reason);
                alert('Hủy đơn hàng thành công');
                loadOrders();
            } catch (error) {
                alert('Hủy đơn hàng thất bại: ' + (error.message || error));
            }
        }
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', loadOrders);
})();