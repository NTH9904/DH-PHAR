// Order Tracking Logic
let orderId = null;
let autoRefreshInterval = null;

// Get order ID from URL
const urlParams = new URLSearchParams(window.location.search);
orderId = urlParams.get('id');

if (!orderId) {
    document.getElementById('tracking-content').innerHTML = `
        <div class="alert alert-warning">
            <h3>Không tìm thấy mã đơn hàng</h3>
            <p>Vui lòng truy cập từ trang đơn hàng của bạn.</p>
            <a href="/pages/profile.html" class="btn btn-primary">Xem đơn hàng</a>
        </div>
    `;
} else {
    loadOrderTracking();
    // Auto refresh every 30 seconds
    autoRefreshInterval = setInterval(loadOrderTracking, 30000);
}

async function loadOrderTracking() {
    const container = document.getElementById('tracking-content');
    const token = window.API.getToken();

    if (!token) {
        container.innerHTML = `
            <div class="alert alert-warning">
                <p>Vui lòng <a href="/pages/login.html">đăng nhập</a> để xem đơn hàng</p>
            </div>
        `;
        return;
    }

    try {
        const response = await window.API.orders.getById(orderId);
        const order = response.data;

        if (!order) {
            container.innerHTML = `
                <div class="alert alert-danger">
                    <h3>Không tìm thấy đơn hàng</h3>
                    <p>Đơn hàng không tồn tại hoặc đã bị xóa.</p>
                </div>
            `;
            return;
        }

        renderOrderTracking(order);
    } catch (error) {
        console.error('Error loading order:', error);
        container.innerHTML = `
            <div class="alert alert-danger">
                <h3>Có lỗi xảy ra</h3>
                <p>Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.</p>
            </div>
        `;
    }
}

function renderOrderTracking(order) {
    const container = document.getElementById('tracking-content');
    
    const statusSteps = [
        { key: 'pending', icon: '📝', title: 'Chờ xác nhận', desc: 'Đơn hàng đang chờ admin xác nhận' },
        { key: 'confirmed', icon: '✅', title: 'Đã xác nhận', desc: 'Admin đã xác nhận đơn hàng' },
        { key: 'processing', icon: '📦', title: 'Đang chuẩn bị', desc: 'Đang đóng gói sản phẩm' },
        { key: 'shipping', icon: '🚚', title: 'Đang giao hàng', desc: 'Đơn hàng đang trên đường giao đến bạn' },
        { key: 'delivered', icon: '🎉', title: 'Đã giao hàng', desc: 'Đơn hàng đã được giao thành công' }
    ];

    const currentStatusIndex = statusSteps.findIndex(s => s.key === order.status);
    const isCancelled = order.status === 'cancelled';

    container.innerHTML = `
        <div class="order-header">
            <div class="order-number">Đơn hàng #${order.orderNumber || order._id.substring(0, 8)}</div>
            <div class="order-date">Đặt ngày: ${formatDate(order.createdAt)}</div>
            ${isCancelled ? `
                <div class="alert alert-danger" style="margin-top: 15px;">
                    <strong>❌ Đơn hàng đã bị hủy</strong>
                    ${order.cancelReason ? `<p>Lý do: ${order.cancelReason}</p>` : ''}
                </div>
            ` : ''}
        </div>

        ${!isCancelled ? `
        <div class="timeline">
            <h2 style="margin-bottom: 30px;">Trạng thái đơn hàng</h2>
            ${statusSteps.map((step, index) => {
                const isCompleted = index < currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const isPending = index > currentStatusIndex;
                
                return `
                    <div class="timeline-item">
                        ${index < statusSteps.length - 1 ? `
                            <div class="timeline-line ${isCompleted ? 'completed' : ''}"></div>
                        ` : ''}
                        <div class="timeline-icon ${isCompleted ? 'completed' : isCurrent ? 'current' : 'pending'}">
                            ${step.icon}
                        </div>
                        <div class="timeline-content">
                            <div class="timeline-title">${step.title}</div>
                            <div class="timeline-desc">${step.desc}</div>
                            ${isCurrent ? `
                                <div class="timeline-time" style="color: var(--primary-color); font-weight: 600;">
                                    ⏱️ Đang xử lý...
                                </div>
                            ` : isCompleted ? `
                                <div class="timeline-time">
                                    ✓ Hoàn thành
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        ` : ''}

        <div class="order-items">
            <h3 style="margin-bottom: 20px;">Chi tiết đơn hàng</h3>
            ${order.items.map(item => `
                <div class="item-row">
                    <div>
                        <div style="font-weight: 600;">${item.product?.name || 'Sản phẩm'}</div>
                        <div style="font-size: 14px; color: var(--text-light);">Số lượng: ${item.quantity}</div>
                    </div>
                    <div style="font-weight: 600;">
                        ${formatCurrency(item.price * item.quantity)}
                    </div>
                </div>
            `).join('')}
            <div class="item-row" style="border-top: 2px solid var(--border-color); margin-top: 15px; padding-top: 15px;">
                <div style="font-size: 18px; font-weight: 700;">Tổng cộng:</div>
                <div style="font-size: 20px; font-weight: 700; color: var(--primary-color);">
                    ${formatCurrency(order.total)}
                </div>
            </div>
        </div>

        <div class="order-items" style="margin-top: 20px;">
            <h3 style="margin-bottom: 15px;">Thông tin giao hàng</h3>
            <p><strong>Người nhận:</strong> ${order.shippingAddress?.name || 'N/A'}</p>
            <p><strong>Số điện thoại:</strong> ${order.shippingAddress?.phone || 'N/A'}</p>
            <p><strong>Địa chỉ:</strong> ${formatAddress(order.shippingAddress)}</p>
            <p><strong>Phương thức thanh toán:</strong> ${getPaymentMethodLabel(order.paymentMethod)}</p>
        </div>

        ${order.status === 'pending' ? `
            <div class="alert alert-info" style="margin-top: 20px;">
                <strong>💡 Lưu ý:</strong> Đơn hàng của bạn đang chờ admin xác nhận. 
                Chúng tôi sẽ xác nhận trong vòng 30 phút. 
                Trang này sẽ tự động cập nhật mỗi 30 giây.
            </div>
        ` : ''}
    `;
}

// formatDate and formatCurrency are already defined in main.js

function formatAddress(address) {
    if (!address) return 'N/A';
    return `${address.address}, ${address.ward}, ${address.district}, ${address.city}`;
}

function getPaymentMethodLabel(method) {
    const labels = {
        'cod': 'Thanh toán khi nhận hàng (COD)',
        'bank_transfer': 'Chuyển khoản ngân hàng',
        'vnpay': 'VNPay',
        'momo': 'MoMo'
    };
    return labels[method] || method;
}

// Refresh button
document.getElementById('refresh-btn').addEventListener('click', function() {
    this.classList.add('spinning');
    loadOrderTracking();
    setTimeout(() => {
        this.classList.remove('spinning');
    }, 1000);
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
});
