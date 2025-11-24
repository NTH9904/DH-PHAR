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

// Dựa trên các ví dụ về hiệu ứng đánh máy cho placeholder
document.addEventListener('DOMContentLoaded', function() {
    const inputElement = document.getElementById('search-input');
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