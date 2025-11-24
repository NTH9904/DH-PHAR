(function(){
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order');
    const method = params.get('method') || 'online';

    const statusEl = document.getElementById('payment-status');
    const actionsEl = document.getElementById('payment-actions');
    const btn = document.getElementById('simulate-pay');

    if (!orderId) {
        statusEl.textContent = 'Thiếu thông tin đơn hàng.';
        return;
    }

    statusEl.textContent = `Phương thức: ${method}. Sẵn sàng thanh toán.`;
    actionsEl.style.display = 'block';

    btn.addEventListener('click', async function(){
        btn.disabled = true;
        statusEl.textContent = 'Đang xử lý thanh toán...';
        try {
            const res = await window.API.orders.pay(orderId, { provider: method });
            // server returns order object
            if (res && res.data) {
                // Clear cart after successful payment
                window.Cart.clearCart();
                statusEl.textContent = 'Thanh toán thành công! Chuyển hướng đến đơn hàng...';
                setTimeout(()=>{
                    window.location.href = `/pages/orders.html?order=${orderId}`;
                }, 1200);
            } else {
                statusEl.textContent = 'Thanh toán không thành công.';
            }
        } catch (err) {
            console.error(err);
            statusEl.textContent = 'Lỗi khi xử lý thanh toán.';
        }
    });
})();