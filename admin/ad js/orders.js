// Orders management
let currentPage = 1;
let totalPages = 1;
let currentFilters = {};
let currentOrderId = null;

// Check authentication
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token || (user.role !== 'admin' && user.role !== 'pharmacist')) {
    alert('Bạn cần đăng nhập với tài khoản admin hoặc dược sĩ');
    window.location.href = '/pages/login.html';
}

// Load orders on page load
document.addEventListener('DOMContentLoaded', function() {
    loadOrders();
    loadOrderStats();
    setupEventListeners();
});

function setupEventListeners() {
    // Search input
    document.getElementById('search-input').addEventListener('input', debounce(function() {
        currentFilters.search = this.value;
        currentPage = 1;
        loadOrders();
    }, 500));

    // Filter selects
    ['status-filter', 'payment-filter'].forEach(id => {
        document.getElementById(id).addEventListener('change', function() {
            const filterName = id.replace('-filter', '');
            currentFilters[filterName] = this.value;
            currentPage = 1;
            loadOrders();
        });
    });

    // Date filters
    document.getElementById('date-from').addEventListener('change', function() {
        currentFilters.dateFrom = this.value;
        currentPage = 1;
        loadOrders();
    });

    document.getElementById('date-to').addEventListener('change', function() {
        currentFilters.dateTo = this.value;
        currentPage = 1;
        loadOrders();
    });

    // Status form
    document.getElementById('status-form').addEventListener('submit', handleStatusUpdate);
    
    // Show tracking field when shipping status is selected
    document.getElementById('new-status').addEventListener('change', function() {
        const trackingGroup = document.getElementById('tracking-group');
        if (this.value === 'shipping') {
            trackingGroup.style.display = 'block';
        } else {
            trackingGroup.style.display = 'none';
        }
    });
}

async function loadOrders() {
    try {
        showLoading();
        
        const params = new URLSearchParams({
            page: currentPage,
            limit: 20,
            ...currentFilters
        });

        const response = await fetch(`/api/orders/admin/all?${params}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Không thể tải danh sách đơn hàng');
        }

        const data = await response.json();
        displayOrders(data.data || []);
        updatePagination(data);
        
    } catch (error) {
        console.error('Error loading orders:', error);
        showError('Không thể tải danh sách đơn hàng');
    }
}

async function loadOrderStats() {
    try {
        // Get pending orders count
        const pendingResponse = await fetch('/api/orders/admin/all?status=pending&limit=1', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (pendingResponse.ok) {
            const pendingData = await pendingResponse.json();
            document.getElementById('pending-count').textContent = pendingData.total || 0;
        }
        
        // Get shipping orders count
        const shippingResponse = await fetch('/api/orders/admin/all?status=shipping&limit=1', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (shippingResponse.ok) {
            const shippingData = await shippingResponse.json();
            document.getElementById('shipping-count').textContent = shippingData.total || 0;
        }
    } catch (error) {
        console.error('Error loading order stats:', error);
        // Set default values on error
        document.getElementById('pending-count').textContent = '0';
        document.getElementById('shipping-count').textContent = '0';
    }
}

function displayOrders(orders) {
    const tbody = document.getElementById('orders-table');
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">Không có đơn hàng nào</td></tr>';
        return;
    }

    tbody.innerHTML = orders.map(order => `
        <tr>
            <td>
                <strong>${order.orderNumber}</strong>
                ${order.requiresPrescription ? '<br><span class="badge badge-warning">Cần đơn thuốc</span>' : ''}
            </td>
            <td>
                <div class="customer-info">
                    <strong>${order.user?.name || 'N/A'}</strong>
                    <br><small>${order.user?.email || ''}</small>
                    ${order.deliveryAddress?.phone ? `<br><small>📞 ${order.deliveryAddress.phone}</small>` : ''}
                </div>
            </td>
            <td>
                <div class="order-items">
                    ${order.items.slice(0, 2).map(item => `
                        <div class="item-row">
                            <span>${item.name}</span>
                            <small>x${item.quantity}</small>
                        </div>
                    `).join('')}
                    ${order.items.length > 2 ? `<small>+${order.items.length - 2} sản phẩm khác</small>` : ''}
                </div>
            </td>
            <td><strong>${formatCurrency(order.total)}</strong></td>
            <td>
                <span class="badge badge-${getPaymentStatusColor(order.paymentStatus)}">
                    ${getPaymentStatusLabel(order.paymentStatus)}
                </span>
                <br><small>${getPaymentMethodLabel(order.paymentMethod)}</small>
            </td>
            <td>
                <span class="badge badge-${getStatusColor(order.status)}">
                    ${getStatusLabel(order.status)}
                </span>
                ${order.trackingNumber ? `<br><small>📦 ${order.trackingNumber}</small>` : ''}
            </td>
            <td>${formatDate(order.createdAt)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-view" onclick="viewOrder('${order._id}')" title="Xem chi tiết">
                        👁️
                    </button>
                    <button class="btn-icon btn-edit" onclick="updateOrderStatus('${order._id}')" title="Cập nhật trạng thái">
                        ✏️
                    </button>
                    ${order.status === 'pending' ? `
                        <button class="btn-icon btn-delete" onclick="cancelOrder('${order._id}')" title="Hủy đơn">
                            ❌
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

function updatePagination(data) {
    currentPage = data.page || 1;
    totalPages = data.pages || 1;
    
    // Update info
    document.getElementById('showing-from').textContent = ((currentPage - 1) * 20) + 1;
    document.getElementById('showing-to').textContent = Math.min(currentPage * 20, data.total || 0);
    document.getElementById('total-orders').textContent = data.total || 0;
    
    // Generate pagination buttons
    const pagination = document.getElementById('pagination');
    let paginationHTML = '';
    
    // Previous button
    if (currentPage > 1) {
        paginationHTML += `<button class="btn-page" onclick="changePage(${currentPage - 1})">‹ Trước</button>`;
    }
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="btn-page ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }
    
    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `<button class="btn-page" onclick="changePage(${currentPage + 1})">Sau ›</button>`;
    }
    
    pagination.innerHTML = paginationHTML;
}

function changePage(page) {
    currentPage = page;
    loadOrders();
}

// Order Detail Modal
async function viewOrder(orderId) {
    try {
        const response = await fetch(`/api/orders/${orderId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Không thể tải chi tiết đơn hàng');
        }

        const data = await response.json();
        const order = data.data;
        
        displayOrderDetail(order);
        document.getElementById('order-modal').style.display = 'block';
        
    } catch (error) {
        console.error('Error loading order detail:', error);
        showError('Không thể tải chi tiết đơn hàng');
    }
}

function displayOrderDetail(order) {
    const detailContainer = document.getElementById('order-detail');
    
    detailContainer.innerHTML = `
        <div class="order-detail-content">
            <div class="detail-section">
                <h3>Thông tin đơn hàng</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Mã đơn hàng:</label>
                        <span>${order.orderNumber}</span>
                    </div>
                    <div class="detail-item">
                        <label>Ngày đặt:</label>
                        <span>${formatDateTime(order.createdAt)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Trạng thái:</label>
                        <span class="badge badge-${getStatusColor(order.status)}">
                            ${getStatusLabel(order.status)}
                        </span>
                    </div>
                    <div class="detail-item">
                        <label>Thanh toán:</label>
                        <span class="badge badge-${getPaymentStatusColor(order.paymentStatus)}">
                            ${getPaymentStatusLabel(order.paymentStatus)}
                        </span>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3>Thông tin khách hàng</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Tên:</label>
                        <span>${order.user?.name || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Email:</label>
                        <span>${order.user?.email || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Số điện thoại:</label>
                        <span>${order.deliveryAddress?.phone || 'N/A'}</span>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3>Địa chỉ giao hàng</h3>
                <div class="address-info">
                    <p><strong>${order.deliveryAddress?.name || order.user?.name}</strong></p>
                    <p>${order.deliveryAddress?.address}</p>
                    <p>${order.deliveryAddress?.ward}, ${order.deliveryAddress?.district}, ${order.deliveryAddress?.city}</p>
                    <p>📞 ${order.deliveryAddress?.phone}</p>
                </div>
            </div>

            <div class="detail-section">
                <h3>Sản phẩm đã đặt</h3>
                <table class="detail-table">
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th>Đơn giá</th>
                            <th>Số lượng</th>
                            <th>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${formatCurrency(item.price)}</td>
                                <td>${item.quantity}</td>
                                <td>${formatCurrency(item.subtotal)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="detail-section">
                <h3>Tổng kết thanh toán</h3>
                <div class="payment-summary">
                    <div class="summary-row">
                        <span>Tạm tính:</span>
                        <span>${formatCurrency(order.subtotal)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Phí vận chuyển:</span>
                        <span>${formatCurrency(order.shippingFee)}</span>
                    </div>
                    ${order.discount > 0 ? `
                        <div class="summary-row">
                            <span>Giảm giá:</span>
                            <span>-${formatCurrency(order.discount)}</span>
                        </div>
                    ` : ''}
                    <div class="summary-row total">
                        <span><strong>Tổng cộng:</strong></span>
                        <span><strong>${formatCurrency(order.total)}</strong></span>
                    </div>
                </div>
            </div>

            ${order.statusHistory && order.statusHistory.length > 0 ? `
                <div class="detail-section">
                    <h3>Lịch sử trạng thái</h3>
                    <div class="status-history">
                        ${order.statusHistory.map(history => `
                            <div class="history-item">
                                <div class="history-time">${formatDateTime(history.timestamp)}</div>
                                <div class="history-status">${getStatusLabel(history.status)}</div>
                                ${history.note ? `<div class="history-note">${history.note}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            ${order.customerNotes ? `
                <div class="detail-section">
                    <h3>Ghi chú của khách hàng</h3>
                    <p>${order.customerNotes}</p>
                </div>
            ` : ''}

            ${order.adminNotes ? `
                <div class="detail-section">
                    <h3>Ghi chú nội bộ</h3>
                    <p>${order.adminNotes}</p>
                </div>
            ` : ''}
        </div>
    `;
}

function closeOrderModal() {
    document.getElementById('order-modal').style.display = 'none';
}

// Status Update Modal
function updateOrderStatus(orderId) {
    currentOrderId = orderId;
    document.getElementById('status-modal').style.display = 'block';
}

function closeStatusModal() {
    document.getElementById('status-modal').style.display = 'none';
    currentOrderId = null;
}

async function handleStatusUpdate(e) {
    e.preventDefault();
    
    if (!currentOrderId) return;
    
    try {
        const formData = new FormData(e.target);
        const updateData = {
            status: formData.get('status'),
            note: formData.get('note'),
            trackingNumber: formData.get('trackingNumber')
        };
        
        const response = await fetch(`/api/orders/${currentOrderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Có lỗi xảy ra');
        }
        
        showSuccess('Cập nhật trạng thái thành công');
        closeStatusModal();
        loadOrders();
        loadOrderStats();
        
    } catch (error) {
        console.error('Error updating order status:', error);
        showError(error.message);
    }
}

async function cancelOrder(orderId) {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/orders/${orderId}/cancel`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                cancellationReason: 'Hủy bởi admin'
            })
        });
        
        if (!response.ok) {
            throw new Error('Không thể hủy đơn hàng');
        }
        
        showSuccess('Hủy đơn hàng thành công');
        loadOrders();
        loadOrderStats();
        
    } catch (error) {
        console.error('Error cancelling order:', error);
        showError(error.message);
    }
}

// Utility functions
function getStatusLabel(status) {
    const labels = {
        'pending': 'Chờ xử lý',
        'confirmed': 'Đã xác nhận',
        'processing': 'Đang xử lý',
        'shipping': 'Đang giao',
        'delivered': 'Đã giao',
        'cancelled': 'Đã hủy',
        'returned': 'Đã trả'
    };
    return labels[status] || status;
}

function getStatusColor(status) {
    const colors = {
        'pending': 'warning',
        'confirmed': 'info',
        'processing': 'info',
        'shipping': 'primary',
        'delivered': 'success',
        'cancelled': 'danger',
        'returned': 'secondary'
    };
    return colors[status] || 'secondary';
}

function getPaymentStatusLabel(status) {
    const labels = {
        'pending': 'Chưa thanh toán',
        'paid': 'Đã thanh toán',
        'failed': 'Thất bại',
        'refunded': 'Đã hoàn tiền'
    };
    return labels[status] || status;
}

function getPaymentStatusColor(status) {
    const colors = {
        'pending': 'warning',
        'paid': 'success',
        'failed': 'danger',
        'refunded': 'info'
    };
    return colors[status] || 'secondary';
}

function getPaymentMethodLabel(method) {
    const labels = {
        'cod': 'Thanh toán khi nhận hàng',
        'bank_transfer': 'Chuyển khoản',
        'vnpay': 'VNPay',
        'momo': 'MoMo',
        'zalopay': 'ZaloPay'
    };
    return labels[method] || method;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('vi-VN');
}

function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString('vi-VN');
}

function showLoading() {
    document.getElementById('orders-table').innerHTML = 
        '<tr><td colspan="8" class="text-center">Đang tải...</td></tr>';
}

function showError(message) {
    alert('Lỗi: ' + message);
}

function showSuccess(message) {
    alert('Thành công: ' + message);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Close modals when clicking outside
window.onclick = function(event) {
    const orderModal = document.getElementById('order-modal');
    const statusModal = document.getElementById('status-modal');
    
    if (event.target === orderModal) {
        closeOrderModal();
    }
    if (event.target === statusModal) {
        closeStatusModal();
    }
}