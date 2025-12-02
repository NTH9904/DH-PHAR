// Products management
let currentPage = 1;
let totalPages = 1;
let currentFilters = {};
let editingProductId = null;

// Check authentication
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token || user.role !== 'admin') {
    alert('Bạn cần đăng nhập với tài khoản admin');
    window.location.href = '/pages/login.html';
}

// Load products on page load
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupEventListeners();
});

function setupEventListeners() {
    // Search input
    document.getElementById('search-input').addEventListener('input', debounce(function() {
        currentFilters.search = this.value;
        currentPage = 1;
        loadProducts();
    }, 500));

    // Filter selects
    ['category-filter', 'type-filter', 'stock-filter'].forEach(id => {
        document.getElementById(id).addEventListener('change', function() {
            const filterName = id.replace('-filter', '');
            currentFilters[filterName] = this.value;
            currentPage = 1;
            loadProducts();
        });
    });

    // Product form
    document.getElementById('product-form').addEventListener('submit', handleProductSubmit);
}

async function loadProducts() {
    try {
        showLoading();
        
        const params = new URLSearchParams({
            page: currentPage,
            limit: 20,
            ...currentFilters
        });

        // Handle stock filter
        if (currentFilters.stock === 'in-stock') {
            params.set('minStock', '1');
        } else if (currentFilters.stock === 'low-stock') {
            params.set('maxStock', '19');
            params.set('minStock', '1');
        } else if (currentFilters.stock === 'out-of-stock') {
            params.set('maxStock', '0');
        }

        const response = await fetch(`/api/products?${params}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Không thể tải danh sách sản phẩm');
        }

        const data = await response.json();
        displayProducts(data.data || []);
        updatePagination(data);
        
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Không thể tải danh sách sản phẩm');
    }
}

function displayProducts(products) {
    const tbody = document.getElementById('products-table');
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">Không có sản phẩm nào</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(product => `
        <tr>
            <td>
                <img src="${product.images && product.images[0] ? product.images[0].url : '/images/no-image.png'}" 
                     alt="${product.name}" class="product-image">
            </td>
            <td>
                <div class="product-info">
                    <strong>${product.name}</strong>
                    <br><small>${product.genericName}</small>
                </div>
            </td>
            <td>${getCategoryLabel(product.category)}</td>
            <td><span class="badge badge-${getTypeBadgeClass(product.type)}">${getTypeLabel(product.type)}</span></td>
            <td><strong>${formatCurrency(product.price)}</strong></td>
            <td>
                <span class="stock-badge ${getStockClass(product.stock)}">
                    ${product.stock}
                </span>
            </td>
            <td>
                <span class="badge badge-${product.isActive ? 'success' : 'danger'}">
                    ${product.isActive ? 'Hoạt động' : 'Tạm dừng'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-edit" onclick="editProduct('${product._id}')" title="Chỉnh sửa">
                        ✏️
                    </button>
                    <button class="btn-icon btn-toggle" onclick="toggleProductStatus('${product._id}', ${product.isActive})" 
                            title="${product.isActive ? 'Tạm dừng' : 'Kích hoạt'}">
                        ${product.isActive ? '⏸️' : '▶️'}
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteProduct('${product._id}')" title="Xóa">
                        🗑️
                    </button>
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
    document.getElementById('total-products').textContent = data.total || 0;
    
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
    loadProducts();
}

// Product Modal Functions
function openProductModal(productId = null) {
    editingProductId = productId;
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('product-form');
    
    if (productId) {
        title.textContent = 'Chỉnh sửa sản phẩm';
        loadProductForEdit(productId);
    } else {
        title.textContent = 'Thêm sản phẩm mới';
        form.reset();
    }
    
    modal.style.display = 'block';
}

function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
    editingProductId = null;
}

async function loadProductForEdit(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Không thể tải thông tin sản phẩm');
        }
        
        const data = await response.json();
        const product = data.data;
        
        // Fill form with product data
        document.getElementById('product-name').value = product.name || '';
        document.getElementById('product-generic-name').value = product.genericName || '';
        document.getElementById('product-category').value = product.category || '';
        document.getElementById('product-type').value = product.type || '';
        document.getElementById('product-price').value = product.price || '';
        document.getElementById('product-stock').value = product.stock || '';
        document.getElementById('product-brand').value = product.brand || '';
        document.getElementById('product-manufacturer').value = product.manufacturer || '';
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-indications').value = product.indications ? product.indications.join('\n') : '';
        document.getElementById('product-dosage').value = product.dosage || '';
        document.getElementById('product-package-size').value = product.specifications?.packageSize || '';
        document.getElementById('product-unit').value = product.specifications?.unit || '';
        document.getElementById('product-featured').checked = product.isFeatured || false;
        
        // Load image if exists
        const imageUrl = product.images?.[0]?.url || '';
        if (imageUrl) {
            document.getElementById('product-image-url').value = imageUrl;
            if (typeof showImagePreview === 'function') {
                showImagePreview(imageUrl);
            }
        }
        
    } catch (error) {
        console.error('Error loading product:', error);
        showError('Không thể tải thông tin sản phẩm');
    }
}

async function handleProductSubmit(e) {
    e.preventDefault();
    
    try {
        const formData = new FormData(e.target);
        const productData = {
            name: formData.get('name'),
            genericName: formData.get('genericName'),
            category: formData.get('category'),
            type: formData.get('type'),
            price: Number(formData.get('price')),
            stock: Number(formData.get('stock')),
            brand: formData.get('brand'),
            manufacturer: formData.get('manufacturer'),
            description: formData.get('description'),
            indications: formData.get('indications') ? formData.get('indications').split('\n').filter(i => i.trim()) : [],
            dosage: formData.get('dosage'),
            specifications: {
                packageSize: formData.get('packageSize'),
                unit: formData.get('unit')
            },
            isFeatured: formData.get('isFeatured') === 'on'
        };
        
        // Add image if exists
        const imageUrl = document.getElementById('product-image-url').value.trim();
        if (imageUrl) {
            productData.images = [{ url: imageUrl, isPrimary: true }];
        }
        
        const url = editingProductId ? `/api/products/${editingProductId}` : '/api/products';
        const method = editingProductId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Có lỗi xảy ra');
        }
        
        showSuccess(editingProductId ? 'Cập nhật sản phẩm thành công' : 'Thêm sản phẩm thành công');
        closeProductModal();
        loadProducts();
        
    } catch (error) {
        console.error('Error saving product:', error);
        showError(error.message);
    }
}

function editProduct(productId) {
    openProductModal(productId);
}

async function toggleProductStatus(productId, currentStatus) {
    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ isActive: !currentStatus })
        });
        
        if (!response.ok) {
            throw new Error('Không thể cập nhật trạng thái sản phẩm');
        }
        
        showSuccess('Cập nhật trạng thái thành công');
        loadProducts();
        
    } catch (error) {
        console.error('Error toggling product status:', error);
        showError(error.message);
    }
}

async function deleteProduct(productId) {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Không thể xóa sản phẩm');
        }
        
        showSuccess('Xóa sản phẩm thành công');
        loadProducts();
        
    } catch (error) {
        console.error('Error deleting product:', error);
        showError(error.message);
    }
}

// Utility functions
function getCategoryLabel(category) {
    const labels = {
        'thuoc-khang-sinh': 'Thuốc kháng sinh',
        'thuoc-giam-dau': 'Thuốc giảm đau',
        'vitamin': 'Vitamin & TPCN',
        'thuoc-tieu-hoa': 'Thuốc tiêu hóa',
        'thuoc-cam-cum': 'Thuốc cảm cúm'
    };
    return labels[category] || category;
}

function getTypeLabel(type) {
    const labels = {
        'prescription': 'Kê đơn',
        'otc': 'Không kê đơn',
        'supplement': 'TPCN'
    };
    return labels[type] || type;
}

function getTypeBadgeClass(type) {
    const classes = {
        'prescription': 'danger',
        'otc': 'success',
        'supplement': 'info'
    };
    return classes[type] || 'secondary';
}

function getStockClass(stock) {
    if (stock === 0) return 'stock-out';
    if (stock < 20) return 'stock-low';
    return 'stock-good';
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
    }).format(amount);
}

function showLoading() {
    document.getElementById('products-table').innerHTML = 
        '<tr><td colspan="8" class="text-center">Đang tải...</td></tr>';
}

function showError(message) {
    // You can implement a toast notification here
    alert('Lỗi: ' + message);
}

function showSuccess(message) {
    // You can implement a toast notification here
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

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('product-modal');
    if (event.target === modal) {
        closeProductModal();
    }
}