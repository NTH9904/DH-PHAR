// Zalo Chat Widget
(function() {
    // Cấu hình Zalo OA ID
    const ZALO_OA_ID = '0344864576'; // Thay bằng Zalo OA ID thực tế
    
    // Tạo chat button
    function createChatButton() {
        const chatButton = document.createElement('div');
        chatButton.id = 'zalo-chat-widget';
        chatButton.innerHTML = `
            <div class="zalo-chat-button">
                <img src="https://page.widget.zalo.me/static/images/2.0/Logo.svg" alt="Zalo">
                <span class="chat-text">Chat với chúng tôi</span>
            </div>
        `;
        
        chatButton.onclick = function() {
            openZaloChat();
        };
        
        document.body.appendChild(chatButton);
    }
    
    // Mở Zalo chat
    function openZaloChat() {
        // Mở Zalo OA
        const zaloUrl = `https://zalo.me/${ZALO_OA_ID}`;
        window.open(zaloUrl, '_blank');
    }
    
    // Thêm CSS
    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #zalo-chat-widget {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
                cursor: pointer;
                animation: slideInRight 0.5s ease;
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
                transition: all 0.3s ease;
            }
            
            .zalo-chat-button:hover {
                transform: translateY(-3px);
                box-shadow: 0 6px 20px rgba(0, 104, 255, 0.6);
            }
            
            .zalo-chat-button img {
                width: 24px;
                height: 24px;
            }
            
            .chat-text {
                font-weight: 600;
                font-size: 14px;
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
            
            /* Responsive */
            @media (max-width: 768px) {
                #zalo-chat-widget {
                    bottom: 15px;
                    right: 15px;
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
            }
        `;
        document.head.appendChild(style);
    }
    
    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            addStyles();
            createChatButton();
        });
    } else {
        addStyles();
        createChatButton();
    }
})();
