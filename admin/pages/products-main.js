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

    tbody.innerHTML = products.map(product => `
        <tr>
            <td>
                <img src="${product.images?.[0]?.url || 'https://via.placeholder.com/50'}" 
                     alt="${product.name}" 
                     style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
            </td>
            <td><strong>${product.name}</strong><br><small>${product.genericName || ''}</small></td>
            <td>${product.category}</td>
            <td><strong>${formatCurrency(product.price)}</strong></td>
            <td>${product.stock}</td>
            <td><span class="badge badge-${product.type}">${getTypeLabel(product.type)}</span></td>
            <td><span class="badge badge-${product.isActive ? 'success' : 'danger'}">${product.isActive ? 'Hoạt động' : 'Tạm ngưng'}</span></td>
            <td>
                <button class="btn-icon btn-edit" data-id="${product._id}" title="Sửa">✏️</button>
                <button class="btn-icon btn-delete" data-id="${product._id}" title="Xóa">🗑️</button>
            </td>
        </tr>
    `).join('');
    
    // Add event listeners for edit and delete buttons
    tbody.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => editProduct(btn.dataset.id));
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
