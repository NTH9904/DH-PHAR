// Enhanced Zalo Chat Widget with Chatbot Integration
(function() {
    // Cấu hình Zalo OA
    const ZALO_CONFIG = {
        OA_ID: '0344864576', // Zalo OA ID thực tế
        PHONE: '0344864576',
        BUSINESS_NAME: 'DH Pharmacy',
        WELCOME_MESSAGE: 'Xin chào! Tôi có thể giúp bạn tư vấn về thuốc và sức khỏe.',
        QUICK_REPLIES: [
            'Tư vấn thuốc',
            'Kiểm tra đơn hàng', 
            'Hỏi về giá',
            'Liên hệ dược sĩ'
        ]
    };
    
    let chatWidget = null;
    let isExpanded = false;
    let sessionId = null;
    
    // Generate or get session ID
    function getSessionId() {
        if (!sessionId) {
            sessionId = localStorage.getItem('chatSessionId');
            if (!sessionId) {
                sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('chatSessionId', sessionId);
            }
        }
        return sessionId;
    }
    
    // Tạo chat widget với mini chatbot
    function createChatWidget() {
        chatWidget = document.createElement('div');
        chatWidget.id = 'zalo-chat-widget';
        chatWidget.innerHTML = `
            <div class="chat-widget-container">
                <!-- Chat Button -->
                <div class="zalo-chat-button" onclick="toggleChat()">
                    <img src="https://page.widget.zalo.me/static/images/2.0/Logo.svg" alt="Zalo">
                    <span class="chat-text">Tư vấn miễn phí</span>
                    <div class="notification-badge">1</div>
                </div>
                
                <!-- Mini Chat Window -->
                <div class="mini-chat-window" id="miniChatWindow">
                    <div class="chat-header">
                        <div class="chat-header-info">
                            <img src="https://page.widget.zalo.me/static/images/2.0/Logo.svg" alt="DH Pharmacy">
                            <div>
                                <div class="chat-title">DH Pharmacy</div>
                                <div class="chat-status">🟢 Đang hoạt động</div>
                            </div>
                        </div>
                        <button class="close-chat" onclick="toggleChat()">×</button>
                    </div>
                    
                    <div class="chat-messages">
                        <div class="message bot-message">
                            <div class="message-content">
                                ${ZALO_CONFIG.WELCOME_MESSAGE}
                            </div>
                        </div>
                        <div class="quick-replies">
                            ${ZALO_CONFIG.QUICK_REPLIES.map(reply => 
                                `<button class="quick-reply" onclick="handleQuickReply('${reply}')">${reply}</button>`
                            ).join('')}
                        </div>
                    </div>
                    
                    <div class="chat-input-container">
                        <input type="text" id="chatInput" placeholder="Nhập tin nhắn..." />
                        <button class="send-btn" onclick="sendUserMessage()">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="chat-footer">
                        <button class="chat-zalo-btn" onclick="openZaloChat()">
                            💬 Tiếp tục trên Zalo
                        </button>
                        <button class="chat-phone-btn" onclick="callHotline()">
                            📞 Gọi ngay
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(chatWidget);
        
        // Auto show welcome message after 3 seconds
        setTimeout(showWelcomeNotification, 3000);
    }
    
    // Toggle chat window
    window.toggleChat = function() {
        const miniWindow = document.getElementById('miniChatWindow');
        const button = document.querySelector('.zalo-chat-button');
        const badge = document.querySelector('.notification-badge');
        
        isExpanded = !isExpanded;
        
        if (isExpanded) {
            miniWindow.style.display = 'flex';
            button.style.display = 'none';
            badge.style.display = 'none';
            loadChatHistory();
        } else {
            miniWindow.style.display = 'none';
            button.style.display = 'flex';
        }
    };
    
    // Load chat history
    async function loadChatHistory() {
        try {
            const response = await fetch(`/api/chat/history/${getSessionId()}`);
            const data = await response.json();
            
            if (data.success && data.data.messages && data.data.messages.length > 0) {
                const messagesContainer = document.querySelector('.chat-messages');
                // Clear existing messages except welcome
                const existingMessages = messagesContainer.querySelectorAll('.message:not(.bot-message:first-child)');
                existingMessages.forEach(msg => msg.remove());
                
                // Add history messages
                data.data.messages.forEach(msg => {
                    if (msg.sender === 'user') {
                        addUserMessage(msg.content, false);
                    } else {
                        addBotMessage(msg.content, false);
                    }
                });
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }
    
    // Handle quick replies
    window.handleQuickReply = function(reply) {
        sendMessageToServer(reply);
    };
    
    // Send user message from input
    window.sendUserMessage = function() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        input.value = '';
        sendMessageToServer(message);
    };
    
    // Setup Enter key handler after widget is created
    function setupInputHandler() {
        const input = document.getElementById('chatInput');
        if (input) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    sendUserMessage();
                }
            });
        }
    }
    
    // Send message to server
    async function sendMessageToServer(message) {
        addUserMessage(message);
        
        // Show typing indicator
        showTypingIndicator();
        
        try {
            const response = await fetch('/api/chat/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: getSessionId(),
                    message: message,
                    userName: 'Khách'
                })
            });
            
            const data = await response.json();
            
            // Remove typing indicator
            removeTypingIndicator();
            
            if (data.success && data.data.botMessage) {
                addBotMessage(data.data.botMessage.content);
            } else {
                addBotMessage('Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            removeTypingIndicator();
            addBotMessage('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
        }
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        const messagesContainer = document.querySelector('.chat-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                <span></span><span></span><span></span>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Remove typing indicator
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // Add user message
    function addUserMessage(message, scroll = true) {
        const messagesContainer = document.querySelector('.chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.innerHTML = `<div class="message-content">${escapeHtml(message)}</div>`;
        
        // Remove quick replies if exist
        const quickReplies = messagesContainer.querySelector('.quick-replies');
        if (quickReplies) {
            quickReplies.remove();
        }
        
        messagesContainer.appendChild(messageDiv);
        if (scroll) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
    
    // Add bot message
    function addBotMessage(message, scroll = true) {
        const messagesContainer = document.querySelector('.chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        messageDiv.innerHTML = `<div class="message-content">${escapeHtml(message).replace(/\n/g, '<br>')}</div>`;
        messagesContainer.appendChild(messageDiv);
        if (scroll) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
    
    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Show welcome notification
    function showWelcomeNotification() {
        const badge = document.querySelector('.notification-badge');
        const button = document.querySelector('.zalo-chat-button');
        
        if (badge && !isExpanded) {
            badge.style.display = 'block';
            button.classList.add('pulse');
            
            // Remove pulse after 3 seconds
            setTimeout(() => {
                button.classList.remove('pulse');
            }, 3000);
        }
    }
    
    // Open Zalo chat
    window.openZaloChat = function() {
        const message = encodeURIComponent('Xin chào! Tôi cần tư vấn về thuốc từ DH Pharmacy.');
        const zaloUrl = `https://zalo.me/${ZALO_CONFIG.OA_ID}?text=${message}`;
        window.open(zaloUrl, '_blank');
        
        // Track interaction
        if (typeof gtag !== 'undefined') {
            gtag('event', 'zalo_chat_click', {
                'event_category': 'engagement',
                'event_label': 'zalo_consultation'
            });
        }
    };
    
    // Call hotline
    window.callHotline = function() {
        window.location.href = `tel:${ZALO_CONFIG.PHONE}`;
        
        // Track interaction
        if (typeof gtag !== 'undefined') {
            gtag('event', 'phone_call_click', {
                'event_category': 'engagement',
                'event_label': 'hotline_consultation'
            });
        }
    };
    
    // Enhanced CSS for chatbot widget
    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #zalo-chat-widget {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
                font-family: 'Inter', sans-serif;
            }
            
            .chat-widget-container {
                position: relative;
            }
            
            .zalo-chat-button {
                background: linear-gradient(135deg, #0068FF 0%, #0180F7 100%);
                color: white;
                padding: 12px 20px;
                border-radius: 50px;
                box-shadow: 0 4px 12px rgba(0, 104, 255, 0.4);
                display: flex;
                align-items: center;
                gap: 10px;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                animation: slideInRight 0.5s ease;
            }
            
            .zalo-chat-button:hover {
                transform: translateY(-3px);
                box-shadow: 0 6px 20px rgba(0, 104, 255, 0.6);
            }
            
            .zalo-chat-button.pulse {
                animation: pulse 2s infinite;
            }
            
            .zalo-chat-button img {
                width: 24px;
                height: 24px;
            }
            
            .chat-text {
                font-weight: 600;
                font-size: 14px;
            }
            
            .notification-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #ff4757;
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                display: none;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
                animation: bounce 1s infinite;
            }
            
            .mini-chat-window {
                position: absolute;
                bottom: 70px;
                right: 0;
                width: 350px;
                height: 500px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
                display: none;
                flex-direction: column;
                overflow: hidden;
                animation: slideUp 0.3s ease;
            }
            
            .chat-header {
                background: linear-gradient(135deg, #0068FF 0%, #0180F7 100%);
                color: white;
                padding: 16px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .chat-header-info {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .chat-header-info img {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: white;
                padding: 4px;
            }
            
            .chat-title {
                font-weight: 600;
                font-size: 16px;
            }
            
            .chat-status {
                font-size: 12px;
                opacity: 0.9;
            }
            
            .close-chat {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background 0.2s;
            }
            
            .close-chat:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            .chat-messages {
                flex: 1;
                padding: 16px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .message {
                display: flex;
                margin-bottom: 8px;
            }
            
            .bot-message .message-content {
                background: #f1f3f4;
                color: #333;
                padding: 12px 16px;
                border-radius: 18px 18px 18px 4px;
                max-width: 80%;
                font-size: 14px;
                line-height: 1.4;
            }
            
            .user-message {
                justify-content: flex-end;
            }
            
            .user-message .message-content {
                background: #0068FF;
                color: white;
                padding: 12px 16px;
                border-radius: 18px 18px 4px 18px;
                max-width: 80%;
                font-size: 14px;
                line-height: 1.4;
            }
            
            .quick-replies {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 12px;
            }
            
            .quick-reply {
                background: white;
                border: 2px solid #0068FF;
                color: #0068FF;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
                font-weight: 500;
            }
            
            .quick-reply:hover {
                background: #0068FF;
                color: white;
            }
            
            .chat-input-container {
                padding: 12px 16px;
                border-top: 1px solid #e1e8ed;
                display: flex;
                gap: 8px;
                align-items: center;
                background: white;
            }
            
            .chat-input-container input {
                flex: 1;
                padding: 10px 16px;
                border: 2px solid #e1e8ed;
                border-radius: 20px;
                font-size: 14px;
                outline: none;
                transition: border-color 0.2s;
            }
            
            .chat-input-container input:focus {
                border-color: #0068FF;
            }
            
            .send-btn {
                background: #0068FF;
                color: white;
                border: none;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s;
                flex-shrink: 0;
            }
            
            .send-btn:hover {
                background: #0056d3;
                transform: scale(1.05);
            }
            
            .send-btn:active {
                transform: scale(0.95);
            }
            
            .send-btn svg {
                width: 18px;
                height: 18px;
            }
            
            .typing-indicator .message-content {
                display: flex;
                gap: 4px;
                padding: 12px 16px;
            }
            
            .typing-indicator .message-content span {
                width: 8px;
                height: 8px;
                background: #999;
                border-radius: 50%;
                animation: typing 1.4s infinite;
            }
            
            .typing-indicator .message-content span:nth-child(2) {
                animation-delay: 0.2s;
            }
            
            .typing-indicator .message-content span:nth-child(3) {
                animation-delay: 0.4s;
            }
            
            @keyframes typing {
                0%, 60%, 100% {
                    transform: translateY(0);
                    opacity: 0.7;
                }
                30% {
                    transform: translateY(-10px);
                    opacity: 1;
                }
            }
            
            .chat-footer {
                padding: 12px 16px;
                border-top: 1px solid #e1e8ed;
                display: flex;
                gap: 8px;
            }
            
            .chat-zalo-btn, .chat-phone-btn {
                flex: 1;
                padding: 12px;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .chat-zalo-btn {
                background: #0068FF;
                color: white;
            }
            
            .chat-zalo-btn:hover {
                background: #0056d3;
            }
            
            .chat-phone-btn {
                background: #27ae60;
                color: white;
            }
            
            .chat-phone-btn:hover {
                background: #219a52;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideUp {
                from {
                    transform: translateY(20px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-5px); }
                60% { transform: translateY(-3px); }
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                #zalo-chat-widget {
                    bottom: 15px;
                    right: 15px;
                }
                
                .mini-chat-window {
                    width: calc(100vw - 30px);
                    max-width: 350px;
                    height: 450px;
                }
                
                .chat-text {
                    display: none;
                }
                
                .zalo-chat-button {
                    width: 50px;
                    height: 50px;
                    padding: 0;
                    justify-content: center;
                    border-radius: 50%;
                }
                
                .chat-input-container input {
                    font-size: 16px; /* Prevent zoom on iOS */
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Initialize enhanced chat widget
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            addStyles();
            createChatWidget();
            setupInputHandler();
        });
    } else {
        addStyles();
        createChatWidget();
        setupInputHandler();
    }
})();
