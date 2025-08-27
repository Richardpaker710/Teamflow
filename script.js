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
        const sendBtn = document.querySelector('.send-btn');
        const logoBtn = document.querySelector('.logo-btn');
        const dropdownBtn = document.querySelector('.dropdown-btn');
        const menuBtn = document.querySelector('.menu-btn');

        if (sendBtn) {
            sendBtn.addEventListener('click', this.handleSendClick);
        }
        if (logoBtn) {
            logoBtn.addEventListener('click', this.handleLogoClick);
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
        const sendBtn = document.querySelector('.send-btn');
        
        // Enable/disable send button based on input content
        if (sendBtn) {
            sendBtn.disabled = !hasValue;
        }
        
        // Toggle input wrapper state
        input.closest('.input-wrapper').classList.toggle('has-content', hasValue);
    }

    handleInputKeydown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.handleSendMessage(e.target.value);
        }
    }

    handleSendClick = (e) => {
        e.preventDefault();
        const input = document.querySelector('.chat-input');
        if (input && input.value.trim()) {
            this.handleSendMessage(input.value.trim());
        }
    }

    handleLogoClick = (e) => {
        e.preventDefault();
        this.returnToHome();
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
                    // 重新启用输入框和更新发送按钮状态
        if (input) {
            input.disabled = false;
            input.focus();
            
            // 重新检查发送按钮状态
            const sendBtn = document.querySelector('.send-btn');
            if (sendBtn) {
                sendBtn.disabled = input.value.trim().length === 0;
            }
        }
        }
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
                this.openFileModal();
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
        
        if (sender === 'assistant') {
            messageElement.innerHTML = `
                <div class="message-content">
                    <div class="message-text">${text}</div>
                    <div class="message-footer">
                        <div class="message-actions">
                            <button class="action-btn copy-btn" title="复制">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                                </svg>
                            </button>
                            <button class="action-btn like-btn" title="点赞">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
                                </svg>
                            </button>
                            <button class="action-btn dislike-btn" title="差评">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
                                </svg>
                            </button>
                            <button class="action-btn regenerate-btn" title="重新生成">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                                </svg>
                            </button>
                            <button class="action-btn share-btn" title="分享">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                                </svg>
                            </button>
                        </div>
                        <div class="message-time">${timestamp}</div>
                    </div>
                </div>
            `;
        } else {
            messageElement.innerHTML = `
                <div class="message-content">
                    <div class="message-text">${text}</div>
                    <div class="message-time">${timestamp}</div>
                </div>
            `;
        }
        
        // 添加入场动画
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateY(20px)';
        
        messagesContainer.appendChild(messageElement);
        
        // 触发动画
        requestAnimationFrame(() => {
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateY(0)';
        });
        
        // 添加事件监听器到操作按钮
        if (sender === 'assistant') {
            this.setupMessageActions(messageElement, text);
        }
        
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

    returnToHome() {
        // Hide chat container and show initial interface
        const chatContainer = document.querySelector('.chat-container');
        const projectTitle = document.querySelector('.project-title');
        const featureCards = document.querySelector('.feature-cards');
        const chatInput = document.querySelector('.chat-input');
        const sendBtn = document.querySelector('.send-btn');
        
        if (chatContainer) {
            chatContainer.style.display = 'none';
        }
        
        if (projectTitle) {
            projectTitle.style.display = 'flex';
        }
        
        if (featureCards) {
            featureCards.style.display = 'grid';
        }
        
        // Clear input and reset send button
        if (chatInput) {
            chatInput.value = '';
            chatInput.placeholder = 'New chat in Teamflow';
        }
        
        if (sendBtn) {
            sendBtn.disabled = true;
        }
        
        this.showTemporaryMessage('返回主页');
    }

    setupMessageActions(messageElement, messageText) {
        const copyBtn = messageElement.querySelector('.copy-btn');
        const likeBtn = messageElement.querySelector('.like-btn');
        const dislikeBtn = messageElement.querySelector('.dislike-btn');
        const regenerateBtn = messageElement.querySelector('.regenerate-btn');
        const shareBtn = messageElement.querySelector('.share-btn');

        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyMessage(messageText, copyBtn));
        }
        if (likeBtn) {
            likeBtn.addEventListener('click', () => this.likeMessage(likeBtn, dislikeBtn));
        }
        if (dislikeBtn) {
            dislikeBtn.addEventListener('click', () => this.dislikeMessage(dislikeBtn, likeBtn));
        }
        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', () => this.regenerateMessage(messageElement));
        }
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.shareMessage(messageText));
        }
    }

    async copyMessage(text, button) {
        try {
            await navigator.clipboard.writeText(text);
            button.classList.add('active');
            this.showTemporaryMessage('已复制到剪贴板');
            
            setTimeout(() => {
                button.classList.remove('active');
            }, 1000);
        } catch (err) {
            console.error('复制失败:', err);
            this.showTemporaryMessage('复制失败');
        }
    }

    likeMessage(likeBtn, dislikeBtn) {
        const isActive = likeBtn.classList.toggle('active');
        if (isActive) {
            dislikeBtn.classList.remove('active');
            this.showTemporaryMessage('感谢您的点赞！');
        } else {
            this.showTemporaryMessage('已取消点赞');
        }
    }

    dislikeMessage(dislikeBtn, likeBtn) {
        const isActive = dislikeBtn.classList.toggle('active');
        if (isActive) {
            likeBtn.classList.remove('active');
            this.showTemporaryMessage('感谢您的反馈，我们会改进');
        } else {
            this.showTemporaryMessage('已取消差评');
        }
    }

    async regenerateMessage(messageElement) {
        const messageText = messageElement.querySelector('.message-text');
        const originalText = messageText.textContent;
        
        // 显示重新生成中的状态
        messageText.innerHTML = '<div class="typing-animation"><span></span><span></span><span></span></div>';
        
        try {
            // 获取用户的最后一条消息
            const userMessages = document.querySelectorAll('.message-user .message-text');
            const lastUserMessage = userMessages[userMessages.length - 1]?.textContent || '请重新回答';
            
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: lastUserMessage })
            });
            
            const data = await response.json();
            
            if (data.success) {
                messageText.textContent = data.data.message;
                this.showTemporaryMessage('已重新生成回复');
            } else {
                messageText.textContent = originalText;
                this.showTemporaryMessage('重新生成失败');
            }
        } catch (error) {
            console.error('重新生成失败:', error);
            messageText.textContent = originalText;
            this.showTemporaryMessage('重新生成失败');
        }
    }

    shareMessage(text) {
        if (navigator.share) {
            navigator.share({
                title: 'ChatGPT 对话',
                text: text,
                url: window.location.href
            }).then(() => {
                this.showTemporaryMessage('分享成功');
            }).catch(() => {
                this.fallbackShare(text);
            });
        } else {
            this.fallbackShare(text);
        }
    }

    fallbackShare(text) {
        const shareData = `ChatGPT 对话：\n\n${text}\n\n来自：${window.location.href}`;
        navigator.clipboard.writeText(shareData).then(() => {
            this.showTemporaryMessage('分享链接已复制到剪贴板');
        }).catch(() => {
            this.showTemporaryMessage('分享失败');
        });
    }

    // File Upload Functions
    openFileModal() {
        const modal = document.getElementById('fileModal');
        if (modal) {
            modal.style.display = 'flex';
            this.setupFileUpload();
        }
    }

    closeFileModal() {
        const modal = document.getElementById('fileModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    setupFileUpload() {
        const dropZone = document.getElementById('fileDropZone');
        const fileInput = document.getElementById('fileInput');
        const addFilesBtn = document.querySelector('.add-files-btn');
        const closeBtn = document.querySelector('.close-modal-btn');

        // Close modal events
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeFileModal());
        }

        // Click outside to close
        document.getElementById('fileModal').addEventListener('click', (e) => {
            if (e.target.id === 'fileModal') {
                this.closeFileModal();
            }
        });

        // Add files button
        if (addFilesBtn) {
            addFilesBtn.addEventListener('click', () => {
                fileInput.click();
            });
        }

        // File input change
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFiles(e.target.files);
            });
        }

        // Drop zone events
        if (dropZone) {
            dropZone.addEventListener('click', () => {
                fileInput.click();
            });

            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('dragover');
            });

            dropZone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                dropZone.classList.remove('dragover');
            });

            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('dragover');
                this.handleFiles(e.dataTransfer.files);
            });
        }
    }

    handleFiles(files) {
        if (!files || files.length === 0) return;

        const uploadedFiles = Array.from(files);
        this.uploadedFilesList = this.uploadedFilesList || [];
        
        uploadedFiles.forEach(file => {
            // Check file size (limit to 10MB)
            if (file.size > 10 * 1024 * 1024) {
                this.showTemporaryMessage(`文件 "${file.name}" 超过10MB限制`);
                return;
            }
            
            this.uploadedFilesList.push(file);
        });

        this.updateFileDisplay();
        this.updateModalFileList();
        this.showTemporaryMessage(`成功添加 ${uploadedFiles.length} 个文件`);
    }

    updateFileDisplay() {
        const fileCard = document.querySelector('.file-card');
        const filesDisplay = fileCard.querySelector('.files-display');
        const filesIcons = fileCard.querySelector('.files-icons');
        const filesNumber = fileCard.querySelector('.files-number');
        const cardTitle = fileCard.querySelector('h3');
        const cardDesc = fileCard.querySelector('p');

        if (this.uploadedFilesList && this.uploadedFilesList.length > 0) {
            // Show files display, hide original content
            filesDisplay.style.display = 'block';
            cardTitle.style.display = 'none';
            cardDesc.style.display = 'none';

            // Update count
            filesNumber.textContent = `${this.uploadedFilesList.length} files`;

            // Update icons
            filesIcons.innerHTML = '';
            this.uploadedFilesList.slice(0, 3).forEach(file => {
                const icon = this.createFileIcon(file);
                filesIcons.appendChild(icon);
            });

            // Add more indicator if needed
            if (this.uploadedFilesList.length > 3) {
                const moreIcon = document.createElement('div');
                moreIcon.className = 'file-icon default';
                moreIcon.innerHTML = `<span style="font-size: 10px; color: white;">+${this.uploadedFilesList.length - 3}</span>`;
                filesIcons.appendChild(moreIcon);
            }
        } else {
            // Show original content, hide files display
            filesDisplay.style.display = 'none';
            cardTitle.style.display = 'block';
            cardDesc.style.display = 'block';
        }
    }

    createFileIcon(file) {
        const icon = document.createElement('div');
        const fileType = this.getFileType(file);
        icon.className = `file-icon ${fileType}`;
        
        const svg = this.getFileIconSVG(fileType);
        icon.innerHTML = svg;
        
        return icon;
    }

    getFileType(file) {
        const ext = file.name.split('.').pop().toLowerCase();
        
        if (['pdf'].includes(ext)) return 'pdf';
        if (['doc', 'docx'].includes(ext)) return 'doc';
        if (['txt', 'md'].includes(ext)) return 'txt';
        if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext)) return 'image';
        if (['js', 'ts', 'html', 'css', 'py', 'java', 'cpp', 'c'].includes(ext)) return 'code';
        
        return 'default';
    }

    getFileIconSVG(type) {
        const icons = {
            pdf: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.267 14.68c-.184 0-.308.018-.372.036v1.178c.076.018.171.023.302.023.479 0 .774-.242.774-.651 0-.366-.254-.586-.704-.586zm3.487.012c-.2 0-.33.018-.407.036v2.61c.077.018.201.018.313.018.817.006 1.349-.444 1.349-1.396.006-.83-.479-1.268-1.255-1.268z"/><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM9.498 16.19c-.309.29-.765.42-1.296.42a2.23 2.23 0 0 1-.308-.018v1.426H7v-3.936A7.558 7.558 0 0 1 8.219 14c.557 0 .953.106 1.22.319.254.202.426.533.426.923-.001.392-.131.723-.367.948zm3.807 1.355c-.42.349-1.059.515-1.84.515-.468 0-.799-.03-1.024-.06v-3.917A7.947 7.947 0 0 1 11.66 14c.757 0 1.249.136 1.633.426.415.308.675.799.675 1.504 0 .763-.279 1.29-.663 1.615zM17 14.77h-1.532v.911H16.9v.734h-1.432v1.604h-.906V14.03H17v.74zM14 9h-1V4l5 5h-4z"/></svg>',
            doc: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/></svg>',
            txt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/></svg>',
            image: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"/></svg>',
            code: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14.6,16.6L19.2,12L14.6,7.4L16,6L22,12L16,18L14.6,16.6M9.4,16.6L4.8,12L9.4,7.4L8,6L2,12L8,18L9.4,16.6Z"/></svg>',
            default: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/></svg>'
        };
        return icons[type] || icons.default;
    }

    updateModalFileList() {
        const uploadedFilesContainer = document.getElementById('uploadedFiles');
        const dropZone = document.getElementById('fileDropZone');
        
        if (!this.uploadedFilesList || this.uploadedFilesList.length === 0) {
            uploadedFilesContainer.style.display = 'none';
            dropZone.style.display = 'flex';
            return;
        }

        uploadedFilesContainer.style.display = 'block';
        dropZone.style.display = 'none';

        uploadedFilesContainer.innerHTML = '';
        
        this.uploadedFilesList.forEach((file, index) => {
            const fileElement = document.createElement('div');
            fileElement.className = 'uploaded-file';
            
            const fileType = this.getFileType(file);
            const fileSize = this.formatFileSize(file.size);
            
            fileElement.innerHTML = `
                <div class="uploaded-file-icon ${fileType}">
                    ${this.getFileIconSVG(fileType)}
                </div>
                <div class="uploaded-file-info">
                    <div class="uploaded-file-name">${file.name}</div>
                    <div class="uploaded-file-size">${fileSize}</div>
                </div>
                <button class="uploaded-file-remove" onclick="chatInterface.removeFile(${index})">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                    </svg>
                </button>
            `;
            
            uploadedFilesContainer.appendChild(fileElement);
        });
    }

    removeFile(index) {
        if (this.uploadedFilesList && index >= 0 && index < this.uploadedFilesList.length) {
            this.uploadedFilesList.splice(index, 1);
            this.updateFileDisplay();
            this.updateModalFileList();
            this.showTemporaryMessage('文件已删除');
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
let chatInterface;
document.addEventListener('DOMContentLoaded', () => {
    chatInterface = new ChatInterface();
});

// Add some additional CSS via JavaScript for dynamic styles
const additionalStyles = `
    .input-wrapper.focused .chat-input {
        border-color: #565656;
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
    }
    
    .feature-card {
        transition: all 0.2s ease;
    }
    
    body.mobile .feature-cards {
        grid-template-columns: 1fr;
    }
    
    .send-btn svg {
        transition: transform 0.2s ease;
    }
    
    .send-btn:not(:disabled):hover svg {
        transform: translateX(1px);
    }
`;

// Add the styles to the document
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
