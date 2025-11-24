// quản lý giỏ hàng
const CART_KEY = 'dh_pharmacy_cart';

// lấy giỏ hàng từ localStorage
const getCart = () => {
  const cartStr = localStorage.getItem(CART_KEY);
  return cartStr ? JSON.parse(cartStr) : { items: [] };
};

// lưu giỏ hàng vào localStorage
const saveCart = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

// thêm sản phẩm vào giỏ hàng
const addToCart = (productId, quantity = 1) => {
  const cart = getCart();
  const existingItem = cart.items.find(item => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ productId, quantity });
  }

  saveCart(cart);
  updateCartUI();
  showNotification('Đã thêm vào giỏ hàng', 'success');
  return cart;
};

// xoá sản phẩm ra khỏi giỏ hàng
const removeFromCart = (productId) => {
  const cart = getCart();
  cart.items = cart.items.filter(item => item.productId !== productId);
  saveCart(cart);
  updateCartUI();
  return cart;
};

// cập nhật số lượng sản phẩm
const updateCartItem = (productId, quantity) => {
  if (quantity <= 0) {
    return removeFromCart(productId);
  }

  const cart = getCart();
  const item = cart.items.find(item => item.productId === productId);
  
  if (item) {
    item.quantity = quantity;
    saveCart(cart);
    updateCartUI();
  }
  
  return cart;
};

// xoá toàn bộ sản phẩm trong giỏ hàng
const clearCart = () => {
  localStorage.removeItem(CART_KEY);
  updateCartUI();
};

// lấy số lượng sản phẩm trong giỏ hàng
const getCartItemCount = () => {
  const cart = getCart();
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
};

// lấy tổng sản phẩm trong giỏ hàng
const getCartTotal = async () => {
  const cart = getCart();
  let total = 0;

  for (const item of cart.items) {
    try {
      const product = await window.API.products.getById(item.productId);
      total += product.data.price * item.quantity;
    } catch (error) {
      console.error('Error calculating cart total:', error);
    }
  }

  return total;
};

// cập nhật UI(giao diện) giỏ hàng
const updateCartUI = () => {
  const count = getCartItemCount();
  const cartBadges = document.querySelectorAll('.cart-badge, .cart-count');
  
  cartBadges.forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  });
};

// hiện thông báo
const showNotification = (message, type = 'info') => {
  // tạo thông báo
  const notification = document.createElement('div');
  notification.className = `alert alert-${type}`;
  notification.textContent = message;
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.zIndex = '9999';
  notification.style.minWidth = '300px';
  notification.style.animation = 'slideIn 0.3s ease';

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
};

// Khởi tạo giao diện giỏ hàng khi tải trang
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
});

// Export
window.Cart = {
  getCart,
  saveCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart,
  getCartItemCount,
  getCartTotal,
  updateCartUI
};
