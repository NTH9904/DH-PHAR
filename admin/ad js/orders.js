// Admin Orders scripts
async function loadOrders() {
  try {
    // Replace with API call when available
    // const ordersResponse = await window.API.orders.getAll();
    // const orders = ordersResponse.data || [];
    // TODO: render orders into #orders-list
  } catch (error) {
    console.error('Error loading orders:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadOrders);
} else {
  loadOrders();
}
