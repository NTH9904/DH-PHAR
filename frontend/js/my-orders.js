// My Orders Logic
let currentFilter = 'all';

// Check authentication
const token = window.API.getToken();
const user = window.API.getCurrentUser();

if (!token || !user) {
    document.getElementById('orders-list').innerHTML = `
        <div class="alert alert-warning">
            <h3>Vui lòng đăng nhập</h3>
            <p>Bạn cần đăng nhập để xem đơn hàng của mình.</p>
            <a href="/pages/login.html" class="btn btn-primary">Đăng nhập ngay</a>
        </div>
    `;
} else {
    // Update user menu
    document.getElementById('user-menu').innerHTML = `
        <span class="nav-link">Xin chào, ${user.name}</span>
        <a href="#" class="nav-link" onclick="logout()">Đăng xuất</a>
    `;
    
    // Load orders
    loadOrders();
}

// Filter tabs
document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.dataset.status;
        loadOrders();
    });
});

async function loadOrders() {
    const container = document.getElementById('orders-list');
    
    container.innerHTML = `
        <div class="text-center">
            <div class="spinner"></div>
            <p>Đang tải đơn hàng...</p>
        </div>
    `;
    
    try {
        const response = await window.API.orders.getMyOrders();
        let orders = response.data || [];
        
        // Filter by status
        if (currentFilter !== 'all') {
            orders = orders.filter(order => order.status === currentFilter);
        }
        
        // Sort by date (newest first)
        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        if (orders.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info">
                    <h3>Chưa có đơn hàng nào</h3>
                    <p>${currentFilter === 'all' ? 'Bạn chưa có đơn hàng nào.' : 'Không có đơn hàng với trạng thái này.'}</p>
                    <a href="/pages/products.html" class="btn btn-primary">Mua sắm ngay</a>
                </div>
            `;
            return;
        }
        
        container.innerHTML = orders.map(order => renderOrderCard(order)).join('');
        
    } catch (error) {
        console.error('Error loading orders:', error);
        container.innerHTML = `
            <div class="alert alert-danger">
                <h3>Có lỗi xảy ra</h3>
                <p>Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.</p>
            </div>
        `;
    }
}

function renderOrderCard(order) {
    const statusLabels = {
        'pending': 'Chờ xác nhận',
        'confirmed': 'Đã xác nhận',
        'processing': 'Đang chuẩn bị',
        'shipping': 'Đang giao hàng',
        'delivered': 'Đã giao hàng',
        'cancelled': 'Đã hủy'
    };
    
    const statusClass = `status-${order.status}`;
    const statusLabel = statusLabels[order.status] || order.status;
    
    return `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <div class="order-number">Đơn hàng #${order.orderNumber || order._id.substring(0, 8)}</div>
                    <div class="order-date">Đặt ngày: ${formatDate(order.createdAt)}</div>
                </div>
                <div class="order-status ${statusClass}">
                    ${getStatusIcon(order.status)} ${statusLabel}
                </div>
            </div>
            <div class="order-body">
                <div class="order-items">
                    ${order.items.slice(0, 3).map(item => `
                        <div class="order-item">
                            <div>
                                <div style="font-weight: 600;">${item.product?.name || 'Sản phẩm'}</div>
                                <div style="font-size: 14px; color: var(--text-light);">
                                    Số lượng: ${item.quantity} × ${formatCurrency(item.price)}
                                </div>
                            </div>
                            <div style="font-weight: 600;">
                                ${formatCurrency(item.price * item.quantity)}
                            </div>
                        </div>
                    `).join('')}
                    ${order.items.length > 3 ? `
                        <div style="text-align: center; padding: 10px; color: var(--text-light);">
                            ... và ${order.items.length - 3} sản phẩm khác
                        </div>
                    ` : ''}
                </div>
                <div class="order-total">
                    <span>Tổng cộng:</span>
                    <span style="color: var(--primary-color);">${formatCurrency(order.total)}</span>
                </div>
                <div class="order-actions">
                    <a href="/pages/order-tracking.html?id=${order._id}" class="btn btn-primary">
                        📍 Theo dõi đơn hàng
                    </a>
                    ${order.status === 'pending' ? `
                        <button class="btn btn-outline" onclick="cancelOrder('${order._id}')">
                            ❌ Hủy đơn
                        </button>
                    ` : ''}
                    ${order.status === 'delivered' ? `
                        <button class="btn btn-outline" onclick="reorder('${order._id}')">
                            🔄 Đặt lại
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

function getStatusIcon(status) {
    const icons = {
        'pending': '⏳',
        'confirmed': '✅',
        'processing': '📦',
        'shipping': '🚚',
        'delivered': '🎉',
        'cancelled': '❌'
    };
    return icons[status] || '📋';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

async function cancelOrder(orderId) {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    
    const reason = prompt('Vui lòng nhập lý do hủy đơn:');
    if (!reason) return;
    
    try {
        await window.API.orders.cancel(orderId, reason);
        alert('✅ Đã hủy đơn hàng thành công');
        loadOrders();
    } catch (error) {
        console.error('Error cancelling order:', error);
        alert('❌ Không thể hủy đơn hàng. Vui lòng thử lại sau.');
    }
}

async function reorder(orderId) {
    if (!confirm('Đặt lại đơn hàng này?')) return;
    
    try {
        // Get order details
        const response = await window.API.orders.getById(orderId);
        const order = response.data;
        
        // Add items to cart
        for (const item of order.items) {
            window.Cart.addToCart(item.product._id || item.productId, item.quantity);
        }
        
        alert('✅ Đã thêm sản phẩm vào giỏ hàng');
        window.location.href = '/pages/cart.html';
    } catch (error) {
        console.error('Error reordering:', error);
        alert('❌ Không thể đặt lại đơn hàng. Vui lòng thử lại sau.');
    }
}

function logout() {
    window.API.removeToken();
    window.API.removeCurrentUser();
    window.location.href = '/pages/login.html';
}
