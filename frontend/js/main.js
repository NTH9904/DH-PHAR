// Main JavaScript
document.addEventListener('DOMContentLoaded', () => {
  // Initialize cart UI
  if (window.Cart) {
    window.Cart.updateCartUI();
  }

  // Check authentication
  const token = window.API?.getToken();
  const user = window.API?.getCurrentUser();

  if (token && user) {
    // User is logged in
    const loginLinks = document.querySelectorAll('.nav-link[href*="login"]');
    const registerLinks = document.querySelectorAll('.nav-link[href*="register"]');
    const profileLinks = document.querySelectorAll('.nav-link[href*="profile"]');

    loginLinks.forEach(link => link.style.display = 'none');
    registerLinks.forEach(link => link.style.display = 'none');
    
    // Show user info: make the greeting act as a logout action
    const userMenu = document.querySelector('.user-menu');
    if (userMenu) {
      userMenu.innerHTML = `
        <a href="#" id="user-logout-link" class="nav-link" title="Đăng xuất">Xin chào, ${user.name}</a>
        <a href="/pages/profile.html" class="nav-link">Tài khoản</a>
      `;

      // attach click handler to show 'Đang xuất...' and logout immediately
      const greetLink = document.getElementById('user-logout-link');
      if (greetLink) {
        greetLink.addEventListener('click', (e) => {
          e.preventDefault();
          greetLink.textContent = 'Đang xuất...';
          // small delay to show feedback, then logout without confirm
          setTimeout(() => logout(true), 400);
        });
      }
    }
  } else {
    // User is not logged in
    const profileLinks = document.querySelectorAll('.nav-link[href*="profile"]');
    profileLinks.forEach(link => link.style.display = 'none');
  }

  // Search functionality
  const searchForm = document.querySelector('.search-bar form');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = searchForm.querySelector('input').value;
      if (query.trim()) {
        window.location.href = `/pages/products.html?search=${encodeURIComponent(query)}`;
      }
    });
  }

  // Mobile menu toggle
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const nav = document.querySelector('.nav');
  if (mobileMenuBtn && nav) {
    mobileMenuBtn.addEventListener('click', () => {
      nav.classList.toggle('active');
    });
  }
});

// Logout function
const logout = (skipConfirm = false) => {
  if (!skipConfirm) {
    if (!confirm('Bạn có chắc muốn đăng xuất?')) return;
  }

  window.API?.removeToken();
  window.API?.removeCurrentUser();
  window.Cart?.clearCart();
  window.location.href = '/pages/index.html';
};

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

// Format date
const formatDate = (date) => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
};

// Show loading
const showLoading = (element) => {
  if (element) {
    element.innerHTML = '<div class="spinner"></div>';
  }
};

// Hide loading
const hideLoading = (element) => {
  if (element) {
    element.innerHTML = '';
  }
};

// Export utilities
window.utils = {
  formatCurrency,
  formatDate,
  showLoading,
  hideLoading,
  logout
};

