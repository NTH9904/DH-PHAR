// Check authentication
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token || user.role !== 'admin') {
    alert('Bạn cần đăng nhập với tài khoản admin');
    window.location.href = '/pages/login.html';
}

let promotions = [];

async function loadPromotions() {
    try {
        const response = await fetch('/api/promotions', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            promotions = data.data || [];
        } else {
            // Mock data if API not available
            promotions = [
                {
                    _id: '1',
                    code: 'SUMMER2024',
                    name: 'Khuyến mãi mùa hè',
                    type: 'percentage',
                    value: 15,
                    maxDiscountAmount: 100000,
                    minOrderAmount: 200000,
                    startDate: '2024-06-01',
                    endDate: '2024-08-31',
                    usageLimit: 100,
                    usedCount: 45,
                    isActive: true
                },
                {
                    _id: '2',
                    code: 'NEWUSER',
                    name: 'Ưu đãi khách hàng mới',
                    type: 'fixed_amount',
                    value: 50000,
                    startDate: '2024-01-01',
                    endDate: '2024-12-31',
                    usageLimit: 1000,
                    usedCount: 234,
                    isActive: true
                }
            ];
        }
        
        updateStats();
        renderPromotions();
    } catch (error) {
        console.error('Error loading promotions:', error);
    }
}

function updateStats() {
    document.getElementById('total-promotions').textContent = promotions.length;
    document.getElementById('active-promotions').textContent = 
        promotions.filter(p => p.isActive).length;
    document.getElementById('total-uses').textContent = 
        promotions.reduce((sum, p) => sum + (p.usedCount || 0), 0);
}

function renderPromotions() {
    const tbody = document.getElementById('promotions-table');
    
    if (promotions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">Chưa có khuyến mãi</td></tr>';
        return;
    }
    
    tbody.innerHTML = promotions.map(promo => `
        <tr>
            <td><strong>${promo.code}</strong></td>
            <td>${promo.name}</td>
            <td>${promo.type === 'percentage' ? 'Phần trăm' : 'Số tiền'}</td>
            <td><strong>${formatValue(promo)}</strong></td>
            <td>
                ${formatDate(promo.startDate)}<br>
                <small>đến ${formatDate(promo.endDate)}</small>
            </td>
            <td>${promo.usedCount || 0}/${promo.usageLimit || '∞'}</td>
            <td>${getStatusBadge(promo)}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editPromotion('${promo._id}')">Sửa</button>
                <button class="btn btn-sm btn-danger" onclick="deletePromotion('${promo._id}')">Xóa</button>
            </td>
        </tr>
    `).join('');
}

function formatValue(promo) {
    if (promo.type === 'percentage') {
        return `${promo.value}%`;
    }
    return formatCurrency(promo.value);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('vi-VN');
}

function getStatusBadge(promo) {
    const now = new Date();
    const start = new Date(promo.startDate);
    const end = new Date(promo.endDate);
    
    if (!promo.isActive) return '<span class="badge badge-secondary">Tạm dừng</span>';
    if (now < start) return '<span class="badge badge-info">Sắp diễn ra</span>';
    if (now > end) return '<span class="badge badge-danger">Đã hết hạn</span>';
    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
        return '<span class="badge badge-warning">Đã hết lượt</span>';
    }
    return '<span class="badge badge-success">Đang hoạt động</span>';
}

function showAddPromotionModal() {
    document.getElementById('modal-title').textContent = 'Tạo khuyến mãi';
    document.getElementById('promotion-form').reset();
    document.getElementById('promotion-id').value = '';
    document.getElementById('promotion-modal').style.display = 'block';
}

function closePromotionModal() {
    document.getElementById('promotion-modal').style.display = 'none';
}

function editPromotion(id) {
    const promo = promotions.find(p => p._id === id);
    if (!promo) return;
    
    document.getElementById('modal-title').textContent = 'Sửa khuyến mãi';
    document.getElementById('promotion-id').value = promo._id;
    document.getElementById('promo-code').value = promo.code;
    document.getElementById('promo-name').value = promo.name;
    document.getElementById('promo-type').value = promo.type;
    document.getElementById('promo-value').value = promo.value;
    document.getElementById('promo-max-discount').value = promo.maxDiscountAmount || '';
    document.getElementById('promo-min-order').value = promo.minOrderAmount || '';
    document.getElementById('promo-start').value = formatDateTimeLocal(promo.startDate);
    document.getElementById('promo-end').value = formatDateTimeLocal(promo.endDate);
    document.getElementById('promo-limit').value = promo.usageLimit || '';
    document.getElementById('promo-user-limit').value = promo.usageLimitPerUser || 1;
    document.getElementById('promo-description').value = promo.description || '';
    
    document.getElementById('promotion-modal').style.display = 'block';
}

function formatDateTimeLocal(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

async function deletePromotion(id) {
    if (!confirm('Bạn có chắc muốn xóa khuyến mãi này?')) return;
    
    try {
        const response = await fetch(`/api/promotions/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            alert('Xóa khuyến mãi thành công');
            loadPromotions();
        } else {
            // Mock delete
            promotions = promotions.filter(p => p._id !== id);
            renderPromotions();
        }
    } catch (error) {
        console.error('Error deleting promotion:', error);
        alert('Không thể xóa khuyến mãi');
    }
}

document.getElementById('promotion-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const promoData = {
        code: document.getElementById('promo-code').value.toUpperCase(),
        name: document.getElementById('promo-name').value,
        type: document.getElementById('promo-type').value,
        value: parseFloat(document.getElementById('promo-value').value),
        maxDiscountAmount: parseFloat(document.getElementById('promo-max-discount').value) || null,
        minOrderAmount: parseFloat(document.getElementById('promo-min-order').value) || null,
        startDate: document.getElementById('promo-start').value,
        endDate: document.getElementById('promo-end').value,
        usageLimit: parseInt(document.getElementById('promo-limit').value) || null,
        usageLimitPerUser: parseInt(document.getElementById('promo-user-limit').value) || 1,
        description: document.getElementById('promo-description').value,
        isActive: true
    };
    
    const id = document.getElementById('promotion-id').value;
    
    try {
        const url = id ? `/api/promotions/${id}` : '/api/promotions';
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(promoData)
        });
        
        if (response.ok) {
            alert(id ? 'Cập nhật thành công' : 'Tạo khuyến mãi thành công');
            closePromotionModal();
            loadPromotions();
        } else {
            throw new Error('Failed to save promotion');
        }
    } catch (error) {
        console.error('Error saving promotion:', error);
        // Mock save
        if (id) {
            const index = promotions.findIndex(p => p._id === id);
            promotions[index] = { ...promotions[index], ...promoData };
        } else {
            promotions.push({ _id: Date.now().toString(), ...promoData, usedCount: 0 });
        }
        closePromotionModal();
        renderPromotions();
    }
});

// Initialize
loadPromotions();
