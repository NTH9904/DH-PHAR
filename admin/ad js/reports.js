// Check authentication
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token || user.role !== 'admin') {
    alert('Bạn cần đăng nhập với tài khoản admin');
    window.location.href = '/pages/login.html';
}

let revenueChart, topProductsChart, categoriesChart;

// Check if Chart.js is loaded
if (typeof Chart === 'undefined') {
    console.warn('Chart.js not loaded, charts will not be displayed');
}

// Load reports
async function loadReports() {
    const period = parseInt(document.getElementById('report-period').value);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);
    
    try {
        const [ordersRes, productsRes] = await Promise.all([
            fetch('/api/orders/admin/all?limit=1000', {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch('/api/products?limit=1000', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);
        
        const ordersData = await ordersRes.json();
        const productsData = await productsRes.json();
        
        const orders = (ordersData.data || []).filter(o => 
            new Date(o.createdAt) >= startDate && o.status !== 'cancelled'
        );
        const products = productsData.data || [];
        
        calculateStats(orders);
        renderRevenueChart(orders, period);
        renderTopProductsChart(orders, products);
        renderCategoriesChart(orders, products);
        renderTopProductsTable(orders, products);
    } catch (error) {
        console.error('Error loading reports:', error);
    }
}

function calculateStats(orders) {
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    document.getElementById('total-revenue').textContent = formatCurrency(totalRevenue);
    document.getElementById('total-orders').textContent = totalOrders;
    document.getElementById('avg-order-value').textContent = formatCurrency(avgOrderValue);
    
    // Calculate changes (mock data for now)
    document.getElementById('revenue-change').textContent = '+12%';
    document.getElementById('orders-change').textContent = '+8%';
    document.getElementById('aov-change').textContent = '+5%';
    document.getElementById('customers-change').textContent = '+15%';
}

function renderRevenueChart(orders, period) {
    if (typeof Chart === 'undefined') {
        document.getElementById('revenue-chart').parentElement.innerHTML = 
            '<p style="text-align: center; padding: 40px; color: #7F8C8D;">Biểu đồ không khả dụng. Vui lòng tắt Tracking Prevention hoặc cho phép cdn.jsdelivr.net</p>';
        return;
    }
    
    const ctx = document.getElementById('revenue-chart').getContext('2d');
    
    // Group orders by date
    const revenueByDate = {};
    orders.forEach(order => {
        const date = new Date(order.createdAt).toLocaleDateString('vi-VN');
        revenueByDate[date] = (revenueByDate[date] || 0) + order.total;
    });
    
    const labels = Object.keys(revenueByDate).sort();
    const data = labels.map(date => revenueByDate[date]);
    
    if (revenueChart) revenueChart.destroy();
    
    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Doanh thu (VNĐ)',
                data: data,
                borderColor: '#3498DB',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
                        }
                    }
                }
            }
        }
    });
}

function renderTopProductsChart(orders, products) {
    if (typeof Chart === 'undefined') {
        document.getElementById('top-products-chart').parentElement.innerHTML = 
            '<p style="text-align: center; padding: 40px; color: #7F8C8D;">Biểu đồ không khả dụng</p>';
        return;
    }
    
    const ctx = document.getElementById('top-products-chart').getContext('2d');
    
    // Calculate sales by product
    const salesByProduct = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            const productId = item.product._id || item.product;
            salesByProduct[productId] = (salesByProduct[productId] || 0) + item.quantity;
        });
    });
    
    // Get top 5 products
    const topProducts = Object.entries(salesByProduct)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    const labels = topProducts.map(([id]) => {
        const product = products.find(p => p._id === id);
        return product ? product.name.substring(0, 20) : 'Unknown';
    });
    const data = topProducts.map(([, qty]) => qty);
    
    if (topProductsChart) topProductsChart.destroy();
    
    topProductsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Số lượng bán',
                data: data,
                backgroundColor: [
                    '#3498DB',
                    '#2ECC71',
                    '#F39C12',
                    '#E74C3C',
                    '#9B59B6'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function renderCategoriesChart(orders, products) {
    if (typeof Chart === 'undefined') {
        document.getElementById('categories-chart').parentElement.innerHTML = 
            '<p style="text-align: center; padding: 40px; color: #7F8C8D;">Biểu đồ không khả dụng</p>';
        return;
    }
    
    const ctx = document.getElementById('categories-chart').getContext('2d');
    
    // Calculate sales by category
    const salesByCategory = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            const productId = item.product._id || item.product;
            const product = products.find(p => p._id === productId);
            if (product) {
                const category = product.category;
                salesByCategory[category] = (salesByCategory[category] || 0) + item.subtotal;
            }
        });
    });
    
    const labels = Object.keys(salesByCategory);
    const data = Object.values(salesByCategory);
    
    if (categoriesChart) categoriesChart.destroy();
    
    categoriesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#3498DB',
                    '#2ECC71',
                    '#F39C12',
                    '#E74C3C',
                    '#9B59B6',
                    '#1ABC9C',
                    '#34495E'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

function renderTopProductsTable(orders, products) {
    // Calculate sales by product
    const salesData = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            const productId = item.product._id || item.product;
            if (!salesData[productId]) {
                salesData[productId] = { quantity: 0, revenue: 0 };
            }
            salesData[productId].quantity += item.quantity;
            salesData[productId].revenue += item.subtotal;
        });
    });
    
    // Get top 10 products
    const topProducts = Object.entries(salesData)
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 10)
        .map(([id, data]) => {
            const product = products.find(p => p._id === id);
            return { product, ...data };
        })
        .filter(item => item.product);
    
    const tbody = document.getElementById('top-products-table');
    if (topProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Chưa có dữ liệu</td></tr>';
        return;
    }
    
    tbody.innerHTML = topProducts.map(item => `
        <tr>
            <td><strong>${item.product.name}</strong></td>
            <td>${item.product.category}</td>
            <td><strong>${item.quantity}</strong></td>
            <td><strong>${formatCurrency(item.revenue)}</strong></td>
            <td>${item.product.stock}</td>
        </tr>
    `).join('');
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function exportReport() {
    alert('Chức năng xuất báo cáo đang được phát triển');
}

// Event listeners
document.getElementById('report-period').addEventListener('change', loadReports);

// Initialize
loadReports();
