// Check authentication
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token || user.role !== 'admin') {
    alert('Bạn cần đăng nhập với tài khoản admin');
    window.location.href = '/pages/login.html';
}

let products = [];
let categories = [];

// Load data
async function loadInventory() {
    try {
        const response = await fetch('/api/products?limit=1000', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        products = data.data || [];
        
        updateStats();
        loadCategories();
        renderInventory();
    } catch (error) {
        console.warn('Inventory: Database not connected, using mock data');
        // Use mock data when API is not available
        products = [
            {
                _id: '1',
                name: 'Paracetamol 500mg',
                genericName: 'Paracetamol',
                category: 'Thuốc giảm đau',
                stock: 150,
                price: 25000,
                images: [{ url: '/images/no-image.svg' }],
                specifications: { expiryDate: '2025-12-31' }
            },
            {
                _id: '2',
                name: 'Vitamin C 1000mg',
                genericName: 'Ascorbic Acid',
                category: 'Vitamin',
                stock: 5,
                price: 35000,
                images: [{ url: '/images/no-image.svg' }],
                specifications: { expiryDate: '2025-06-30' }
            },
            {
                _id: '3',
                name: 'Amoxicillin 500mg',
                genericName: 'Amoxicillin',
                category: 'Kháng sinh',
                stock: 0,
                price: 45000,
                images: [{ url: '/images/no-image.svg' }],
                specifications: { expiryDate: '2025-03-15' }
            }
        ];
        
        updateStats();
        loadCategories();
        renderInventory();
        
        // Show info message instead of error
        setTimeout(() => {
            showNotification('Đang sử dụng dữ liệu mẫu (Database chưa kết nối)', 'info');
        }, 1000);
    }
}

function updateStats() {
    const lowStockThreshold = 20;
    const expiryThreshold = 90; // days
    
    document.getElementById('total-products').textContent = products.length;
    document.getElementById('low-stock').textContent = 
        products.filter(p => p.stock > 0 && p.stock <= lowStockThreshold).length;
    document.getElementById('out-of-stock').textContent = 
        products.filter(p => p.stock === 0).length;
    
    const expiringSoon = products.filter(p => {
        if (!p.specifications?.expiryDate) return false;
        const daysUntilExpiry = Math.floor(
            (new Date(p.specifications.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
        );
        return daysUntilExpiry > 0 && daysUntilExpiry <= expiryThreshold;
    }).length;
    document.getElementById('expiring-soon').textContent = expiringSoon;
}

function loadCategories() {
    categories = [...new Set(products.map(p => p.category))];
    const select = document.getElementById('category-filter');
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
}

function renderInventory() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const stockFilter = document.getElementById('stock-filter').value;
    const categoryFilter = document.getElementById('category-filter').value;
    
    let filtered = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(searchTerm) ||
                          p.genericName?.toLowerCase().includes(searchTerm);
        const matchCategory = !categoryFilter || p.category === categoryFilter;
        
        let matchStock = true;
        if (stockFilter === 'in-stock') matchStock = p.stock > 20;
        else if (stockFilter === 'low-stock') matchStock = p.stock > 0 && p.stock <= 20;
        else if (stockFilter === 'out-of-stock') matchStock = p.stock === 0;
        
        return matchSearch && matchCategory && matchStock;
    });
    
    const tbody = document.getElementById('inventory-table');
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Không có sản phẩm</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(product => `
        <tr>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${product.images?.[0]?.url || '/images/placeholder.png'}" 
                         style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">
                    <div>
                        <strong>${product.name}</strong><br>
                        <small>${product.genericName || ''}</small>
                    </div>
                </div>
            </td>
            <td>${product.category}</td>
            <td>
                <strong style="color: ${getStockColor(product.stock)}">${product.stock}</strong>
                ${product.specifications?.unit || 'sản phẩm'}
            </td>
            <td>${formatCurrency(product.price)}</td>
            <td>${formatExpiryDate(product.specifications?.expiryDate)}</td>
            <td>${getStockBadge(product.stock)}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="adjustStock('${product._id}')">
                    Điều chỉnh
                </button>
            </td>
        </tr>
    `).join('');
}

function getStockColor(stock) {
    if (stock === 0) return '#E74C3C';
    if (stock <= 20) return '#F39C12';
    return '#27AE60';
}

function getStockBadge(stock) {
    if (stock === 0) return '<span class="badge badge-danger">Hết hàng</span>';
    if (stock <= 20) return '<span class="badge badge-warning">Sắp hết</span>';
    return '<span class="badge badge-success">Còn hàng</span>';
}

function formatExpiryDate(date) {
    if (!date) return '<span style="color: #95A5A6;">Chưa có</span>';
    const expiry = new Date(date);
    const daysUntil = Math.floor((expiry - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return '<span style="color: #E74C3C;">Đã hết hạn</span>';
    if (daysUntil <= 90) return `<span style="color: #F39C12;">${expiry.toLocaleDateString('vi-VN')}</span>`;
    return expiry.toLocaleDateString('vi-VN');
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Import stock modal
function showImportModal() {
    const modal = document.getElementById('import-modal');
    const select = document.getElementById('import-product');
    
    select.innerHTML = '<option value="">Chọn sản phẩm</option>' +
        products.map(p => `<option value="${p._id}">${p.name}</option>`).join('');
    
    modal.style.display = 'block';
}

function closeImportModal() {
    document.getElementById('import-modal').style.display = 'none';
    document.getElementById('import-form').reset();
}

document.getElementById('import-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const productId = document.getElementById('import-product').value;
    const quantity = parseInt(document.getElementById('import-quantity').value);
    const expiryDate = document.getElementById('import-expiry').value;
    
    try {
        const product = products.find(p => p._id === productId);
        const newStock = product.stock + quantity;
        
        const response = await fetch(`/api/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                stock: newStock,
                specifications: {
                    ...product.specifications,
                    expiryDate: expiryDate
                }
            })
        });
        
        if (response.ok) {
            showNotification('Nhập hàng thành công', 'success');
            closeImportModal();
            loadInventory();
        } else {
            throw new Error('Failed to import stock');
        }
    } catch (error) {
        console.error('Error importing stock:', error);
        showNotification('Không thể nhập hàng', 'error');
    }
});

async function adjustStock(productId) {
    const product = products.find(p => p._id === productId);
    const newStock = prompt(`Nhập số lượng tồn kho mới cho ${product.name}:`, product.stock);
    
    if (newStock === null) return;
    
    const stock = parseInt(newStock);
    if (isNaN(stock) || stock < 0) {
        alert('Số lượng không hợp lệ');
        return;
    }
    
    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ stock })
        });
        
        if (response.ok) {
            showNotification('Cập nhật tồn kho thành công', 'success');
            loadInventory();
        } else {
            throw new Error('Failed to update stock');
        }
    } catch (error) {
        console.error('Error updating stock:', error);
        showNotification('Không thể cập nhật tồn kho', 'error');
    }
}

function showNotification(message, type = 'info') {
    // Create a better notification system
    const notification = document.createElement('div');
    const colors = {
        success: '#27AE60',
        error: '#E74C3C',
        warning: '#F39C12',
        info: '#3498DB'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-weight: 500;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Event listeners
document.getElementById('search-input').addEventListener('input', renderInventory);
document.getElementById('stock-filter').addEventListener('change', renderInventory);
document.getElementById('category-filter').addEventListener('change', renderInventory);

// Initialize
loadInventory();
