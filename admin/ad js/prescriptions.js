// Admin Prescriptions Management
let currentPage = 1;
let currentFilters = {};

// Check authentication
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token || (user.role !== 'admin' && user.role !== 'pharmacist')) {
    alert('Bạn cần đăng nhập với tài khoản admin hoặc dược sĩ');
    window.location.href = '/pages/login.html';
}

// Load prescriptions
async function loadPrescriptions() {
  try {
    showLoading();
    
    const params = new URLSearchParams({
      page: currentPage,
      limit: 20
    });
    
    // Add filters
    Object.keys(currentFilters).forEach(key => {
      if (currentFilters[key] && currentFilters[key] !== '') {
        params.set(key, currentFilters[key]);
      }
    });
    
    const response = await fetch(`/api/prescriptions/all?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      throw new Error('Không thể tải danh sách đơn thuốc');
    }
    
    const data = await response.json();
    displayPrescriptions(data.data || []);
    updatePagination(data);
    updateStats(data);
    
  } catch (error) {
    console.error('Error loading prescriptions:', error);
    showError('Không thể tải danh sách đơn thuốc');
  }
}

function displayPrescriptions(prescriptions) {
  const tbody = document.getElementById('prescriptions-table');
  
  if (prescriptions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">Không có đơn thuốc nào</td></tr>';
    hideLoading();
    return;
  }
  
  tbody.innerHTML = prescriptions.map(prescription => {
    const statusClass = {
      'pending': 'badge-warning',
      'approved': 'badge-success',
      'rejected': 'badge-danger'
    }[prescription.verificationStatus] || 'badge-warning';
    
    const statusText = {
      'pending': 'Chờ duyệt',
      'approved': 'Đã duyệt',
      'rejected': 'Từ chối'
    }[prescription.verificationStatus] || 'Chờ duyệt';
    
    return `
      <tr>
        <td>${prescription._id.slice(-6)}</td>
        <td>
          ${prescription.user?.name || 'N/A'}
          ${prescription.user?.phone ? `<br><small>${prescription.user.phone}</small>` : ''}
        </td>
        <td>
          ${prescription.doctorName || 'N/A'}
          ${prescription.hospitalName ? `<br><small>${prescription.hospitalName}</small>` : ''}
        </td>
        <td>${new Date(prescription.prescriptionDate || prescription.createdAt).toLocaleDateString('vi-VN')}</td>
        <td><span class="badge ${statusClass}">${statusText}</span></td>
        <td>
          ${prescription.imageUrl ? `
            <button class="btn btn-sm btn-primary" onclick="viewPrescriptionImage('${prescription.imageUrl}', '${prescription._id}')">
              🖼️ Xem ảnh
            </button>
          ` : ''}
          ${prescription.verificationStatus === 'pending' ? `
            <button class="btn btn-sm btn-success" onclick="approvePrescription('${prescription._id}')">
              ✅ Duyệt
            </button>
            <button class="btn btn-sm btn-danger" onclick="rejectPrescription('${prescription._id}')">
              ❌ Từ chối
            </button>
          ` : ''}
        </td>
      </tr>
    `;
  }).join('');
  
  hideLoading();
}

function updatePagination(data) {
  const start = data.total > 0 ? (data.page - 1) * 20 + 1 : 0;
  const end = Math.min(data.page * 20, data.total);
  
  document.getElementById('showing-from').textContent = start;
  document.getElementById('showing-to').textContent = end;
  document.getElementById('total-prescriptions').textContent = data.total;
}

function updateStats(data) {
  const pending = data.data.filter(p => p.verificationStatus === 'pending').length;
  const approved = data.data.filter(p => p.verificationStatus === 'approved').length;
  
  document.getElementById('pending-count').textContent = pending;
  document.getElementById('approved-count').textContent = approved;
}

function showLoading() {
  const tbody = document.getElementById('prescriptions-table');
  tbody.innerHTML = '<tr><td colspan="6" class="text-center">Đang tải...</td></tr>';
}

function hideLoading() {
  // Loading hidden after data is displayed
}

function showError(message) {
  const tbody = document.getElementById('prescriptions-table');
  tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="color: red;">${message}</td></tr>`;
}

// View prescription image
window.viewPrescriptionImage = function(imageUrl, prescriptionId) {
  // Create modal if not exists
  let modal = document.getElementById('image-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'image-modal';
    modal.style.cssText = `
      display: none;
      position: fixed;
      z-index: 10000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.9);
    `;
    
    modal.innerHTML = `
      <div style="position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
        <button onclick="closeImageModal()" style="position: absolute; top: 20px; right: 40px; background: white; border: none; font-size: 40px; cursor: pointer; border-radius: 50%; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center;">×</button>
        <img id="modal-image" style="max-width: 90%; max-height: 90%; object-fit: contain; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
      </div>
    `;
    
    document.body.appendChild(modal);
  }
  
  // Set image and show modal
  document.getElementById('modal-image').src = imageUrl;
  modal.style.display = 'block';
  
  // Close on click outside
  modal.onclick = function(e) {
    if (e.target === modal) {
      closeImageModal();
    }
  };
};

window.closeImageModal = function() {
  const modal = document.getElementById('image-modal');
  if (modal) {
    modal.style.display = 'none';
  }
};

// View prescription details
window.viewPrescription = function(id) {
  window.location.href = `/admin/pages/prescription-detail.html?id=${id}`;
};

// Approve prescription
window.approvePrescription = async function(id) {
  if (!confirm('Bạn có chắc muốn duyệt đơn thuốc này?')) return;
  
  try {
    const response = await fetch(`/api/prescriptions/${id}/verify`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        verificationStatus: 'approved',
        verificationNotes: 'Đơn thuốc hợp lệ'
      })
    });
    
    if (!response.ok) throw new Error('Không thể duyệt đơn thuốc');
    
    alert('Đã duyệt đơn thuốc thành công');
    loadPrescriptions();
  } catch (error) {
    alert('Lỗi: ' + error.message);
  }
};

// Reject prescription
window.rejectPrescription = async function(id) {
  const reason = prompt('Lý do từ chối:');
  if (!reason) return;
  
  try {
    const response = await fetch(`/api/prescriptions/${id}/verify`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        verificationStatus: 'rejected',
        verificationNotes: reason
      })
    });
    
    if (!response.ok) throw new Error('Không thể từ chối đơn thuốc');
    
    alert('Đã từ chối đơn thuốc');
    loadPrescriptions();
  } catch (error) {
    alert('Lỗi: ' + error.message);
  }
};

// Setup filters
document.addEventListener('DOMContentLoaded', function() {
  // Search
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(function() {
      currentFilters.search = this.value.trim();
      currentPage = 1;
      loadPrescriptions();
    }, 500));
  }
  
  // Status filter
  const statusFilter = document.getElementById('status-filter');
  if (statusFilter) {
    statusFilter.addEventListener('change', function() {
      currentFilters.status = this.value;
      currentPage = 1;
      loadPrescriptions();
    });
  }
  
  // Date filter
  const dateFilter = document.getElementById('date-filter');
  if (dateFilter) {
    dateFilter.addEventListener('change', function() {
      currentFilters.date = this.value;
      currentPage = 1;
      loadPrescriptions();
    });
  }
  
  loadPrescriptions();
});

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
