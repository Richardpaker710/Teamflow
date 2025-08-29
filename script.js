// ChatGPT Interface Clone - Interactive Features

class ChatInterface {
    constructor() {
        this.sidebarOpen = true; // Default to open
        this.currentUser = null;
        this.isAuthenticated = false;
        this.instructions = ''; // Global instructions (for when no project is selected)
        this.currentProject = null;
        this.projects = [];
        this.uploadedFiles = []; // Global files (for when no project is selected)
        this.currentActiveChatId = null; // Track the currently active chat session
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.setupAnimations();
        this.setupSidebar();
        this.setupAuthModals(); // Setup auth modals before checking auth status
        this.setupInstructionsModal(); // Setup instructions modal
        this.setupProjectModal(); // Setup project modal
        this.checkAuthStatus();
        this.loadProjects();
        // 确保输入框事件在初始化后正确绑定
        this.rebindInputEvents();
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
        const plusBtn = document.querySelector('.plus-btn');
        const logoBtn = document.querySelector('.logo-btn');
        const dropdownBtn = document.querySelector('.dropdown-btn');
        const menuBtn = document.querySelector('.menu-btn');
        const sidebarToggle = document.querySelector('.sidebar-toggle');

        if (sendBtn) {
            sendBtn.addEventListener('click', this.handleSendClick);
        }
        if (plusBtn) {
            plusBtn.addEventListener('click', this.handlePlusClick);
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
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', this.handleSidebarToggle);
        }

        // Feature cards
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            card.addEventListener('click', this.handleFeatureCardClick);
            card.addEventListener('mouseenter', this.handleCardHover);
        });

        // Sidebar navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', this.handleNavItemClick);
        });

        // History menu buttons will be bound dynamically when projects are created
        console.log('History section initialized - no static history items'); // Debug log

        // Context menu items
        const contextMenuItems = document.querySelectorAll('.context-menu-item');
        contextMenuItems.forEach(item => {
            item.addEventListener('click', this.handleContextMenuClick);
        });

        // User account button
        const userAccountBtn = document.querySelector('.sidebar-footer .nav-item');
        if (userAccountBtn) {
            userAccountBtn.addEventListener('click', this.handleUserAccountClick);
        }

        // User menu items
        const userMenuItems = document.querySelectorAll('.user-menu-item');
        userMenuItems.forEach(item => {
            item.addEventListener('click', this.handleUserMenuClick);
        });

        // Window resize handling
        window.addEventListener('resize', this.handleResize);
        
        // Close sidebar on mobile when clicking outside
        document.addEventListener('click', this.handleOutsideClick);
        
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
            const message = e.target.value.trim();
            if (message) {
                this.handleSendMessage(message);
            }
        }
    }

    handleSendClick = (e) => {
        e.preventDefault();
        const input = document.querySelector('.chat-input');
        if (input && input.value.trim()) {
            this.handleSendMessage(input.value.trim());
        }
    }

    handlePlusClick = (e) => {
        e.preventDefault();
        this.openFileModal();
    }

    handleSidebarToggle = (e) => {
        e.preventDefault();
        this.toggleSidebar();
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
        
        // Handle sidebar on mobile
        if (width < 768) {
            this.setupMobileSidebar();
        } else {
            this.setupDesktopSidebar();
        }
    }

    handleNavItemClick = (e) => {
        const navItem = e.currentTarget;
        const text = navItem.querySelector('span')?.textContent;
        
        // Remove active class from all nav items (no longer adding active state on click)
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Handle different navigation actions
        this.handleNavigationAction(text);
    }

    // Sidebar functionality
    setupSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainWrapper = document.querySelector('.main-wrapper');
        
        // Set initial state
        if (this.sidebarOpen) {
            sidebar.classList.remove('collapsed');
            mainWrapper.classList.remove('sidebar-collapsed');
        } else {
            sidebar.classList.add('collapsed');
            mainWrapper.classList.add('sidebar-collapsed');
        }
        
        // Handle responsive behavior
        this.handleResize();
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainWrapper = document.querySelector('.main-wrapper');
        const isMobile = window.innerWidth < 768;
        
        this.sidebarOpen = !this.sidebarOpen;
        
        if (isMobile) {
            // Mobile behavior
            if (this.sidebarOpen) {
                sidebar.classList.add('open');
                sidebar.classList.remove('collapsed');
            } else {
                sidebar.classList.remove('open');
                sidebar.classList.add('collapsed');
            }
        } else {
            // Desktop behavior
            if (this.sidebarOpen) {
                sidebar.classList.remove('collapsed');
                mainWrapper.classList.remove('sidebar-collapsed');
            } else {
                sidebar.classList.add('collapsed');
                mainWrapper.classList.add('sidebar-collapsed');
            }
        }
    }

    setupMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainWrapper = document.querySelector('.main-wrapper');
        
        // On mobile, collapsed means completely hidden
        if (this.sidebarOpen) {
            sidebar.classList.remove('collapsed');
            sidebar.classList.add('open');
            mainWrapper.classList.remove('sidebar-collapsed');
        } else {
            sidebar.classList.add('collapsed');
            sidebar.classList.remove('open');
            mainWrapper.classList.add('sidebar-collapsed');
        }
    }

    setupDesktopSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainWrapper = document.querySelector('.main-wrapper');
        
        sidebar.classList.remove('open');
        
        if (this.sidebarOpen) {
            sidebar.classList.remove('collapsed');
            mainWrapper.classList.remove('sidebar-collapsed');
        } else {
            sidebar.classList.add('collapsed');
            mainWrapper.classList.add('sidebar-collapsed');
        }
    }

    handleNavigationAction(actionType) {
        switch(actionType) {
            case 'New project':
                this.showProjectModal();
                break;
            case 'Search chats':
                this.showTemporaryMessage('Opening search...');
                break;
            case 'Teammates':
                this.showTemporaryMessage('Loading teammates...');
                break;
            default:
                // 不处理历史项目的点击，它们有自己的处理逻辑
                console.log('Navigation action not handled:', actionType);
        }
    }

    handleOutsideClick = (e) => {
        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        const contextMenu = document.getElementById('contextMenu');
        const userMenu = document.getElementById('userMenu');
        const userAccountBtn = document.querySelector('.sidebar-footer .nav-item');
        const isMobile = window.innerWidth < 768;
        
        // Close context menu if clicking outside
        if (contextMenu && !contextMenu.contains(e.target) && !e.target.classList.contains('history-menu-btn')) {
            this.hideContextMenu();
        }
        
        // Close chat history context menu if clicking outside
        const chatHistoryContextMenu = document.getElementById('chatHistoryContextMenu');
        if (chatHistoryContextMenu && !chatHistoryContextMenu.contains(e.target) && !e.target.classList.contains('chat-history-menu-btn')) {
            this.hideChatHistoryContextMenu();
        }
        
        // Close user menu if clicking outside
        if (userMenu && !userMenu.contains(e.target) && !userAccountBtn?.contains(e.target)) {
            this.hideUserMenu();
        }
        
        // Only handle on mobile when sidebar is open
        if (isMobile && this.sidebarOpen) {
            // Check if click is outside sidebar and not on the toggle button
            if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                this.sidebarOpen = false;
                sidebar.classList.remove('open');
                sidebar.classList.add('collapsed');
            }
        }
    }

    handleHistoryMenuClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation(); // 阻止事件冒泡到父元素
        
        console.log('History menu clicked!', e.currentTarget); // Debug log
        
        const projectName = e.currentTarget.getAttribute('data-project');
        const rect = e.currentTarget.getBoundingClientRect();
        
        console.log('Project name:', projectName, 'Position:', rect); // Debug log
        
        if (!projectName) {
            console.error('No project name found on menu button');
            return;
        }
        
        // 确保调用正确的 showContextMenu 方法
        this.showContextMenu(rect.right + 5, rect.top, projectName);
    }

    handleContextMenuClick = (e) => {
        e.preventDefault();
        const action = e.currentTarget.getAttribute('data-action');
        const projectName = this.currentContextProject;
        
        this.hideContextMenu();
        
        if (action === 'rename') {
            this.renameProject(projectName);
        } else if (action === 'delete') {
            this.deleteProject(projectName);
        }
    }

    showContextMenu(x, y, projectName) {
        console.log('Showing context menu for:', projectName, 'at position:', x, y); // Debug log
        
        // Hide any existing context menu first
        this.hideContextMenu();
        
        const contextMenu = document.getElementById('contextMenu');
        if (!contextMenu) {
            console.error('Context menu element not found!');
            return;
        }
        
        this.currentContextProject = projectName;
        
        // Show menu first to get accurate dimensions
        contextMenu.style.display = 'block';
        contextMenu.style.visibility = 'hidden'; // Hide while positioning
        
        // Get accurate dimensions after display
        const rect = contextMenu.getBoundingClientRect();
        const menuWidth = rect.width;
        const menuHeight = rect.height;
        
        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Adjust position if menu would go off-screen
        let adjustedX = x;
        let adjustedY = y;
        
        if (x + menuWidth > viewportWidth) {
            adjustedX = x - menuWidth - 10; // Position to the left
        }
        
        if (y + menuHeight > viewportHeight) {
            adjustedY = y - menuHeight; // Position above
        }
        
        // Apply final position and make visible
        contextMenu.style.left = `${adjustedX}px`;
        contextMenu.style.top = `${adjustedY}px`;
        contextMenu.style.visibility = 'visible';
        contextMenu.style.opacity = '1';
        contextMenu.style.pointerEvents = 'auto';
        
        console.log('Context menu positioned at:', adjustedX, adjustedY); // Debug log
        console.log('Menu dimensions:', menuWidth, 'x', menuHeight); // Debug log
    }

    hideContextMenu() {
        const contextMenu = document.getElementById('contextMenu');
        if (contextMenu) {
            contextMenu.style.display = 'none';
            contextMenu.style.visibility = 'hidden';
            contextMenu.style.opacity = '0';
            contextMenu.style.pointerEvents = 'none';
        }
        this.currentContextProject = null;
    }

    renameProject(projectName) {
        // Find the project in our projects array
        const project = this.projects.find(p => p.name === projectName);
        if (!project) {
            console.error('Project not found:', projectName);
            return;
        }

        // Find the history item in the DOM
        const historyItems = document.querySelectorAll('.history-item');
        let targetItem = null;
        let targetSpan = null;

        historyItems.forEach(item => {
            if (item.getAttribute('data-project') === projectName) {
                targetItem = item;
                targetSpan = item.querySelector('span');
            }
        });

        if (!targetItem || !targetSpan) {
            console.error('History item not found for project:', projectName);
            return;
        }

        // Create an input field for inline editing
        const originalText = targetSpan.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = originalText;
        input.className = 'inline-edit-input';
        input.style.cssText = `
            background: #3a3a3a;
            border: 1px solid #555;
            border-radius: 4px;
            color: #a0a0a0;
            font-size: 14px;
            padding: 2px 6px;
            width: 100%;
            outline: none;
        `;

        // Replace span with input
        targetSpan.style.display = 'none';
        targetItem.appendChild(input);
        input.focus();
        input.select();

        // Handle save/cancel
        const saveEdit = () => {
            const newName = input.value.trim();
            if (newName && newName !== originalText) {
                // Update project data
                project.name = newName;
                
                // Update current project if it's the one being renamed
                if (this.currentProject && this.currentProject.id === project.id) {
                    this.currentProject.name = newName;
                    this.updateMainPageTitle();
                }

                // Update DOM
                targetSpan.textContent = newName;
                targetItem.setAttribute('data-project', newName);
                targetItem.setAttribute('data-project-id', project.id);

                // Update menu button
                const menuBtn = targetItem.parentElement.querySelector('.history-menu-btn');
                if (menuBtn) {
                    menuBtn.setAttribute('data-project', newName);
                }

                // Save to localStorage
                this.saveProjects();

                this.showTemporaryMessage(`Project renamed to "${newName}"`);
            }

            // Restore original display
            input.remove();
            targetSpan.style.display = '';
        };

        const cancelEdit = () => {
            input.remove();
            targetSpan.style.display = '';
        };

        // Event listeners
        input.addEventListener('blur', saveEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                saveEdit();
            } else if (e.key === 'Escape') {
                cancelEdit();
            }
        });
    }

    deleteProject(projectName) {
        if (confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
            // Find the project in our projects array
            const projectIndex = this.projects.findIndex(p => p.name === projectName);
            const project = this.projects[projectIndex];
            
            if (projectIndex === -1) {
                console.error('Project not found:', projectName);
                return;
            }

            // Check if this is the currently selected project
            const isDeletingCurrentProject = this.currentProject && this.currentProject.id === project.id;

            // Remove from projects array
            this.projects.splice(projectIndex, 1);

            // Remove from DOM
            const historyItems = document.querySelectorAll('.history-item-wrapper');
            historyItems.forEach(wrapper => {
                const item = wrapper.querySelector('.history-item');
                if (item && item.getAttribute('data-project-id') === project.id) {
                    wrapper.remove();
                }
            });

            // Handle current project deletion
            if (isDeletingCurrentProject) {
                // Clear current project data
                this.currentProject = null;
                this.uploadedFiles = [];
                this.instructions = '';

                // Reset to default title
                this.updateMainPageTitle();
                this.updateProjectFileDisplay();
                this.updateProjectInstructionsDisplay();

                // If there are other projects, optionally switch to the first one
                if (this.projects.length > 0) {
                    const firstProject = this.projects[0];
                    this.selectProject(firstProject.id);
                }
            }

            // Save updated projects to localStorage
            this.saveProjects();

            // Clear current project from user storage if it was deleted
            if (isDeletingCurrentProject) {
                this.setUserData('current_project', null);
            }

            this.showTemporaryMessage(`Project "${projectName}" deleted`);
        }
    }

    handleUserAccountClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('User account clicked!'); // Debug log
        
        const rect = e.currentTarget.getBoundingClientRect();
        const sidebarRect = document.getElementById('sidebar').getBoundingClientRect();
        
        // Position the menu above the user account button, left-aligned with sidebar
        this.showUserMenu(sidebarRect.left, rect.top - 10);
    }

    handleUserMenuClick = (e) => {
        e.preventDefault();
        const action = e.currentTarget.getAttribute('data-action');
        
        this.hideUserMenu();
        
        switch(action) {
            case 'profile':
                this.showTemporaryMessage('Opening user profile...');
                break;
            case 'settings':
                this.showTemporaryMessage('Opening settings...');
                break;
            case 'help':
                this.showTemporaryMessage('Opening help & support...');
                break;
            case 'logout':
                this.handleLogout();
                break;
            default:
                console.log('Unknown user menu action:', action);
        }
    }

    showUserMenu(x, y) {
        console.log('Showing user menu at position:', x, y); // Debug log
        
        const userMenu = document.getElementById('userMenu');
        if (!userMenu) {
            console.error('User menu element not found!');
            return;
        }
        
        // First, show the menu to get its dimensions
        userMenu.style.display = 'block';
        userMenu.style.visibility = 'hidden'; // Hide while positioning
        
        // Force a reflow to get accurate dimensions
        userMenu.offsetHeight;
        
        const rect = userMenu.getBoundingClientRect();
        const menuHeight = rect.height;
        
        // Position the menu above the user account button
        const finalY = y - menuHeight - 10; // 10px gap above the button
        
        // Set final position
        userMenu.style.left = `${x}px`;
        userMenu.style.top = `${finalY}px`;
        userMenu.style.visibility = 'visible'; // Show the menu
        
        console.log('User menu positioned at:', x, finalY); // Debug log
        
        // Adjust position if menu goes off screen
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const finalRect = userMenu.getBoundingClientRect();
        
        // Adjust horizontal position if needed
        if (finalRect.right > viewportWidth) {
            const adjustedX = viewportWidth - rect.width - 10;
            userMenu.style.left = `${adjustedX}px`;
        }
        
        // Adjust vertical position if needed (show below if no space above)
        if (finalRect.top < 10) {
            userMenu.style.top = `${y + 50}px`; // Show below the button instead
        }
    }

    hideUserMenu() {
        const userMenu = document.getElementById('userMenu');
        if (userMenu) {
            userMenu.style.display = 'none';
        }
    }

    handleLogout() {
        if (confirm('Are you sure you want to log out?')) {
            this.showTemporaryMessage('Logging out...');
            // Here you would typically redirect to login page or clear session
            setTimeout(() => {
                this.showTemporaryMessage('Logged out successfully');
            }, 1000);
        }
    }

    // Feature implementations
    async handleSendMessage(message) {
        if (!message.trim()) return;
        
        const input = document.querySelector('.chat-input');
        
        // 检查是否在主页（没有活跃的聊天会话）
        const isFromHomePage = !this.currentActiveChatId;
        
        // 如果是从主页发送消息，需要创建全新的聊天界面
        if (isFromHomePage) {
            // 清空任何现有的聊天容器内容
            const existingChatContainer = document.querySelector('.chat-container');
            if (existingChatContainer) {
                const messagesContainer = existingChatContainer.querySelector('.chat-messages');
                if (messagesContainer) {
                    messagesContainer.innerHTML = '';
                }
            }
            
            // 重置当前活跃聊天ID
            this.currentActiveChatId = null;
        }
        
        const chatContainer = this.getChatContainer();
        
        // 清空输入框
        if (input) {
            input.value = '';
            input.disabled = true; // 发送时禁用输入
        }
        
        // 添加用户消息到界面
        this.addMessage(message, 'user');
        
        // Handle chat session: continue existing or create new
        let chatId = this.currentActiveChatId;
        if (!chatId) {
            // No active chat, create new session
            chatId = this.createChatSessionSilent(message);
            this.currentActiveChatId = chatId;
        } else {
            // Continue existing chat session
            this.addMessageToChatSession(chatId, message, 'user');
        }
        
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
                
                // Update chat session with AI response and refresh history
                this.addMessageToChatSession(chatId, data.data.message, 'assistant');
                // Only update history display after the conversation is complete
                this.updateChatHistoryDisplay();
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



    handleFeatureAction(featureType) {
        console.log('handleFeatureAction called with:', featureType); // Debug log
        switch(featureType) {
            case 'Add files':
            case 'Files':
                console.log('Opening file modal'); // Debug log
                this.openFileModal();
                break;
            case 'Add instructions':
            case 'Instructions':
                console.log('Opening instructions modal'); // Debug log
                this.showInstructionsModal();
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
            
            // 确保输入框事件在创建聊天容器后仍然有效
            this.rebindInputEvents();
        }
        
        // 每次都要确保正确显示聊天界面，隐藏主页面内容
        const featureCards = document.querySelector('.feature-cards');
        const projectTitle = document.querySelector('.project-title');
        const historySection = document.getElementById('chatHistorySection');
        
        if (featureCards) featureCards.style.display = 'none';
        if (projectTitle) projectTitle.style.display = 'none';
        if (historySection) historySection.style.display = 'none';
        
        // 显示聊天容器
        chatContainer.style.display = 'flex';
        
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
        
        // 显示历史记录区域
        const historySection = document.getElementById('chatHistorySection');
        if (historySection) {
            historySection.style.display = 'block';
        }
        
        // Clear current active chat session
        this.currentActiveChatId = null;
        
        // Clear input and reset send button
        if (chatInput) {
            chatInput.value = '';
            chatInput.placeholder = 'New chat in Teamflow';
        }
        
        if (sendBtn) {
            sendBtn.disabled = true;
        }
        
        // 重新绑定输入框事件监听器
        this.rebindInputEvents();
        
        this.showTemporaryMessage('返回主页');
    }

    rebindInputEvents() {
        // 重新获取输入框元素并绑定事件
        const chatInput = document.querySelector('.chat-input');
        const sendBtn = document.querySelector('.send-btn');
        const plusBtn = document.querySelector('.plus-btn');
        
        if (chatInput) {
            // 移除旧的事件监听器（如果存在）
            chatInput.removeEventListener('focus', this.handleInputFocus);
            chatInput.removeEventListener('blur', this.handleInputBlur);
            chatInput.removeEventListener('input', this.handleInputChange);
            chatInput.removeEventListener('keydown', this.handleInputKeydown);
            
            // 重新添加事件监听器
            chatInput.addEventListener('focus', this.handleInputFocus);
            chatInput.addEventListener('blur', this.handleInputBlur);
            chatInput.addEventListener('input', this.handleInputChange);
            chatInput.addEventListener('keydown', this.handleInputKeydown);
        }
        
        if (sendBtn) {
            sendBtn.removeEventListener('click', this.handleSendClick);
            sendBtn.addEventListener('click', this.handleSendClick);
        }
        
        if (plusBtn) {
            plusBtn.removeEventListener('click', this.handlePlusClick);
            plusBtn.addEventListener('click', this.handlePlusClick);
        }

        // Rebind history menu buttons
        const historyMenuBtns = document.querySelectorAll('.history-menu-btn');
        historyMenuBtns.forEach(btn => {
            btn.removeEventListener('click', this.handleHistoryMenuClick);
            btn.addEventListener('click', this.handleHistoryMenuClick);
        });

        // Rebind context menu items
        const contextMenuItems = document.querySelectorAll('.context-menu-item');
        contextMenuItems.forEach(item => {
            item.removeEventListener('click', this.handleContextMenuClick);
            item.addEventListener('click', this.handleContextMenuClick);
        });

        // Rebind user account button
        const userAccountBtn = document.querySelector('.sidebar-footer .nav-item');
        if (userAccountBtn) {
            userAccountBtn.removeEventListener('click', this.handleUserAccountClick);
            userAccountBtn.addEventListener('click', this.handleUserAccountClick);
        }

        // Rebind user menu items
        const userMenuItems = document.querySelectorAll('.user-menu-item');
        userMenuItems.forEach(item => {
            item.removeEventListener('click', this.handleUserMenuClick);
            item.addEventListener('click', this.handleUserMenuClick);
        });
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

        const newFiles = Array.from(files);
        
        newFiles.forEach(file => {
            // Check file size (limit to 10MB)
            if (file.size > 10 * 1024 * 1024) {
                this.showTemporaryMessage(`文件 "${file.name}" 超过10MB限制`);
                return;
            }
            
            // Add to current files list
            this.uploadedFiles.push(file);
            
            // If a project is selected, save to project immediately
            if (this.currentProject) {
                this.currentProject.files = [...this.uploadedFiles];
                this.saveProjects();
            }
        });

        this.updateFileDisplay();
        this.updateModalFileList();
        this.showTemporaryMessage(`成功添加 ${newFiles.length} 个文件`);
    }

    updateFileDisplay() {
        const fileCard = document.querySelector('.file-card');
        const filesDisplay = fileCard.querySelector('.files-display');
        const filesIcons = fileCard.querySelector('.files-icons');
        const filesNumber = fileCard.querySelector('.files-number');
        const cardTitle = fileCard.querySelector('h3');
        const cardDesc = fileCard.querySelector('p');

        if (this.uploadedFiles && this.uploadedFiles.length > 0) {
            // Update title to show "Files" instead of "Add files"
            cardTitle.textContent = 'Files';
            cardTitle.style.display = 'block';
            
            // Update description to show file count
            cardDesc.textContent = `${this.uploadedFiles.length} file${this.uploadedFiles.length > 1 ? 's' : ''}`;
            cardDesc.style.display = 'block';

            // Show files display with icons
            filesDisplay.style.display = 'flex';
            filesDisplay.style.alignItems = 'center';
            filesDisplay.style.marginTop = '12px';

            // Update icons
            filesIcons.innerHTML = '';
            filesIcons.style.display = 'flex';
            filesIcons.style.gap = '4px';
            
            // Show up to 3 file icons
            this.uploadedFiles.slice(0, 3).forEach(file => {
                const icon = this.createChatGPTStyleFileIcon(file);
                filesIcons.appendChild(icon);
            });

            // Add more indicator if needed
            if (this.uploadedFiles.length > 3) {
                const moreIcon = document.createElement('div');
                moreIcon.className = 'file-icon-chatgpt';
                moreIcon.style.cssText = `
                    width: 32px;
                    height: 32px;
                    background: #565656;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 11px;
                    font-weight: 500;
                    color: white;
                `;
                moreIcon.textContent = `+${this.uploadedFiles.length - 3}`;
                filesIcons.appendChild(moreIcon);
            }
        } else {
            // Show original content
            cardTitle.textContent = 'Add files';
            cardTitle.style.display = 'block';
            cardDesc.textContent = 'Chats in this project can access file content';
            cardDesc.style.display = 'block';
            filesDisplay.style.display = 'none';
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

    createChatGPTStyleFileIcon(file) {
        const icon = document.createElement('div');
        icon.className = 'file-icon-chatgpt';
        icon.style.cssText = `
            width: 32px;
            height: 32px;
            background: #ff6b6b;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        `;
        
        // Different colors for different file types
        const fileType = this.getFileType(file);
        const colors = {
            pdf: '#ff6b6b',
            doc: '#4dabf7', 
            image: '#51cf66',
            video: '#9775fa',
            audio: '#ffd43b',
            code: '#ff8cc8',
            default: '#868e96'
        };
        
        icon.style.background = colors[fileType] || colors.default;
        
        // Add file icon SVG
        icon.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
        `;
        
        return icon;
    }

    updateModalFileList() {
        const uploadedFilesContainer = document.getElementById('uploadedFiles');
        const dropZone = document.getElementById('fileDropZone');
        
        if (!this.uploadedFiles || this.uploadedFiles.length === 0) {
            uploadedFilesContainer.style.display = 'none';
            dropZone.style.display = 'flex';
            return;
        }

        uploadedFilesContainer.style.display = 'block';
        dropZone.style.display = 'none';

        uploadedFilesContainer.innerHTML = '';
        
        this.uploadedFiles.forEach((file, index) => {
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
        if (this.uploadedFiles && index >= 0 && index < this.uploadedFiles.length) {
            this.uploadedFiles.splice(index, 1);
            
            // If a project is selected, update project files
            if (this.currentProject) {
                this.currentProject.files = [...this.uploadedFiles];
                this.saveProjects();
            }
            
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
        console.log('showTemporaryMessage called with:', text);
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

    // Authentication Methods
    checkAuthStatus() {
        const savedUser = localStorage.getItem('teamflow_user');
        const stayLoggedOut = sessionStorage.getItem('teamflow_stay_logged_out');
        
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.isAuthenticated = true;
            this.updateUserDisplay();
            this.hideWelcomeModal();
        } else if (!stayLoggedOut) {
            this.showWelcomeModal();
        }
    }

    setupAuthModals() {
        console.log('Setting up auth modals...');
        
        // Welcome modal buttons
        const showLoginBtn = document.getElementById('showLoginBtn');
        const showSignupBtn = document.getElementById('showSignupBtn');
        const stayLoggedOutBtn = document.getElementById('stayLoggedOutBtn');
        
        console.log('Found elements:', {
            showLoginBtn: !!showLoginBtn,
            showSignupBtn: !!showSignupBtn,
            stayLoggedOutBtn: !!stayLoggedOutBtn
        });

        if (showLoginBtn) {
            showLoginBtn.addEventListener('click', () => this.showLoginModal());
        }
        if (showSignupBtn) {
            showSignupBtn.addEventListener('click', () => this.showSignupModal());
        }
        if (stayLoggedOutBtn) {
            stayLoggedOutBtn.addEventListener('click', () => this.stayLoggedOut());
        }

        // Login modal
        const backToWelcomeFromLogin = document.getElementById('backToWelcomeFromLogin');
        const closeLoginModal = document.getElementById('closeLoginModal');
        const loginForm = document.getElementById('loginForm');
        const googleLoginBtn = document.getElementById('googleLoginBtn');

        if (backToWelcomeFromLogin) {
            backToWelcomeFromLogin.addEventListener('click', () => this.showWelcomeModal());
        }
        if (closeLoginModal) {
            closeLoginModal.addEventListener('click', () => this.hideAllModals());
        }
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        if (googleLoginBtn) {
            googleLoginBtn.addEventListener('click', () => this.handleGoogleLogin());
        }

        // Signup modal
        const backToWelcomeFromSignup = document.getElementById('backToWelcomeFromSignup');
        const closeSignupModal = document.getElementById('closeSignupModal');
        const signupForm = document.getElementById('signupForm');
        
        console.log('Signup modal elements:', {
            backToWelcomeFromSignup: !!backToWelcomeFromSignup,
            closeSignupModal: !!closeSignupModal,
            signupForm: !!signupForm
        });

        if (backToWelcomeFromSignup) {
            backToWelcomeFromSignup.addEventListener('click', () => this.showWelcomeModal());
        }
        if (closeSignupModal) {
            closeSignupModal.addEventListener('click', () => this.hideAllModals());
        }
        if (signupForm) {
            console.log('Binding signup form event listener');
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
            
            // Also add direct button click listener as backup
            const signupSubmitBtn = signupForm.querySelector('button[type="submit"]');
            if (signupSubmitBtn) {
                console.log('Found signup submit button, adding click listener');
                signupSubmitBtn.addEventListener('click', (e) => {
                    console.log('Signup button clicked directly!');
                    e.preventDefault();
                    
                    this.handleSignupFromButton();
                });
            }
        } else {
            console.error('Signup form not found!');
        }

        // Close modals on overlay click
        document.querySelectorAll('.auth-modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.hideAllModals();
                }
            });
        });
    }

    showWelcomeModal() {
        this.hideAllModals();
        const welcomeModal = document.getElementById('welcomeModal');
        if (welcomeModal) {
            welcomeModal.style.display = 'flex';
        }
    }

    showLoginModal() {
        this.hideAllModals();
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.style.display = 'flex';
        }
    }

    showSignupModal() {
        this.hideAllModals();
        const signupModal = document.getElementById('signupModal');
        if (signupModal) {
            signupModal.style.display = 'flex';
        }
    }

    hideAllModals() {
        document.querySelectorAll('.auth-modal-overlay').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    hideWelcomeModal() {
        const welcomeModal = document.getElementById('welcomeModal');
        if (welcomeModal) {
            welcomeModal.style.display = 'none';
        }
    }

    stayLoggedOut() {
        this.hideWelcomeModal();
        // Set a temporary session to avoid showing the modal again during this session
        sessionStorage.setItem('teamflow_stay_logged_out', 'true');
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');

        if (!email || !password) {
            this.showTemporaryMessage('Please fill in all fields', 'error');
            return;
        }

        try {
            // Simulate login API call
            await this.simulateApiCall();
            
            const user = {
                email: email,
                name: email.split('@')[0],
                loginMethod: 'email'
            };

            this.authenticateUser(user);
        } catch (error) {
            console.error('Login error:', error);
            this.showTemporaryMessage('Login failed. Please try again.', 'error');
        }
    }

    async handleSignupFromButton() {
        console.log('handleSignupFromButton called!');
        
        const signupForm = document.getElementById('signupForm');
        if (!signupForm) {
            console.error('Signup form not found!');
            return;
        }
        
        console.log('Signup form found:', signupForm);
        
        const emailInput = document.getElementById('signupEmail');
        const passwordInput = document.getElementById('signupPassword');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        
        console.log('Input elements:', {
            emailInput: !!emailInput,
            passwordInput: !!passwordInput,
            confirmPasswordInput: !!confirmPasswordInput
        });
        
        const email = emailInput ? emailInput.value : '';
        const password = passwordInput ? passwordInput.value : '';
        const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';
        
        console.log('Form values:', { 
            email: email || 'EMPTY', 
            password: password ? '***' : 'EMPTY', 
            confirmPassword: confirmPassword ? '***' : 'EMPTY' 
        });
        
        console.log('Starting validation checks...');
        
        if (!email || !password || !confirmPassword) {
            console.log('Validation failed: missing fields');
            this.showTemporaryMessage('Please fill in all fields', 'error');
            return;
        }

        if (password !== confirmPassword) {
            console.log('Validation failed: passwords do not match');
            this.showTemporaryMessage('Passwords do not match', 'error');
            return;
        }

        if (password.length < 6) {
            console.log('Validation failed: password too short');
            this.showTemporaryMessage('Password must be at least 6 characters', 'error');
            return;
        }

        console.log('All validations passed, starting signup process...');

        try {
            console.log('Calling simulateApiCall...');
            // Simulate signup API call
            await this.simulateApiCall();
            
            console.log('API call completed, creating user object...');
            const user = {
                email: email,
                name: email.split('@')[0],
                loginMethod: 'email'
            };

            console.log('Authenticating user:', user);
            this.authenticateUser(user);
            
            console.log('Registration completed successfully - no popup needed');
        } catch (error) {
            console.error('Signup error:', error);
            this.showTemporaryMessage('Signup failed. Please try again.', 'error');
        }
    }

    async handleSignup(e) {
        console.log('handleSignup called!', e);
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        if (!email || !password || !confirmPassword) {
            this.showTemporaryMessage('Please fill in all fields', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showTemporaryMessage('Passwords do not match', 'error');
            return;
        }

        if (password.length < 6) {
            this.showTemporaryMessage('Password must be at least 6 characters', 'error');
            return;
        }

        try {
            // Simulate signup API call
            await this.simulateApiCall();
            
            const user = {
                email: email,
                name: email.split('@')[0],
                loginMethod: 'email'
            };

            this.authenticateUser(user);
        } catch (error) {
            console.error('Signup error:', error);
            this.showTemporaryMessage('Signup failed. Please try again.', 'error');
        }
    }

    async handleGoogleLogin() {
        try {
            // Simulate Google OAuth
            await this.simulateApiCall();
            
            const user = {
                email: 'user@gmail.com',
                name: 'Google User',
                loginMethod: 'google'
            };

            this.authenticateUser(user);
        } catch (error) {
            console.error('Google login error:', error);
            this.showTemporaryMessage('Google login failed. Please try again.', 'error');
        }
    }

    authenticateUser(user) {
        console.log('authenticateUser called with:', user);
        
        this.currentUser = user;
        this.isAuthenticated = true;
        
        console.log('Saving user to localStorage...');
        // Save to localStorage
        localStorage.setItem('teamflow_user', JSON.stringify(user));
        
        console.log('Updating user display...');
        // Update UI
        this.updateUserDisplay();
        
        console.log('Loading user-specific data...');
        // Load user-specific data
        this.loadProjects();
        this.loadInstructions();
        
        console.log('Hiding all modals...');
        this.hideAllModals();
        
        console.log('Authentication completed successfully!');
    }

    updateUserDisplay() {
        if (!this.currentUser) return;

        const userDisplayName = document.getElementById('userDisplayName');
        const userDisplayEmail = document.getElementById('userDisplayEmail');

        if (userDisplayName) {
            userDisplayName.textContent = this.currentUser.name || 'User';
        }
        if (userDisplayEmail) {
            userDisplayEmail.textContent = this.currentUser.email;
        }
    }

    handleLogout() {
        if (confirm('Are you sure you want to log out?')) {
            // Clear current user data from memory
            this.currentUser = null;
            this.isAuthenticated = false;
            this.projects = [];
            this.currentProject = null;
            this.instructions = '';
            this.uploadedFiles = [];
            
            // Clear global localStorage
            localStorage.removeItem('teamflow_user');
            sessionStorage.removeItem('teamflow_stay_logged_out');
            
            // Update UI
            this.updateMainPageTitle();
            this.updateProjectHistory();
            this.updateProjectFileDisplay();
            this.updateProjectInstructionsDisplay();
            this.updateChatHistoryDisplay();
            
            // Reset user display
            const userDisplayName = document.getElementById('userDisplayName');
            const userDisplayEmail = document.getElementById('userDisplayEmail');
            
            if (userDisplayName) {
                userDisplayName.textContent = 'User Account';
            }
            if (userDisplayEmail) {
                userDisplayEmail.textContent = 'user@teamflow.com';
            }
            
            // Hide user menu
            this.hideUserMenu();
            
            // Show welcome modal
            this.showWelcomeModal();
            
            this.showTemporaryMessage('Logged out successfully', 'success');
        }
    }

    simulateApiCall() {
        return new Promise((resolve) => {
            setTimeout(resolve, 1000); // Simulate network delay
        });
    }

    // Instructions Modal Methods
    setupInstructionsModal() {
        console.log('Setting up instructions modal...');
        
        const closeInstructionsModal = document.getElementById('closeInstructionsModal');
        const cancelInstructions = document.getElementById('cancelInstructions');
        const saveInstructions = document.getElementById('saveInstructions');
        const instructionsModal = document.getElementById('instructionsModal');

        if (closeInstructionsModal) {
            closeInstructionsModal.addEventListener('click', () => this.hideInstructionsModal());
        }
        
        if (cancelInstructions) {
            cancelInstructions.addEventListener('click', () => this.hideInstructionsModal());
        }
        
        if (saveInstructions) {
            saveInstructions.addEventListener('click', () => this.saveInstructions());
        }

        // Close modal on overlay click
        if (instructionsModal) {
            instructionsModal.addEventListener('click', (e) => {
                if (e.target === instructionsModal) {
                    this.hideInstructionsModal();
                }
            });
        }

        // Load saved instructions
        this.loadInstructions();
    }

    showInstructionsModal() {
        console.log('Showing instructions modal');
        const instructionsModal = document.getElementById('instructionsModal');
        const instructionsTextarea = document.getElementById('instructionsTextarea');
        
        if (instructionsModal) {
            // Load current instructions into textarea
            if (instructionsTextarea) {
                instructionsTextarea.value = this.instructions || '';
            }
            
            instructionsModal.style.display = 'flex';
            
            // Focus on textarea after modal is shown
            setTimeout(() => {
                if (instructionsTextarea) {
                    instructionsTextarea.focus();
                }
            }, 100);
        }
    }

    hideInstructionsModal() {
        console.log('Hiding instructions modal');
        const instructionsModal = document.getElementById('instructionsModal');
        
        if (instructionsModal) {
            instructionsModal.style.display = 'none';
        }
    }

    saveInstructions() {
        console.log('Saving instructions');
        const instructionsTextarea = document.getElementById('instructionsTextarea');
        
        if (instructionsTextarea) {
            const newInstructions = instructionsTextarea.value.trim();
            this.instructions = newInstructions;
            
            // Save to current project if one is selected
            if (this.currentProject) {
                this.currentProject.instructions = newInstructions;
                this.saveProjects(); // Save projects to localStorage
                console.log('Instructions saved to project:', this.currentProject.name);
            } else {
                // Save to user-specific localStorage if no project selected
                this.setUserData('instructions', newInstructions);
                console.log('Instructions saved to user data');
            }
            
            console.log('Instructions saved:', newInstructions);
            
            // Hide modal
            this.hideInstructionsModal();
            
            // Update instructions card display
            this.updateInstructionsCardDisplay();
            
            // Show success message only if there are instructions
            if (newInstructions) {
                this.showTemporaryMessage('Instructions saved successfully');
            }
        }
    }

    loadInstructions() {
        // Load instructions from user-specific storage
        this.instructions = this.getUserData('instructions', '');
        console.log('Instructions loaded:', this.instructions);
    }

    getInstructions() {
        return this.instructions;
    }

    // Project Modal Methods
    setupProjectModal() {
        console.log('Setting up project modal...');
        
        const closeProjectModal = document.getElementById('closeProjectModal');
        const createProjectBtn = document.getElementById('createProjectBtn');
        const projectModal = document.getElementById('projectModal');
        const emojiSelector = document.getElementById('emojiSelector');
        const emojiPicker = document.getElementById('emojiPicker');

        if (closeProjectModal) {
            closeProjectModal.addEventListener('click', () => this.hideProjectModal());
        }
        
        if (createProjectBtn) {
            createProjectBtn.addEventListener('click', () => this.createProject());
        }

        if (emojiSelector) {
            emojiSelector.addEventListener('click', (e) => this.toggleEmojiPicker(e));
        }

        // Emoji picker options
        const emojiOptions = document.querySelectorAll('.emoji-option');
        emojiOptions.forEach(option => {
            option.addEventListener('click', (e) => this.selectEmoji(e));
        });

        // Category buttons
        const categoryBtns = document.querySelectorAll('.category-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.selectCategory(e));
        });

        // Close modal on overlay click
        if (projectModal) {
            projectModal.addEventListener('click', (e) => {
                if (e.target === projectModal) {
                    this.hideProjectModal();
                }
            });
        }

        // Close emoji picker on outside click
        document.addEventListener('click', (e) => {
            if (emojiPicker && !emojiSelector.contains(e.target) && !emojiPicker.contains(e.target)) {
                this.hideEmojiPicker();
            }
        });
    }

    showProjectModal() {
        console.log('Showing project modal');
        const projectModal = document.getElementById('projectModal');
        const projectNameInput = document.getElementById('projectNameInput');
        
        if (projectModal) {
            // Reset form
            this.resetProjectForm();
            
            projectModal.style.display = 'flex';
            
            // Focus on input after modal is shown
            setTimeout(() => {
                if (projectNameInput) {
                    projectNameInput.focus();
                }
            }, 100);
        }
    }

    hideProjectModal() {
        console.log('Hiding project modal');
        const projectModal = document.getElementById('projectModal');
        
        if (projectModal) {
            projectModal.style.display = 'none';
            this.hideEmojiPicker();
        }
    }

    resetProjectForm() {
        const projectNameInput = document.getElementById('projectNameInput');
        const selectedEmoji = document.getElementById('selectedEmoji');
        const categoryBtns = document.querySelectorAll('.category-btn');
        
        if (projectNameInput) {
            projectNameInput.value = '';
        }
        
        if (selectedEmoji) {
            selectedEmoji.textContent = '😊';
        }
        
        categoryBtns.forEach(btn => {
            btn.classList.remove('selected');
        });
    }

    toggleEmojiPicker(e) {
        e.stopPropagation();
        const emojiPicker = document.getElementById('emojiPicker');
        const emojiSelector = document.getElementById('emojiSelector');
        
        if (emojiPicker && emojiSelector) {
            const isVisible = emojiPicker.style.display === 'block';
            
            if (isVisible) {
                this.hideEmojiPicker();
            } else {
                this.showEmojiPicker();
            }
        }
    }

    showEmojiPicker() {
        const emojiPicker = document.getElementById('emojiPicker');
        const emojiSelector = document.getElementById('emojiSelector');
        
        if (emojiPicker && emojiSelector) {
            const rect = emojiSelector.getBoundingClientRect();
            
            emojiPicker.style.left = `${rect.left}px`;
            emojiPicker.style.top = `${rect.bottom + 8}px`;
            emojiPicker.style.display = 'block';
            
            emojiSelector.classList.add('open');
            
            // Force reflow for transition
            emojiPicker.offsetHeight;
        }
    }

    hideEmojiPicker() {
        const emojiPicker = document.getElementById('emojiPicker');
        const emojiSelector = document.getElementById('emojiSelector');
        
        if (emojiPicker) {
            emojiPicker.style.display = 'none';
        }
        
        if (emojiSelector) {
            emojiSelector.classList.remove('open');
        }
    }

    selectEmoji(e) {
        const emoji = e.target.getAttribute('data-emoji');
        const selectedEmoji = document.getElementById('selectedEmoji');
        
        if (selectedEmoji && emoji) {
            selectedEmoji.textContent = emoji;
        }
        
        this.hideEmojiPicker();
    }

    selectCategory(e) {
        const categoryBtn = e.currentTarget;
        const emoji = categoryBtn.getAttribute('data-emoji');
        const categoryName = categoryBtn.getAttribute('data-category');
        const projectNameInput = document.getElementById('projectNameInput');
        const selectedEmoji = document.getElementById('selectedEmoji');
        
        // Remove selected class from all categories
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Add selected class to clicked category
        categoryBtn.classList.add('selected');
        
        // Update emoji and project name
        if (selectedEmoji && emoji) {
            selectedEmoji.textContent = emoji;
        }
        
        if (projectNameInput) {
            projectNameInput.value = this.getCategoryDisplayName(categoryName);
        }
    }

    getCategoryDisplayName(category) {
        const categoryNames = {
            'investing': 'Investment Portfolio',
            'homework': 'Study Project',
            'writing': 'Writing Project',
            'health': 'Health & Wellness',
            'travel': 'Travel Planning'
        };
        
        return categoryNames[category] || category;
    }

    createProject() {
        console.log('Creating project...');
        
        const projectNameInput = document.getElementById('projectNameInput');
        const selectedEmoji = document.getElementById('selectedEmoji');
        
        if (!projectNameInput || !selectedEmoji) {
            console.error('Required elements not found');
            return;
        }
        
        const projectName = projectNameInput.value.trim();
        const emoji = selectedEmoji.textContent;
        
        if (!projectName) {
            this.showTemporaryMessage('Please enter a project name');
            return;
        }
        
        const project = {
            id: Date.now().toString(),
            name: projectName,
            emoji: emoji,
            createdAt: new Date().toISOString(),
            isActive: true,
            instructions: '', // Project-specific instructions
            files: [], // Project-specific files
            chats: [] // Project-specific chat history
        };
        
        // Save current data before switching
        this.saveCurrentProjectData();
        
        // Set as current project
        this.currentProject = project;
        
        // Add to projects list
        this.projects.unshift(project);
        
        // Clear current data for new project
        this.uploadedFiles = [];
        this.instructions = '';
        
        // Save to localStorage
        this.saveProjects();
        
        // Update UI
        this.updateMainPageTitle();
        this.updateProjectHistory();
        this.updateProjectFileDisplay();
        this.updateProjectInstructionsDisplay();
        
        // Hide modal
        this.hideProjectModal();
        
        console.log('Project created:', project);
    }

    updateMainPageTitle() {
        const projectTitle = document.querySelector('.project-title h2');
        const folderIcon = document.querySelector('.folder-icon');
        
        if (projectTitle && this.currentProject) {
            projectTitle.textContent = this.currentProject.name;
            
            // Update folder icon to show project emoji
            if (folderIcon) {
                folderIcon.innerHTML = `<span style="font-size: 30px;">${this.currentProject.emoji}</span>`;
            }
        } else if (projectTitle) {
            projectTitle.textContent = 'TeamFlow';
            
            // Reset to original folder icon
            if (folderIcon) {
                folderIcon.innerHTML = `
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
                    </svg>
                `;
            }
        }
    }

    updateProjectHistory() {
        const historyList = document.querySelector('.history-list');
        
        if (!historyList) return;
        
        // Clear all existing history items
        historyList.innerHTML = '';
        
        // If no projects, show empty state
        if (this.projects.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <div style="
                    text-align: center;
                    color: #666;
                    font-size: 13px;
                    padding: 16px 12px;
                    font-style: italic;
                ">
                    No projects yet<br>
                    <span style="font-size: 12px; color: #555;">Create your first project!</span>
                </div>
            `;
            historyList.appendChild(emptyState);
            return;
        }
        
        // Add projects to history
        this.projects.forEach(project => {
            const historyItemWrapper = document.createElement('div');
            historyItemWrapper.className = 'history-item-wrapper';
            
            historyItemWrapper.innerHTML = `
                <div class="history-item" data-project="${project.name}" data-project-id="${project.id}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px; color: #a0a0a0; flex-shrink: 0;">
                        <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
                    </svg>
                    <span style="color: #a0a0a0; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${project.name}</span>
                </div>
                <button class="history-menu-btn" data-project="${project.name}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="5" cy="12" r="2"/>
                        <circle cx="12" cy="12" r="2"/>
                        <circle cx="19" cy="12" r="2"/>
                    </svg>
                </button>
            `;
            
            // Add click event for project selection
            const historyItem = historyItemWrapper.querySelector('.history-item');
            historyItem.addEventListener('click', () => {
                this.selectProject(project.id);
            });
            
            historyList.appendChild(historyItemWrapper);
        });
        
        // Rebind event listeners for history items
        this.rebindHistoryEvents();
    }

    rebindHistoryEvents() {
        // Bind history item clicks for project selection
        const historyItems = document.querySelectorAll('.history-item[data-project-id]');
        console.log('Rebinding history items:', historyItems.length); // Debug log
        historyItems.forEach(item => {
            item.removeEventListener('click', this.handleHistoryItemClick);
            item.addEventListener('click', this.handleHistoryItemClick);
        });

        // Rebind history menu buttons
        const historyMenuBtns = document.querySelectorAll('.history-menu-btn');
        console.log('Rebinding history menu buttons:', historyMenuBtns.length); // Debug log
        historyMenuBtns.forEach((btn, index) => {
            console.log(`Button ${index}:`, btn, 'data-project:', btn.getAttribute('data-project')); // Debug log
            btn.removeEventListener('click', this.handleHistoryMenuClick);
            btn.addEventListener('click', this.handleHistoryMenuClick);
        });
    }

    handleHistoryItemClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const projectId = e.currentTarget.getAttribute('data-project-id');
        if (projectId && projectId !== this.currentProject?.id) {
            this.selectProject(projectId);
        }
    }

    selectProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        
        if (project) {
            // Save current project data before switching
            this.saveCurrentProjectData();
            
            // Switch to new project
            this.currentProject = project;
            
            // Load project-specific data
            this.loadProjectData();
            
            // Clear current active chat session when switching projects
            this.currentActiveChatId = null;
            
            // If we're in a chat page, return to home first
            const chatContainer = document.querySelector('.chat-container');
            if (chatContainer && chatContainer.style.display !== 'none') {
                this.returnToHome();
            }
            
            // Update UI
            this.updateMainPageTitle();
            this.updateProjectFileDisplay();
            this.updateProjectInstructionsDisplay();
            this.updateChatHistoryDisplay();
            
            // Save projects to localStorage
            this.saveProjects();
            
            this.showTemporaryMessage(`Switched to ${project.name}`);
        }
    }

    saveProjects() {
        this.setUserData('projects', this.projects);
        this.setUserData('current_project', this.currentProject);
    }

    loadProjects() {
        this.projects = this.getUserData('projects', []);
        this.currentProject = this.getUserData('current_project', null);
        
        if (this.currentProject) {
            this.updateMainPageTitle();
        }
        
        // Update history display
        this.updateProjectHistory();
        
        // Load project-specific data if a project is selected
        if (this.currentProject) {
            this.loadProjectData();
            this.updateProjectFileDisplay();
            this.updateProjectInstructionsDisplay();
            this.updateChatHistoryDisplay();
        }
    }

    saveCurrentProjectData() {
        if (this.currentProject) {
            // Save current instructions to project
            this.currentProject.instructions = this.instructions;
            this.currentProject.files = [...this.uploadedFiles];
            
            // Update the project in the projects array
            const projectIndex = this.projects.findIndex(p => p.id === this.currentProject.id);
            if (projectIndex !== -1) {
                this.projects[projectIndex] = { ...this.currentProject };
            }
        }
    }

    loadProjectData() {
        if (this.currentProject) {
            // Load project-specific instructions and files
            this.instructions = this.currentProject.instructions || '';
            this.uploadedFiles = this.currentProject.files || [];
        } else {
            // Load user-specific instructions and files
            this.instructions = this.getUserData('instructions', '');
            this.uploadedFiles = this.getUserData('files', []);
        }
    }

    updateProjectFileDisplay() {
        // Update file modal display if it exists
        const fileList = document.querySelector('.file-list');
        if (fileList) {
            this.displayFiles();
        }
        
        // Update file count display if it exists
        this.updateFileCount();
    }

    updateProjectInstructionsDisplay() {
        // Update instructions textarea if modal is open
        const instructionsTextarea = document.getElementById('instructionsTextarea');
        if (instructionsTextarea) {
            instructionsTextarea.value = this.instructions || '';
        }
        
        // Update instructions card display
        this.updateInstructionsCardDisplay();
    }

    updateInstructionsCardDisplay() {
        const instructionsCard = document.querySelector('.instructions-card');
        const cardTitle = instructionsCard.querySelector('h3');
        const cardDesc = instructionsCard.querySelector('p');
        const instructionsPreview = instructionsCard.querySelector('.instructions-preview');
        const instructionsContent = instructionsCard.querySelector('.instructions-content');

        if (this.instructions && this.instructions.trim()) {
            // Update title to show "Instructions" instead of "Add instructions"
            cardTitle.textContent = 'Instructions';
            
            // Hide the default description
            cardDesc.style.display = 'none';
            
            // Show instructions preview
            instructionsPreview.style.display = 'block';
            instructionsContent.textContent = this.instructions.trim();
        } else {
            // Show original content
            cardTitle.textContent = 'Add instructions';
            cardDesc.style.display = 'block';
            cardDesc.textContent = 'Tailor the way ChatGPT responds in this project';
            instructionsPreview.style.display = 'none';
        }
    }

    updateFileCount() {
        // Update any file count displays
        const fileCountElements = document.querySelectorAll('.file-count');
        fileCountElements.forEach(element => {
            element.textContent = this.uploadedFiles.length;
        });
    }

    // User-specific data storage methods
    getUserStorageKey(key) {
        if (!this.currentUser || !this.currentUser.email) {
            return `teamflow_global_${key}`; // Fallback for no user
        }
        return `teamflow_${this.currentUser.email}_${key}`;
    }

    setUserData(key, value) {
        const storageKey = this.getUserStorageKey(key);
        localStorage.setItem(storageKey, typeof value === 'string' ? value : JSON.stringify(value));
        console.log(`Saved user data: ${storageKey}`);
    }

    getUserData(key, defaultValue = null) {
        const storageKey = this.getUserStorageKey(key);
        const data = localStorage.getItem(storageKey);
        if (data === null) return defaultValue;
        
        try {
            return JSON.parse(data);
        } catch (e) {
            return data; // Return as string if not JSON
        }
    }

    clearUserData() {
        if (!this.currentUser || !this.currentUser.email) return;
        
        // Clear all user-specific data
        const userPrefix = `teamflow_${this.currentUser.email}_`;
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(userPrefix)) {
                localStorage.removeItem(key);
            }
        });
        console.log(`Cleared all data for user: ${this.currentUser.email}`);
    }

    // Chat History Management
    createChatSession(initialMessage) {
        const chatId = this.createChatSessionSilent(initialMessage);
        // Update chat history display
        this.updateChatHistoryDisplay();
        return chatId;
    }

    createChatSessionSilent(initialMessage) {
        const chatId = Date.now().toString();
        const title = this.generateChatTitle(initialMessage);
        
        const chatSession = {
            id: chatId,
            title: title,
            messages: [
                {
                    content: initialMessage,
                    role: 'user',
                    timestamp: new Date().toISOString()
                }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Add to current project's chats
        if (this.currentProject) {
            if (!this.currentProject.chats) {
                this.currentProject.chats = [];
            }
            this.currentProject.chats.unshift(chatSession);
            this.saveProjects();
        }
        
        return chatId;
    }

    updateChatSession(chatId, assistantMessage) {
        if (!this.currentProject || !this.currentProject.chats) return;

        const chat = this.currentProject.chats.find(c => c.id === chatId);
        if (chat) {
            chat.messages.push({
                content: assistantMessage,
                role: 'assistant',
                timestamp: new Date().toISOString()
            });
            chat.updatedAt = new Date().toISOString();
            this.saveProjects();
        }
    }

    generateChatTitle(message) {
        // Simple title generation based on first message
        const words = message.trim().split(' ');
        if (words.length <= 6) {
            return message.trim();
        }
        return words.slice(0, 6).join(' ') + '...';
    }

    updateChatHistoryDisplay() {
        const historySection = document.getElementById('chatHistorySection');
        if (!historySection) return;

        // Clear existing history
        historySection.innerHTML = '';

        if (!this.currentProject || !this.currentProject.chats || this.currentProject.chats.length === 0) {
            return; // No chats to display
        }

        // Create history items
        this.currentProject.chats.forEach(chat => {
            const historyItem = this.createChatHistoryItem(chat);
            historySection.appendChild(historyItem);
        });

        // Bind events
        this.bindChatHistoryEvents();
    }

    createChatHistoryItem(chat) {
        const item = document.createElement('div');
        item.className = 'chat-history-item';
        item.setAttribute('data-chat-id', chat.id);

        const preview = chat.messages[0]?.content || '';
        const date = this.formatChatDate(chat.createdAt);

        item.innerHTML = `
            <div class="chat-history-header">
                <div class="chat-history-content">
                    <div class="chat-history-title">${chat.title}</div>
                    <div class="chat-history-preview">${preview}</div>
                </div>
                <div class="chat-history-meta">
                    <div class="chat-history-date">${date}</div>
                    <div class="chat-history-menu">
                        <button class="chat-history-menu-btn" data-chat-id="${chat.id}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="5" cy="12" r="2"/>
                                <circle cx="12" cy="12" r="2"/>
                                <circle cx="19" cy="12" r="2"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        return item;
    }

    formatChatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            return 'Today';
        } else if (diffDays === 2) {
            return 'Yesterday';
        } else if (diffDays <= 7) {
            return `${diffDays - 1} days ago`;
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    }

    bindChatHistoryEvents() {
        // Bind menu button clicks
        const menuBtns = document.querySelectorAll('.chat-history-menu-btn');
        menuBtns.forEach(btn => {
            btn.addEventListener('click', this.handleChatHistoryMenuClick);
        });

        // Bind context menu items
        const contextMenuItems = document.querySelectorAll('.chat-history-context-menu-item');
        contextMenuItems.forEach(item => {
            item.addEventListener('click', this.handleChatHistoryContextMenuClick);
        });

        // Bind chat item clicks (to open chat)
        const historyItems = document.querySelectorAll('.chat-history-item');
        historyItems.forEach(item => {
            item.addEventListener('click', this.handleChatHistoryItemClick);
        });
    }

    handleChatHistoryMenuClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const chatId = e.currentTarget.getAttribute('data-chat-id');
        const rect = e.currentTarget.getBoundingClientRect();
        
        this.showChatHistoryContextMenu(rect.right + 5, rect.top, chatId);
    }

    handleChatHistoryItemClick = (e) => {
        // Don't trigger if clicking on menu button
        if (e.target.closest('.chat-history-menu-btn')) return;
        
        const chatId = e.currentTarget.getAttribute('data-chat-id');
        this.openChat(chatId);
    }

    showChatHistoryContextMenu(x, y, chatId) {
        this.currentContextChatId = chatId;
        
        const contextMenu = document.getElementById('chatHistoryContextMenu');
        if (!contextMenu) return;

        // Position and show the context menu
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        contextMenu.style.display = 'block';
        
        // Adjust position if menu goes off screen
        const rect = contextMenu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        if (rect.right > viewportWidth) {
            contextMenu.style.left = `${x - rect.width - 10}px`;
        }
        
        if (rect.bottom > viewportHeight) {
            contextMenu.style.top = `${y - rect.height}px`;
        }
    }

    hideChatHistoryContextMenu() {
        const contextMenu = document.getElementById('chatHistoryContextMenu');
        if (contextMenu) {
            contextMenu.style.display = 'none';
        }
        this.currentContextChatId = null;
    }

    handleChatHistoryContextMenuClick = (e) => {
        e.preventDefault();
        const action = e.currentTarget.getAttribute('data-action');
        const chatId = this.currentContextChatId;
        
        this.hideChatHistoryContextMenu();
        
        if (action === 'rename') {
            this.renameChatHistory(chatId);
        } else if (action === 'delete') {
            this.deleteChatHistory(chatId);
        } else if (action === 'share') {
            this.shareChatHistory(chatId);
        }
    }

    renameChatHistory(chatId) {
        if (!this.currentProject || !this.currentProject.chats) return;

        const chat = this.currentProject.chats.find(c => c.id === chatId);
        if (!chat) return;

        const newTitle = prompt('Rename chat to:', chat.title);
        if (newTitle && newTitle.trim() && newTitle.trim() !== chat.title) {
            chat.title = newTitle.trim();
            this.saveProjects();
            this.updateChatHistoryDisplay();
            this.showTemporaryMessage(`Chat renamed to "${newTitle.trim()}"`);
        }
    }

    deleteChatHistory(chatId) {
        if (!this.currentProject || !this.currentProject.chats) return;

        const chat = this.currentProject.chats.find(c => c.id === chatId);
        if (!chat) return;

        if (confirm(`Are you sure you want to delete "${chat.title}"? This action cannot be undone.`)) {
            const index = this.currentProject.chats.findIndex(c => c.id === chatId);
            if (index !== -1) {
                this.currentProject.chats.splice(index, 1);
                this.saveProjects();
                this.updateChatHistoryDisplay();
                this.showTemporaryMessage('Chat deleted');
            }
        }
    }

    shareChatHistory(chatId) {
        if (!this.currentProject || !this.currentProject.chats) return;

        const chat = this.currentProject.chats.find(c => c.id === chatId);
        if (!chat) return;

        // Simple share functionality - copy to clipboard
        const shareText = `${chat.title}\n\n${chat.messages.map(m => `${m.role}: ${m.content}`).join('\n\n')}`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareText).then(() => {
                this.showTemporaryMessage('Chat copied to clipboard');
            }).catch(() => {
                this.showTemporaryMessage('Failed to copy chat');
            });
        } else {
            this.showTemporaryMessage('Share functionality not available');
        }
    }

    openChat(chatId) {
        if (!this.currentProject || !this.currentProject.chats) return;
        
        // Find the chat session
        const chat = this.currentProject.chats.find(c => c.id === chatId);
        if (!chat) {
            this.showTemporaryMessage('Chat not found');
            return;
        }
        
        // Set this as the current active chat
        this.currentActiveChatId = chatId;
        
        // Get or create chat container
        const chatContainer = this.getChatContainer();
        const messagesContainer = chatContainer.querySelector('.chat-messages');
        
        // Clear existing messages
        messagesContainer.innerHTML = '';
        
        // Load all messages from the chat session
        chat.messages.forEach(message => {
            this.addMessageToContainer(messagesContainer, message.content, message.role, message.timestamp);
        });
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        this.showTemporaryMessage(`Opened chat: ${chat.title}`);
    }

    addMessageToContainer(messagesContainer, text, sender, timestamp = null) {
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${sender}`;
        
        const messageTime = timestamp ? 
            new Date(timestamp).toLocaleTimeString('zh-CN', { 
                hour: '2-digit', 
                minute: '2-digit' 
            }) : 
            new Date().toLocaleTimeString('zh-CN', { 
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
                                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                                </svg>
                            </button>
                            <button class="action-btn share-btn" title="分享">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                                </svg>
                            </button>
                        </div>
                        <div class="message-time">${messageTime}</div>
                    </div>
                </div>
            `;
        } else {
            messageElement.innerHTML = `
                <div class="message-content">
                    <div class="message-text">${text}</div>
                    <div class="message-time">${messageTime}</div>
                </div>
            `;
        }
        
        messagesContainer.appendChild(messageElement);
        
        // Add event listeners for action buttons if this is an assistant message
        if (sender === 'assistant') {
            this.bindMessageActions(messageElement, text);
        }
    }

    bindMessageActions(messageElement, messageText) {
        this.setupMessageActions(messageElement, messageText);
    }

    addMessageToChatSession(chatId, message, role) {
        if (!this.currentProject || !this.currentProject.chats) return;
        
        const chat = this.currentProject.chats.find(c => c.id === chatId);
        if (chat) {
            chat.messages.push({
                content: message,
                role: role,
                timestamp: new Date().toISOString()
            });
            chat.updatedAt = new Date().toISOString();
            this.saveProjects();
        }
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
        border-color: #404040;
        box-shadow: none;
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
