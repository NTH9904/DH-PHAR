// Notification system for admin panel
class AdminNotification {
    constructor() {
        this.lastOrderCount = 0;
        this.checkInterval = 30000; // Check every 30 seconds
        this.init();
    }

    init() {
        this.createNotificationBadge();
        this.startChecking();
    }

    createNotificationBadge() {
        // Add badge to orders menu item
        const ordersLink = document.querySelector('a[href="orders.html"]');
        if (ordersLink && !ordersLink.querySelector('.notification-badge')) {
            const badge = document.createElement('span');
            badge.className = 'notification-badge';
            badge.id = 'orders-badge';
            badge.style.cssText = `
                background: #dc3545;
                color: white;
                border-radius: 10px;
                padding: 2px 6px;
                font-size: 11px;
                margin-left: 5px;
                display: none;
            `;
            ordersLink.appendChild(badge);
        }
    }

    async checkNewOrders() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch('/api/orders/admin/all?status=pending&limit=100', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            const pendingCount = data.total || 0;

            // Update badge
            this.updateBadge(pendingCount);

            // Show notification if new orders
            if (this.lastOrderCount > 0 && pendingCount > this.lastOrderCount) {
                const newOrders = pendingCount - this.lastOrderCount;
                this.showNotification(`Có ${newOrders} đơn hàng mới!`);
                this.playSound();
            }

            this.lastOrderCount = pendingCount;
        } catch (error) {
            console.error('Error checking orders:', error);
        }
    }

    updateBadge(count) {
        const badge = document.getElementById('orders-badge');
        if (badge) {
            if (count > 0) {
                badge.textContent = count;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    showNotification(message) {
        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('DH Pharmacy Admin', {
                body: message,
                icon: '/favicon.ico'
            });
        }

        // In-page notification
        this.showToast(message);
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'admin-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    playSound() {
        // Simple beep sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }

    startChecking() {
        // Initial check
        this.checkNewOrders();
        
        // Check periodically
        setInterval(() => this.checkNewOrders(), this.checkInterval);
    }

    static requestPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.adminNotification = new AdminNotification();
        AdminNotification.requestPermission();
    });
} else {
    window.adminNotification = new AdminNotification();
    AdminNotification.requestPermission();
}
