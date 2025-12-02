let currentPage = 1;
let currentProductId = null;

// Load products
async function loadProducts(page = 1) {
    try {
        const search = document.getElementById('search-input').value;
        const category = document.getElementById('filter-category').value;
        const type = document.getElementById('filter-type').value;

        const params = { page, limit: 20 };
        if (search) params.search = search;
        if (category) params.category = category;
        if (type) params.type = type;

        const response = await window.API.products.getAll(params);
        const products = response.data || [];

        renderProducts(products);
        renderPagination(response.page, response.pages);
        currentPage = page;
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Không thể tải danh sách sản phẩm');
    }
}

// Render products table
function renderProducts(products) {
    const tbody = document.getElementById('products-tbody');
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">Không có sản phẩm nào</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(product => {
        const stockClass = product.stock > 50 ? 'stock-high' : product.stock > 20 ? 'stock-medium' : 'stock-low';
        return `
        <tr>
            <td>
                <img src="${product.images?.[0]?.url || '/images/no-image.svg'}" 
                     alt="${product.name}" 
                     class="product-image-cell">
            </td>
            <td>
                <div class="table-text-compact">
                    <strong>${product.name}</strong>
                    <span class="table-text-small">${product.genericName || ''}</span>
                </div>
            </td>
            <td>${product.category}</td>
            <td><span class="badge badge-${product.type}">${getTypeLabel(product.type)}</span></td>
            <td><span class="price-value">${formatCurrency(product.price)}</span></td>
            <td><span class="${stockClass}">${product.stock}</span></td>
            <td><span class="badge badge-${product.isActive ? 'success' : 'danger'}">${product.isActive ? 'Hoạt động' : 'Tạm ngưng'}</span></td>
            <td>
                <div class="table-actions">
                    <button class="btn-table-action btn-edit" data-id="${product._id}" title="Sửa">✏️</button>
                    <button class="btn-table-action btn-view" data-id="${product._id}" title="Xem">👁️</button>
                    <button class="btn-table-action btn-delete" data-id="${product._id}" title="Xóa">🗑️</button>
                </div>
            </td>
        </tr>
    `;
    }).join('');
    
    // Add event listeners for action buttons
    tbody.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => editProduct(btn.dataset.id));
    });
    tbody.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', () => viewProduct(btn.dataset.id));
    });
    tbody.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => deleteProduct(btn.dataset.id));
    });
}

// Open add modal
function openAddModal() {
    document.getElementById('modal-title').textContent = 'Thêm sản phẩm mới';
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    currentProductId = null;
    uploadedImageUrl = null;
    hideImagePreview();
    document.getElementById('product-modal').style.display = 'flex';
}

// View product details
async function viewProduct(id) {
    try {
        const response = await window.API.products.getById(id);
        const product = response.data;
        
        const details = `
            <div style="display: grid; grid-template-columns: 150px 1fr; gap: 20px;">
                <div>
                    <img src="${product.images?.[0]?.url || '/images/no-image.svg'}" 
                         style="width: 100%; border-radius: 8px; border: 2px solid #E1E8ED;">
                </div>
                <div>
                    <h3 style="margin-bottom: 12px; color: #2C3E50; font-size: 18px;">${product.name}</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; font-size: 14px;">
                        <p><strong>Hoạt chất:</strong> ${product.genericName || 'N/A'}</p>
                        <p><strong>Danh mục:</strong> ${product.category}</p>
                        <p><strong>Loại:</strong> ${getTypeLabel(product.type)}</p>
                        <p><strong>Giá:</strong> <span style="color: #3498DB; font-weight: 700;">${formatCurrency(product.price)}</span></p>
                        <p><strong>Tồn kho:</strong> ${product.stock}</p>
                        <p><strong>Thương hiệu:</strong> ${product.brand || 'N/A'}</p>
                        <p><strong>Nhà sản xuất:</strong> ${product.manufacturer || 'N/A'}</p>
                        <p><strong>Đơn vị:</strong> ${product.specifications?.unit || 'N/A'}</p>
                    </div>
                    ${product.description ? `<p style="margin-top: 12px; font-size: 14px;"><strong>Mô tả:</strong> ${product.description}</p>` : ''}
                    ${product.dosage ? `<p style="margin-top: 8px; font-size: 14px;"><strong>Liều dùng:</strong> ${product.dosage}</p>` : ''}
                </div>
            </div>
        `;
        
        // Create a simple modal for viewing
        const viewModal = document.createElement('div');
        viewModal.className = 'modal';
        viewModal.style.display = 'flex';
        viewModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Chi tiết sản phẩm</h2>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div class="modal-body">
                    ${details}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Đóng</button>
                    <button class="btn btn-primary" onclick="this.closest('.modal').remove(); editProduct('${id}')">Chỉnh sửa</button>
                </div>
            </div>
        `;
        document.body.appendChild(viewModal);
        
        // Close on outside click
        viewModal.addEventListener('click', (e) => {
            if (e.target === viewModal) {
                viewModal.remove();
            }
        });
    } catch (error) {
        console.error('Error viewing product:', error);
        showError('Không thể xem chi tiết sản phẩm');
    }
}

// Edit product
async function editProduct(id) {
    try {
        const response = await window.API.products.getById(id);
        const product = response.data;

        document.getElementById('modal-title').textContent = 'Sửa sản phẩm';
        document.getElementById('product-id').value = product._id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-name-en').value = product.nameEn || '';
        document.getElementById('product-generic').value = product.genericName;
        document.getElementById('product-brand').value = product.brand || '';
        document.getElementById('product-manufacturer').value = product.manufacturer || '';
        document.getElementById('product-type').value = product.type;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-subcategory').value = product.subCategory || '';
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-original-price').value = product.originalPrice || '';
        document.getElementById('product-stock').value = product.stock;
        document.getElementById('product-unit').value = product.specifications?.unit || '';
        document.getElementById('product-dosage').value = product.dosage || '';
        document.getElementById('product-usage').value = product.usage || '';
        const imageUrl = product.images?.[0]?.url || '';
        document.getElementById('product-image-url').value = imageUrl;
        document.getElementById('product-featured').checked = product.isFeatured || false;
        
        // Show image preview if exists
        if (imageUrl) {
            showImagePreview(imageUrl);
        }

        currentProductId = id;
        document.getElementById('product-modal').style.display = 'flex';
    } catch (error) {
        console.error('Error loading product:', error);
        showError('Không thể tải thông tin sản phẩm');
    }
}

// Delete product
async function deleteProduct(id) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

    try {
        await window.API.products.delete(id);
        showSuccess('Xóa sản phẩm thành công');
        loadProducts(currentPage);
    } catch (error) {
        console.error('Error deleting product:', error);
        showError('Không thể xóa sản phẩm: ' + error.message);
    }
}

// Close modal
function closeModal() {
    document.getElementById('product-modal').style.display = 'none';
    uploadedImageUrl = null;
    hideImagePreview();
}

// Handle image upload
async function handleImageUpload() {
    const fileInput = document.getElementById('product-image-file');
    const file = fileInput.files[0];
    
    if (!file) {
        showError('Vui lòng chọn file ảnh');
        return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        showError('File ảnh không được vượt quá 5MB');
        return;
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        showError('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)');
        return;
    }
    
    try {
        const uploadBtn = document.getElementById('btn-upload-image');
        uploadBtn.disabled = true;
        uploadBtn.textContent = '⏳ Đang upload...';
        
        console.log('Uploading image:', file.name);
        const response = await window.API.upload.uploadProductImage(file);
        
        if (response.success) {
            uploadedImageUrl = response.data.url;
            document.getElementById('product-image-url').value = window.location.origin + uploadedImageUrl;
            showImagePreview(window.location.origin + uploadedImageUrl);
            showSuccess('Upload ảnh thành công');
            console.log('Image uploaded:', uploadedImageUrl);
        } else {
            showError(response.message || 'Upload ảnh thất bại');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showError('Lỗi khi upload ảnh: ' + error.message);
    } finally {
        const uploadBtn = document.getElementById('btn-upload-image');
        uploadBtn.disabled = false;
        uploadBtn.textContent = '📤 Upload';
    }
}

// Handle remove image
function handleRemoveImage() {
    uploadedImageUrl = null;
    document.getElementById('product-image-url').value = '';
    document.getElementById('product-image-file').value = '';
    hideImagePreview();
}

// Handle image URL change
function handleImageUrlChange(e) {
    const url = e.target.value.trim();
    if (url) {
        showImagePreview(url);
    } else {
        hideImagePreview();
    }
}

// Show image preview
function showImagePreview(url) {
    const preview = document.getElementById('image-preview');
    const img = document.getElementById('preview-img');
    img.src = url;
    preview.style.display = 'block';
}

// Hide image preview
function hideImagePreview() {
    const preview = document.getElementById('image-preview');
    preview.style.display = 'none';
}

// Helper functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function getTypeLabel(type) {
    const labels = {
        'otc': 'OTC',
        'prescription': 'Kê đơn',
        'supplement': 'TPCN'
    };
    return labels[type] || type;
}

function showSuccess(message) {
    alert('✅ ' + message);
}

function showError(message) {
    alert('❌ ' + message);
}

function renderPagination(current, total) {
    const container = document.getElementById('pagination');
    if (total <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '';
    for (let i = 1; i <= total; i++) {
        html += `<button class="btn ${i === current ? 'btn-primary' : 'btn-secondary'}" 
                        data-page="${i}">${i}</button>`;
    }
    container.innerHTML = html;
    
    // Add event listeners for pagination buttons
    container.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', () => loadProducts(parseInt(btn.dataset.page)));
    });
}

// Load categories
async function loadCategories() {
    try {
        const response = await window.API.products.getCategories();
        const categories = response.data || [];
        const select = document.getElementById('filter-category');
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Global variable to store uploaded image URL
let uploadedImageUrl = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Add product button
    document.getElementById('btn-add-product').addEventListener('click', openAddModal);
    
    // Close modal buttons
    document.getElementById('btn-close-modal').addEventListener('click', closeModal);
    document.getElementById('btn-cancel-modal').addEventListener('click', closeModal);
    
    // Upload image button
    document.getElementById('btn-upload-image').addEventListener('click', handleImageUpload);
    
    // Remove image button
    document.getElementById('btn-remove-image').addEventListener('click', handleRemoveImage);
    
    // Image URL input change
    document.getElementById('product-image-url').addEventListener('input', handleImageUrlChange);
    
    // Submit form handler
    document.getElementById('product-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        console.log('=== SUBMIT FORM START ===');
        console.log('Current product ID:', currentProductId);

        const productData = {
            name: document.getElementById('product-name').value.trim(),
            nameEn: document.getElementById('product-name-en').value.trim(),
            genericName: document.getElementById('product-generic').value.trim(),
            brand: document.getElementById('product-brand').value.trim(),
            manufacturer: document.getElementById('product-manufacturer').value.trim(),
            type: document.getElementById('product-type').value,
            category: document.getElementById('product-category').value.trim(),
            subCategory: document.getElementById('product-subcategory').value.trim(),
            description: document.getElementById('product-description').value.trim(),
            price: parseFloat(document.getElementById('product-price').value),
            originalPrice: parseFloat(document.getElementById('product-original-price').value) || undefined,
            stock: parseInt(document.getElementById('product-stock').value),
            dosage: document.getElementById('product-dosage').value.trim(),
            usage: document.getElementById('product-usage').value.trim(),
            isFeatured: document.getElementById('product-featured').checked,
            specifications: {
                unit: document.getElementById('product-unit').value.trim()
            }
        };

        const imageUrl = document.getElementById('product-image-url').value.trim();
        if (imageUrl) {
            productData.images = [{ url: imageUrl, isPrimary: true }];
        }

        console.log('Product data:', JSON.stringify(productData, null, 2));

        try {
            console.log('Token:', window.API.getToken() ? 'Present' : 'Missing');

            let response;
            if (currentProductId) {
                console.log('Updating product:', currentProductId);
                response = await window.API.products.update(currentProductId, productData);
            } else {
                console.log('Creating new product');
                response = await window.API.products.create(productData);
            }

            console.log('Response data:', response);
            console.log('✅ Product saved successfully');
            
            showSuccess(currentProductId ? 'Cập nhật thành công' : 'Thêm sản phẩm thành công');
            closeModal();
            loadProducts(currentPage);
        } catch (error) {
            console.error('❌ Error saving product:', error);
            console.error('Error message:', error.message);
            showError('Không thể lưu sản phẩm: ' + error.message);
        }
        
        console.log('=== SUBMIT FORM END ===');
    });

    // Event listeners
    document.getElementById('search-input').addEventListener('input', () => loadProducts(1));
    document.getElementById('filter-category').addEventListener('change', () => loadProducts(1));
    document.getElementById('filter-type').addEventListener('change', () => loadProducts(1));

    // Close modal on outside click
    window.onclick = function(event) {
        const modal = document.getElementById('product-modal');
        if (event.target === modal) {
            closeModal();
        }
    };

    // Initialize
    loadCategories();
    loadProducts(1);
});


// Image handling functions (if not already defined in HTML)
if (typeof showImagePreview === 'undefined') {
    window.showImagePreview = function(url) {
        const preview = document.getElementById('image-preview');
        const img = document.getElementById('preview-img');
        if (preview && img) {
            img.src = url;
            img.onerror = function() {
                console.error('Failed to load image:', url);
            };
            preview.style.display = 'block';
        }
    };
}

if (typeof hideImagePreview === 'undefined') {
    window.hideImagePreview = function() {
        const preview = document.getElementById('image-preview');
        if (preview) {
            preview.style.display = 'none';
        }
    };
}

if (typeof removeImage === 'undefined') {
    window.removeImage = function() {
        const fileInput = document.getElementById('product-image-file');
        const urlInput = document.getElementById('product-image-url');
        if (fileInput) fileInput.value = '';
        if (urlInput) urlInput.value = '';
        window.hideImagePreview();
    };
}
