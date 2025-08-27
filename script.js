// ChatGPT Interface Clone - Interactive Features

class ChatInterface {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.setupAnimations();
    }

    setupEventListeners() {
        // Input focus handling
        const chatInput = document.querySelector('.chat-input');
        if (chatInput) {
            chatInput.addEventListener('focus', this.handleInputFocus);
            chatInput.addEventListener('blur', this.handleInputBlur);
            chatInput.addEventListener('input', this.handleInputChange);
            chatInput.addEventListener('keydown', this.handleInputKeydown);
        }

        // Button interactions
        const voiceBtn = document.querySelector('.voice-btn');
        const audioBtn = document.querySelector('.audio-btn');
        const dropdownBtn = document.querySelector('.dropdown-btn');
        const menuBtn = document.querySelector('.menu-btn');

        if (voiceBtn) {
            voiceBtn.addEventListener('click', this.handleVoiceClick);
        }
        if (audioBtn) {
            audioBtn.addEventListener('click', this.handleAudioClick);
        }
        if (dropdownBtn) {
            dropdownBtn.addEventListener('click', this.handleDropdownClick);
        }
        if (menuBtn) {
            menuBtn.addEventListener('click', this.handleMenuClick);
        }

        // Feature cards
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            card.addEventListener('click', this.handleFeatureCardClick);
            card.addEventListener('mouseenter', this.handleCardHover);
        });

        // Window resize handling
        window.addEventListener('resize', this.handleResize);
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Focus input with Ctrl/Cmd + K
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const chatInput = document.querySelector('.chat-input');
                if (chatInput) {
                    chatInput.focus();
                }
            }

            // Clear input with Escape
            if (e.key === 'Escape') {
                const chatInput = document.querySelector('.chat-input');
                if (chatInput && document.activeElement === chatInput) {
                    chatInput.value = '';
                    chatInput.blur();
                }
            }
        });
    }

    setupAnimations() {
        // Add subtle entrance animations
        const elements = document.querySelectorAll('.project-title, .input-container, .feature-cards');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        });

        elements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });

        // Add staggered animation for feature cards
        setTimeout(() => {
            const cards = document.querySelectorAll('.feature-card');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 150);
            });
        }, 300);
    }

    // Event handlers
    handleInputFocus = (e) => {
        const wrapper = e.target.closest('.input-wrapper');
        if (wrapper) {
            wrapper.classList.add('focused');
        }
    }

    handleInputBlur = (e) => {
        const wrapper = e.target.closest('.input-wrapper');
        if (wrapper) {
            wrapper.classList.remove('focused');
        }
    }

    handleInputChange = (e) => {
        const input = e.target;
        const hasValue = input.value.trim().length > 0;
        
        // Toggle send button visibility (could be added in future)
        input.closest('.input-wrapper').classList.toggle('has-content', hasValue);
    }

    handleInputKeydown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.handleSendMessage(e.target.value);
        }
    }

    handleVoiceClick = (e) => {
        e.preventDefault();
        this.toggleVoiceRecording();
    }

    handleAudioClick = (e) => {
        e.preventDefault();
        this.showAudioOptions();
    }

    handleDropdownClick = (e) => {
        e.preventDefault();
        this.showVersionDropdown();
    }

    handleMenuClick = (e) => {
        e.preventDefault();
        this.showContextMenu();
    }

    handleFeatureCardClick = (e) => {
        const card = e.currentTarget;
        const title = card.querySelector('h3').textContent;
        
        // Add click animation
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);

        this.handleFeatureAction(title);
    }

    handleCardHover = (e) => {
        // Add subtle glow effect on hover
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 255, 255, 0.1)';
        
        e.currentTarget.addEventListener('mouseleave', () => {
            e.currentTarget.style.boxShadow = '';
        }, { once: true });
    }

    handleResize = () => {
        // Handle responsive adjustments if needed
        const width = window.innerWidth;
        document.body.classList.toggle('mobile', width < 768);
    }

    // Feature implementations
    async handleSendMessage(message) {
        if (!message.trim()) return;
        
        const input = document.querySelector('.chat-input');
        const chatContainer = this.getChatContainer();
        
        // 清空输入框
        if (input) {
            input.value = '';
            input.disabled = true; // 发送时禁用输入
        }
        
        // 添加用户消息到界面
        this.addMessage(message, 'user');
        
        // 显示正在输入状态
        const typingIndicator = this.showTypingIndicator();
        
        try {
            // 发送消息到后端
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // 移除正在输入指示器
                this.removeTypingIndicator(typingIndicator);
                
                // 添加AI回复到界面
                this.addMessage(data.data.message, 'assistant');
            } else {
                this.removeTypingIndicator(typingIndicator);
                this.addMessage('抱歉，发生了错误：' + (data.error || '未知错误'), 'error');
            }
        } catch (error) {
            console.error('发送消息失败:', error);
            this.removeTypingIndicator(typingIndicator);
            this.addMessage('连接服务器失败，请检查网络连接或确保服务器正在运行。', 'error');
        } finally {
            // 重新启用输入框
            if (input) {
                input.disabled = false;
                input.focus();
            }
        }
    }

    toggleVoiceRecording() {
        const voiceBtn = document.querySelector('.voice-btn');
        const isRecording = voiceBtn.classList.toggle('recording');
        
        if (isRecording) {
            voiceBtn.style.color = '#ff4444';
            this.showTemporaryMessage('Voice recording started (demo)');
        } else {
            voiceBtn.style.color = '';
            this.showTemporaryMessage('Voice recording stopped (demo)');
        }
    }

    showAudioOptions() {
        this.showTemporaryMessage('Audio options would appear here (demo)');
    }

    showVersionDropdown() {
        this.showTemporaryMessage('Version selector would appear here (demo)');
    }

    showContextMenu() {
        this.showTemporaryMessage('Context menu would appear here (demo)');
    }

    handleFeatureAction(featureType) {
        switch(featureType) {
            case 'Add files':
                this.showTemporaryMessage('File upload dialog would open (demo)');
                break;
            case 'Add instructions':
                this.showTemporaryMessage('Instructions editor would open (demo)');
                break;
            default:
                console.log('Unknown feature:', featureType);
        }
    }

    getChatContainer() {
        let chatContainer = document.querySelector('.chat-container');
        
        if (!chatContainer) {
            // 创建聊天容器
            chatContainer = document.createElement('div');
            chatContainer.className = 'chat-container';
            chatContainer.innerHTML = `
                <div class="chat-messages"></div>
            `;
            
            // 插入到主内容区域
            const mainContent = document.querySelector('.main-content');
            const inputContainer = document.querySelector('.input-container');
            mainContent.insertBefore(chatContainer, inputContainer);
            
            // 隐藏初始的功能卡片
            const featureCards = document.querySelector('.feature-cards');
            const projectTitle = document.querySelector('.project-title');
            if (featureCards) featureCards.style.display = 'none';
            if (projectTitle) projectTitle.style.display = 'none';
        }
        
        return chatContainer;
    }
    
    addMessage(text, sender) {
        const chatContainer = this.getChatContainer();
        const messagesContainer = chatContainer.querySelector('.chat-messages');
        
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${sender}`;
        
        const timestamp = new Date().toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageElement.innerHTML = `
            <div class="message-content">
                <div class="message-text">${text}</div>
                <div class="message-time">${timestamp}</div>
            </div>
        `;
        
        // 添加入场动画
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateY(20px)';
        
        messagesContainer.appendChild(messageElement);
        
        // 触发动画
        requestAnimationFrame(() => {
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateY(0)';
        });
        
        // 滚动到底部
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
    }
    
    showTypingIndicator() {
        const chatContainer = this.getChatContainer();
        const messagesContainer = chatContainer.querySelector('.chat-messages');
        
        const typingElement = document.createElement('div');
        typingElement.className = 'message message-assistant typing-indicator';
        typingElement.innerHTML = `
            <div class="message-content">
                <div class="typing-animation">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(typingElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        return typingElement;
    }
    
    removeTypingIndicator(indicator) {
        if (indicator && indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
        }
    }

    showTemporaryMessage(text) {
        // Create and show a temporary toast message
        const toast = document.createElement('div');
        toast.textContent = text;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #2d2d2d;
            color: #FFFFFF;
            padding: 12px 20px;
            border-radius: 8px;
            border: 1px solid #404040;
            font-size: 14px;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        document.body.appendChild(toast);
        
        // Animate in
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
        });

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChatInterface();
});

// Add some additional CSS via JavaScript for dynamic styles
const additionalStyles = `
    .input-wrapper.focused .chat-input {
        border-color: #565656;
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
    }
    
    .voice-btn.recording {
        animation: pulse 1.5s infinite;
    }
    
    .feature-card {
        transition: all 0.2s ease;
    }
    
    body.mobile .feature-cards {
        grid-template-columns: 1fr;
    }
`;

// Add the styles to the document
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
