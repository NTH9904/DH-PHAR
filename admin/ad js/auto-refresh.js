// Auto-refresh functionality for admin pages
(function() {
    // Configuration
    const REFRESH_INTERVAL = 30000; // 30 seconds
    const NOTIFICATION_SOUND = true;
    
    let lastOrderCount = 0;
    let lastPendingCount = 0;
    let refreshTimer = null;
    let isRefreshEnabled = localStorage.getItem('autoRefresh') !== 'false';

    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: #27AE60;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        display: none;
        animation: slideIn 0.3s ease;
        font-weight: 600;
    `;
    document.body.appendChild(notification);

    // Create toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'auto-refresh-toggle';
    toggleBtn.innerHTML = isRefreshEnabled ? '🔄 Tự động' : '⏸️ Tạm dừng';
    toggleBtn.title = 'Bật/Tắt tự động cập nhật';
    toggleBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        border: none;
        background: ${isRefreshEnabled ? '#3498DB' : '#95A5A6'};
        color: white;
        font-size: 20px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1000;
        transition: all 0.3s ease;
    `;
    
    toggleBtn.addEventListener('click', function() {
        isRefreshEnabled = !isRefreshEnabled;
        localStorage.setItem('autoRefresh', isRefreshEnabled);
        toggleBtn.innerHTML = isRefreshEnabled ? '🔄 Tự động' : '⏸️ Tạm dừng';
        toggleBtn.style.background = isRefreshEnabled ? '#3498DB' : '#95A5A6';
        
        if (isRefreshEnabled) {
            startAutoRefresh();
            showNotification('Đã bật tự động cập nhật', 'success');
        } else {
            stopAutoRefresh();
            showNotification('Đã tắt tự động cập nhật', 'info');
        }
    });
    
    toggleBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
    });
    
    toggleBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
    
    document.body.appendChild(toggleBtn);

    // Show notification
    function showNotification(message, type = 'success') {
        const colors = {
            success: '#27AE60',
            info: '#3498DB',
            warning: '#F39C12',
            error: '#E74C3C'
        };
        
        notification.style.background = colors[type] || colors.success;
        notification.textContent = message;
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    // Play notification sound
    function playNotificationSound() {
        if (!NOTIFICATION_SOUND) return;
        
        // Create a simple beep sound
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

    // Check for new orders
    async function checkForUpdates() {
        if (!isRefreshEnabled) return;
        
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            // Check orders
            const ordersRes = await fetch('/api/orders/admin/all?limit=1', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!ordersRes.ok) {
                console.warn('Auto-refresh: Orders API not available');
                return;
            }
            
            if (ordersRes.ok) {
                const ordersData = await ordersRes.json();
                const currentOrderCount = ordersData.total || 0;
                
                // New order detected
                if (lastOrderCount > 0 && currentOrderCount > lastOrderCount) {
                    const newOrders = currentOrderCount - lastOrderCount;
                    showNotification(`🎉 ${newOrders} đơn hàng mới!`, 'success');
                    playNotificationSound();
                    
                    // Reload page data if on orders page
                    if (window.location.pathname.includes('orders.html')) {
                        if (typeof loadOrders === 'function') {
                            loadOrders();
                        }
                    }
                    
                    // Reload dashboard if on dashboard
                    if (window.location.pathname.includes('dashboard.html')) {
                        if (typeof loadDashboardData === 'function') {
                            loadDashboardData();
                        }
                    }
                }
                
                lastOrderCount = currentOrderCount;
            }

            // Check pending orders
            const pendingRes = await fetch('/api/orders/admin/all?status=pending&limit=1', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!pendingRes.ok) {
                console.warn('Auto-refresh: Pending orders API not available');
                return;
            }
            
            if (pendingRes.ok) {
                const pendingData = await pendingRes.json();
                const currentPendingCount = pendingData.total || 0;
                
                // Update pending count if element exists
                const pendingElement = document.getElementById('pending-count');
                if (pendingElement && currentPendingCount !== lastPendingCount) {
                    pendingElement.textContent = currentPendingCount;
                    
                    if (currentPendingCount > lastPendingCount && lastPendingCount > 0) {
                        pendingElement.style.animation = 'pulse 0.5s ease';
                        setTimeout(() => {
                            pendingElement.style.animation = '';
                        }, 500);
                    }
                }
                
                lastPendingCount = currentPendingCount;
            }

        } catch (error) {
            console.warn('Auto-refresh error (this is normal if database is not connected):', error.message);
            // Disable auto-refresh temporarily if there are network errors
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                console.log('Auto-refresh: Temporarily disabled due to network issues');
                stopAutoRefresh();
                setTimeout(() => {
                    if (isRefreshEnabled) {
                        console.log('Auto-refresh: Retrying...');
                        startAutoRefresh();
                    }
                }, 60000); // Retry after 1 minute
            }
        }
    }

    // Start auto-refresh
    function startAutoRefresh() {
        if (refreshTimer) return;
        
        // Initial check
        checkForUpdates();
        
        // Set interval
        refreshTimer = setInterval(checkForUpdates, REFRESH_INTERVAL);
        
        console.log('Auto-refresh started (every 30s)');
    }

    // Stop auto-refresh
    function stopAutoRefresh() {
        if (refreshTimer) {
            clearInterval(refreshTimer);
            refreshTimer = null;
            console.log('Auto-refresh stopped');
        }
    }

    // Initialize - delay start to avoid immediate errors
    if (isRefreshEnabled) {
        setTimeout(() => {
            startAutoRefresh();
        }, 5000); // Wait 5 seconds before starting
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', stopAutoRefresh);

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.2);
                color: #E74C3C;
            }
        }
    `;
    document.head.appendChild(style);

    // Export functions for external use
    window.autoRefresh = {
        start: startAutoRefresh,
        stop: stopAutoRefresh,
        check: checkForUpdates,
        isEnabled: () => isRefreshEnabled
    };
})();
