// Reports & Analytics Logic

// Get auth info (auth check is done in common.js)
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

// Global variables
let currentDateRange = {
    startDate: null,
    endDate: null,
    days: 7
};

let revenueChart = null;
let topProductsChart = null;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing reports page');
    
    // Wait a bit for Chart.js to load, then initialize
    setTimeout(function() {
        if (typeof Chart === 'undefined' || Chart === null) {
            console.error('Chart.js not loaded, using fallback');
            showNotification('Biểu đồ không khả dụng, hiển thị dữ liệu dạng bảng', 'info');
            
            // Hide chart containers
            document.querySelectorAll('canvas').forEach(canvas => {
                const parent = canvas.parentElement;
                parent.innerHTML = '<div style="padding: 40px; text-align: center; color: #666; background: #f8f9fa; border-radius: 8px;">📊 Biểu đồ không khả dụng</div>';
            });
        } else {
            console.log('Chart.js loaded successfully');
        }
        
        initializeDateRange();
        loadReportData();
    }, 1000); // Wait 1 second for Chart.js to load
});

// Initialize default date range (7 days)
function initializeDateRange() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);
    
    currentDateRange = {
        startDate: startDate,
        endDate: endDate,
        days: 7
    };
    
    // Set date inputs
    document.getElementById('startDate').value = formatDateInput(startDate);
    document.getElementById('endDate').value = formatDateInput(endDate);
}

// Update time range based on selection
function updateTimeRange() {
    const timeRange = document.getElementById('timeRange').value;
    const customDateRange = document.getElementById('customDateRange');
    
    if (timeRange === 'custom') {
        customDateRange.style.display = 'flex';
        return;
    } else {
        customDateRange.style.display = 'none';
    }
    
    const endDate = new Date();
    const startDate = new Date();
    const days = parseInt(timeRange);
    
    startDate.setDate(endDate.getDate() - days);
    
    currentDateRange = {
        startDate: startDate,
        endDate: endDate,
        days: days
    };
    
    loadReportData();
}

// Apply custom date range
function applyCustomRange() {
    const startDateInput = document.getElementById('startDate').value;
    const endDateInput = document.getElementById('endDate').value;
    
    if (!startDateInput || !endDateInput) {
        alert('Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc');
        return;
    }
    
    const startDate = new Date(startDateInput);
    const endDate = new Date(endDateInput);
    
    if (startDate > endDate) {
        alert('Ngày bắt đầu không thể lớn hơn ngày kết thúc');
        return;
    }
    
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    currentDateRange = {
        startDate: startDate,
        endDate: endDate,
        days: diffDays
    };
    
    loadReportData();
}

// Main function to load all report data
async function loadReportData() {
    showLoading(true);
    
    try {
        console.log('Loading report data...');
        
        // Load all data in parallel
        const [metricsData, dailyRevenueData, topProductsData] = await Promise.all([
            loadKeyMetrics(),
            loadDailyRevenue(),
            loadTopProducts()
        ]);
        
        console.log('Data loaded:', { metricsData, dailyRevenueData, topProductsData });
        
        // Update UI
        updateKeyMetrics(metricsData);
        updateRevenueChart(dailyRevenueData);
        updateTopProductsChart(topProductsData);
        updateDailyRevenueTable(dailyRevenueData);
        updateTopProductsTable(topProductsData);
        
        console.log('UI updated successfully');
        
    } catch (error) {
        console.error('Error loading report data:', error);
        showNotification('Có lỗi khi tải dữ liệu báo cáo: ' + error.message, 'error');
        
        // Load mock data as fallback
        const mockMetrics = generateMockMetrics();
        const mockDaily = generateMockDailyRevenue();
        const mockProducts = generateMockTopProducts();
        
        updateKeyMetrics(mockMetrics);
        updateRevenueChart(mockDaily);
        updateTopProductsChart(mockProducts);
        updateDailyRevenueTable(mockDaily);
        updateTopProductsTable(mockProducts);
        
    } finally {
        showLoading(false);
    }
}

// Load key metrics (revenue, orders, customers, avg order value)
async function loadKeyMetrics() {
    try {
        console.log('Loading metrics with token:', token ? 'Present' : 'Missing');
        console.log('User role:', user.role);
        console.log('Date range:', currentDateRange);
        
        // Try API first
        try {
            const response = await fetch('/api/reports/metrics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    startDate: currentDateRange.startDate.toISOString(),
                    endDate: currentDateRange.endDate.toISOString()
                })
            });
            
            console.log('Metrics API response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Received metrics data:', data);
                return data.data;
            } else {
                const errorText = await response.text();
                console.error('Metrics API Error:', response.status, errorText);
                throw new Error(`API Error: ${response.status}`);
            }
        } catch (fetchError) {
            console.warn('Fetch error for metrics:', fetchError);
            throw fetchError;
        }
        
    } catch (error) {
        console.warn('Error loading metrics, using mock data:', error);
        return generateMockMetrics();
    }
}

// Load daily revenue data
async function loadDailyRevenue() {
    try {
        const response = await fetch('/api/reports/daily-revenue', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                startDate: currentDateRange.startDate.toISOString(),
                endDate: currentDateRange.endDate.toISOString()
            })
        });
        
        if (!response.ok) {
            console.error('Daily revenue API error:', response.status);
            throw new Error('Failed to load daily revenue');
        }
        
        const data = await response.json();
        return data.data;
        
    } catch (error) {
        console.warn('Using mock daily revenue data:', error);
        return generateMockDailyRevenue();
    }
}

// Load top products data
async function loadTopProducts() {
    try {
        const response = await fetch('/api/reports/top-products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                startDate: currentDateRange.startDate.toISOString(),
                endDate: currentDateRange.endDate.toISOString()
            })
        });
        
        if (!response.ok) {
            console.error('Top products API error:', response.status);
            throw new Error('Failed to load top products');
        }
        
        const data = await response.json();
        return data.data;
        
    } catch (error) {
        console.warn('Using mock top products data:', error);
        return generateMockTopProducts();
    }
}

// Update key metrics display
function updateKeyMetrics(data) {
    document.getElementById('totalRevenue').textContent = formatCurrency(data.totalRevenue);
    document.getElementById('totalOrders').textContent = data.totalOrders.toLocaleString();
    document.getElementById('newCustomers').textContent = data.newCustomers.toLocaleString();
    document.getElementById('avgOrderValue').textContent = formatCurrency(data.avgOrderValue);
    
    // Update change percentages
    updateChangeIndicator('revenueChange', data.revenueChange);
    updateChangeIndicator('ordersChange', data.ordersChange);
    updateChangeIndicator('customersChange', data.customersChange);
    updateChangeIndicator('avgChange', data.avgChange);
}

// Update change indicator
function updateChangeIndicator(elementId, change) {
    const element = document.getElementById(elementId);
    const isPositive = change >= 0;
    
    element.textContent = `${isPositive ? '+' : ''}${change.toFixed(1)}%`;
    element.className = `metric-change ${isPositive ? 'positive' : 'negative'}`;
}

// Update revenue chart
function updateRevenueChart(data) {
    const canvas = document.getElementById('revenueChart');
    if (!canvas) {
        console.error('Revenue chart canvas not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    if (revenueChart) {
        revenueChart.destroy();
    }
    
    // Check if Chart.js is available
    if (typeof Chart === 'undefined' || Chart === null) {
        console.warn('Chart.js not available, skipping revenue chart');
        canvas.parentElement.innerHTML = '<div style="padding: 40px; text-align: center; color: #666; background: #f8f9fa; border-radius: 8px;">📈 Biểu đồ doanh thu không khả dụng</div>';
        return;
    }
    
    try {
        revenueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(item => formatDate(item.date)),
                datasets: [{
                    label: 'Doanh thu',
                    data: data.map(item => item.revenue),
                    borderColor: '#3498DB',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Doanh thu: ' + formatCurrency(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
        console.log('Revenue chart created successfully');
    } catch (error) {
        console.error('Error creating revenue chart:', error);
    }
}

// Update top products chart
function updateTopProductsChart(data) {
    const canvas = document.getElementById('topProductsChart');
    if (!canvas) {
        console.error('Top products chart canvas not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    if (topProductsChart) {
        topProductsChart.destroy();
    }
    
    const top5 = data.slice(0, 5);
    
    // Check if Chart.js is available
    if (typeof Chart === 'undefined' || Chart === null) {
        console.warn('Chart.js not available, skipping top products chart');
        canvas.parentElement.innerHTML = '<div style="padding: 40px; text-align: center; color: #666; background: #f8f9fa; border-radius: 8px;">🏆 Biểu đồ sản phẩm không khả dụng</div>';
        return;
    }
    
    try {
        topProductsChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: top5.map(item => item.productName),
                datasets: [{
                    data: top5.map(item => item.revenue),
                    backgroundColor: [
                        '#3498DB',
                        '#27AE60',
                        '#F39C12',
                        '#E74C3C',
                        '#9B59B6'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + formatCurrency(context.parsed);
                            }
                        }
                    }
                }
            }
        });
        console.log('Top products chart created successfully');
    } catch (error) {
        console.error('Error creating top products chart:', error);
    }
}

// Update daily revenue table
function updateDailyRevenueTable(data) {
    const tbody = document.getElementById('dailyRevenueBody');
    
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Không có dữ liệu</td></tr>';
        return;
    }
    
    tbody.innerHTML = data.map((item, index) => {
        const prevRevenue = index > 0 ? data[index - 1].revenue : item.revenue;
        const growth = prevRevenue > 0 ? ((item.revenue - prevRevenue) / prevRevenue * 100) : 0;
        
        return `
            <tr>
                <td>${formatDate(item.date)}</td>
                <td>${item.orders.toLocaleString()}</td>
                <td>${formatCurrency(item.revenue)}</td>
                <td>${item.newCustomers.toLocaleString()}</td>
                <td class="${growth >= 0 ? 'positive' : 'negative'}">
                    ${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%
                </td>
            </tr>
        `;
    }).join('');
}

// Update top products table
function updateTopProductsTable(data) {
    const tbody = document.getElementById('topProductsBody');
    
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Không có dữ liệu</td></tr>';
        return;
    }
    
    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    
    tbody.innerHTML = data.map((item, index) => {
        const percentage = totalRevenue > 0 ? (item.revenue / totalRevenue * 100) : 0;
        
        return `
            <tr>
                <td>${index + 1}</td>
                <td>${item.productName}</td>
                <td>${item.quantity.toLocaleString()}</td>
                <td>${formatCurrency(item.revenue)}</td>
                <td>${percentage.toFixed(1)}%</td>
            </tr>
        `;
    }).join('');
}

// Toggle chart type
function toggleChartType(type) {
    if (revenueChart && typeof Chart !== 'undefined') {
        try {
            revenueChart.config.type = type;
            revenueChart.update();
            console.log('Chart type changed to:', type);
        } catch (error) {
            console.error('Error changing chart type:', error);
        }
    } else {
        console.warn('Chart not available for type change');
    }
}

// Export functions
function exportReport() {
    // Implementation for full report export
    showNotification('Chức năng xuất báo cáo đang được phát triển', 'info');
}

function exportDailyRevenue() {
    // Implementation for daily revenue export
    showNotification('Chức năng xuất Excel đang được phát triển', 'info');
}

function exportTopProducts() {
    // Implementation for top products export
    showNotification('Chức năng xuất Excel đang được phát triển', 'info');
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
    }).format(amount);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

function formatDateInput(date) {
    return date.toISOString().split('T')[0];
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = show ? 'flex' : 'none';
}

function showNotification(message, type = 'info') {
    console.log(`${type.toUpperCase()}: ${message}`);
    
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'error' ? '#E74C3C' : type === 'success' ? '#27AE60' : '#3498DB'};
        color: white;
        border-radius: 8px;
        z-index: 10000;
        font-size: 14px;
        max-width: 300px;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 5000);
}

// Mock data generators (for when API is not available)
function generateMockMetrics() {
    return {
        totalRevenue: Math.floor(Math.random() * 50000000) + 10000000,
        totalOrders: Math.floor(Math.random() * 500) + 100,
        newCustomers: Math.floor(Math.random() * 50) + 10,
        avgOrderValue: Math.floor(Math.random() * 500000) + 200000,
        revenueChange: (Math.random() - 0.5) * 40,
        ordersChange: (Math.random() - 0.5) * 30,
        customersChange: (Math.random() - 0.5) * 50,
        avgChange: (Math.random() - 0.5) * 20
    };
}

function generateMockDailyRevenue() {
    const data = [];
    const startDate = new Date(currentDateRange.startDate);
    
    for (let i = 0; i < currentDateRange.days; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        data.push({
            date: date.toISOString(),
            revenue: Math.floor(Math.random() * 2000000) + 500000,
            orders: Math.floor(Math.random() * 20) + 5,
            newCustomers: Math.floor(Math.random() * 5) + 1
        });
    }
    
    return data;
}

function generateMockTopProducts() {
    const products = [
        'Paracetamol 500mg',
        'Vitamin C 1000mg',
        'Amoxicillin 250mg',
        'Ibuprofen 400mg',
        'Omeprazole 20mg',
        'Cetirizine 10mg',
        'Metformin 500mg',
        'Aspirin 100mg',
        'Loratadine 10mg',
        'Simvastatin 20mg'
    ];
    
    return products.map((name, index) => ({
        productName: name,
        quantity: Math.floor(Math.random() * 100) + 50 - (index * 5),
        revenue: Math.floor(Math.random() * 5000000) + 1000000 - (index * 200000)
    })).sort((a, b) => b.quantity - a.quantity);
}

// Logout function is defined in common.js