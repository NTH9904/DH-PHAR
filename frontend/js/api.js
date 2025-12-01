// API Configuration
const API_BASE_URL = window.location.origin + '/api';

// Get auth token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Set auth token
const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Remove auth token
const removeToken = () => {
  localStorage.removeItem('token');
};

// Get current user
const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Set current user
const setCurrentUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Remove current user
const removeCurrentUser = () => {
  localStorage.removeItem('user');
};

// API Request helper
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        // Unauthorized - clear auth and redirect to login
        removeToken();
        removeCurrentUser();
        if (window.location.pathname !== '/login.html') {
          window.location.href = '/pages/login.html';
        }
      }
      throw new Error(data.message || 'Có lỗi xảy ra');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API
const authAPI = {
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),

  login: (email, password) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),

  getMe: () => apiRequest('/auth/me'),

  updateProfile: (userData) => apiRequest('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(userData)
  }),

  changePassword: (currentPassword, newPassword) => apiRequest('/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword })
  })
};

// Products API
const productsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/products?${queryString}`);
  },

  getById: (id) => apiRequest(`/products/${id}`),

  getBySlug: (slug) => apiRequest(`/products/slug/${slug}`),

  getFeatured: () => apiRequest('/products/featured'),

  getCategories: () => apiRequest('/products/categories'),

  search: (query) => apiRequest(`/products?search=${encodeURIComponent(query)}`),

  // Admin methods
  create: (productData) => apiRequest('/products', {
    method: 'POST',
    body: JSON.stringify(productData)
  }),

  update: (id, productData) => apiRequest(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData)
  }),

  delete: (id) => apiRequest(`/products/${id}`, {
    method: 'DELETE'
  })
};

// Orders API
const ordersAPI = {
  create: (orderData) => apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  }),

  pay: (orderId, data = {}) => apiRequest(`/orders/${orderId}/pay`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  getMyOrders: () => apiRequest('/orders'),

  getById: (id) => apiRequest(`/orders/${id}`),

  cancel: (id, reason) => apiRequest(`/orders/${id}/cancel`, {
    method: 'PUT',
    body: JSON.stringify({ reason })
  })
};

// Users API
const usersAPI = {
  getAddresses: () => apiRequest('/users/addresses'),

  addAddress: (address) => apiRequest('/users/addresses', {
    method: 'POST',
    body: JSON.stringify(address)
  }),

  updateAddress: (addressId, address) => apiRequest(`/users/addresses/${addressId}`, {
    method: 'PUT',
    body: JSON.stringify(address)
  }),

  deleteAddress: (addressId) => apiRequest(`/users/addresses/${addressId}`, {
    method: 'DELETE'
  }),

  updateHealthProfile: (profile) => apiRequest('/users/health-profile', {
    method: 'PUT',
    body: JSON.stringify(profile)
  })
};

// Prescriptions API
const prescriptionsAPI = {
  upload: (formData) => {
    const token = getToken();
    return fetch(`${API_BASE_URL}/prescriptions/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    }).then(res => res.json());
  },

  getAll: () => apiRequest('/prescriptions')
};

// Upload API
const uploadAPI = {
  uploadProductImage: (file) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('image', file);
    
    return fetch(`${API_BASE_URL}/upload/product`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    }).then(res => res.json());
  }
};

// Export
window.API = {
  auth: authAPI,
  products: productsAPI,
  orders: ordersAPI,
  users: usersAPI,
  prescriptions: prescriptionsAPI,
  upload: uploadAPI,
  getToken,
  setToken,
  removeToken,
  getCurrentUser,
  setCurrentUser,
  removeCurrentUser
};

// Dựa trên các ví dụ về hiệu ứng đánh máy cho placeholder
document.addEventListener('DOMContentLoaded', function() {
    const inputElement = document.getElementById('search-input');
    // If this page doesn't have the search input, skip the typing placeholder effect
    if (!inputElement) return;
    // Danh sách các từ khóa gợi ý sẽ được 'đánh máy'
    const words = [
        "Tìm kiếm thuốc ho,cảm cúm.....",
        "Tìm kiếm hoạt chất Paracetamol......",
        "Tìm kiếm triệu chứng đau đầu.....",
        "Tìm kiếm vitamin, thực phẩm chức năng....."
    ];
    let wordIndex = 0; // Chỉ số từ hiện tại trong mảng words
    let charIndex = 0; // Chỉ số ký tự hiện tại đang được gõ/xóa
    let isDeleting = false; // Trạng thái: đang xóa hay đang gõ
    const typingSpeed = 100; // Tốc độ gõ (ms)
    const deletingSpeed = 50; // Tốc độ xóa (ms)
    const pauseTime = 1500; // Thời gian dừng lại sau khi gõ xong một từ (ms)

    function typeEffect() {
        const currentWord = words[wordIndex % words.length];
        
        // 1. Logic cho trạng thái GÕ (Typing)
        if (!isDeleting) {
            // Lấy ký tự tiếp theo và gán vào placeholder
            charIndex++;
            inputElement.placeholder = currentWord.substring(0, charIndex);

            // Nếu đã gõ xong toàn bộ từ hiện tại
            if (charIndex === currentWord.length) {
                isDeleting = true; // Chuyển sang chế độ xóa
                setTimeout(typeEffect, pauseTime); // Tạm dừng trước khi xóa
                return;
            }
        // 2. Logic cho trạng thái XÓA (Deleting)
        } else {
            // Xóa lùi ký tự
            charIndex--;
            inputElement.placeholder = currentWord.substring(0, charIndex);

            // Nếu đã xóa xong toàn bộ
            if (charIndex === 0) {
                isDeleting = false; // Chuyển sang chế độ gõ
                wordIndex++; // Chuyển sang từ tiếp theo
            }
        }

        // 3. Tự động gọi lại hàm (Looping)
        let delay = isDeleting ? deletingSpeed : typingSpeed;
        
        // Ngăn chặn hiệu ứng chạy khi người dùng đang nhập liệu
        if (document.activeElement === inputElement && inputElement.value.length > 0) {
            // Nếu có dữ liệu, dừng hiệu ứng và đặt placeholder mặc định
            inputElement.placeholder = "Tìm kiếm thuốc, hoạt chất, triệu chứng...";
            return;
        }

        setTimeout(typeEffect, delay);
    }

    // Bắt đầu hiệu ứng
    typeEffect();
});