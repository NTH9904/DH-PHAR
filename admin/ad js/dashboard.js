// Admin Dashboard scripts
async function loadDashboard() {
  try {
    // Load stats (mock data for now)
    const totalOrdersEl = document.getElementById('total-orders');
    const todayRevenueEl = document.getElementById('today-revenue');
    const totalProductsEl = document.getElementById('total-products');
    const totalUsersEl = document.getElementById('total-users');

    if (totalOrdersEl) totalOrdersEl.textContent = '1,234';
    if (todayRevenueEl) todayRevenueEl.textContent = '50,000,000 đ';
    if (totalProductsEl) totalProductsEl.textContent = '60';
    if (totalUsersEl) totalUsersEl.textContent = '567';

    // Load recent orders from API if available
    if (window.API && window.API.orders && document.getElementById('recent-orders')) {
      try {
        const ordersResponse = await window.API.orders.getAll();
        const orders = ordersResponse.data || [];
        const recentOrders = orders.slice(0, 5);
        const container = document.getElementById('recent-orders');
        if (recentOrders.length > 0) {
          container.innerHTML = recentOrders.map(order => `\n            <div style="padding: 12px 0; border-bottom: 1px solid var(--border-color);">\n                <div style="display: flex; justify-content: space-between;">\n                    <div>\n                        <strong>#${order.orderNumber}</strong>\n                        <div style="font-size: 14px; color: var(--text-light);">${new Date(order.createdAt).toLocaleDateString('vi-VN')}</div>\n                    </div>\n                    <div style="text-align: right;">\n                        <div>${window.utils?.formatCurrency(order.total) || order.total.toLocaleString('vi-VN') + ' đ'}</div>\n                        <span class="badge badge-primary">${order.status}</span>\n                    </div>\n                </div>\n            </div>\n          `).join('');
        } else {
          container.innerHTML = '<p>Chưa có đơn hàng</p>';
        }
      } catch (e) {
        console.error('Error loading recent orders (dashboard):', e);
      }
    }
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}

// Initialize when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadDashboard);
} else {
  loadDashboard();
}
