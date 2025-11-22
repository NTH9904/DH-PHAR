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

  search: (query) => apiRequest(`/products?search=${encodeURIComponent(query)}`)
};

// Orders API
const ordersAPI = {
  create: (orderData) => apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
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

// Export
window.API = {
  auth: authAPI,
  products: productsAPI,
  orders: ordersAPI,
  users: usersAPI,
  prescriptions: prescriptionsAPI,
  getToken,
  setToken,
  removeToken,
  getCurrentUser,
  setCurrentUser,
  removeCurrentUser
};
