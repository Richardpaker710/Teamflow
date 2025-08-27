const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 提供静态文件
app.use(express.static(path.join(__dirname)));

// 简单的消息回复逻辑
const generateResponse = (message) => {
    const responses = {
        // 问候语
        'hello': '你好！我是 ChatGPT，很高兴为您服务！有什么我可以帮助您的吗？',
        'hi': '嗨！很高兴见到您！有什么问题想要咨询吗？',
        '你好': '您好！我是 AI 助手，请问有什么可以帮助您的？',
        '早上好': '早上好！希望您今天过得愉快！',
        '晚上好': '晚上好！今天过得怎么样？',
        
        // 常见问题
        '你是谁': '我是 ChatGPT，一个 AI 语言模型，旨在帮助用户回答问题和提供有用的信息。',
        '你能做什么': '我可以回答问题、协助写作、解释概念、提供建议，以及进行各种对话。请告诉我您需要什么帮助！',
        '谢谢': '不客气！很高兴能够帮助您。还有其他问题吗？',
        'thank you': 'You\'re welcome! I\'m here to help whenever you need assistance.',
        
        // 技术相关
        'javascript': 'JavaScript 是一种强大的编程语言，主要用于网页开发。您想了解 JavaScript 的什么方面？',
        'python': 'Python 是一种简洁易学的编程语言，广泛用于数据科学、Web 开发和自动化。',
        'react': 'React 是一个用于构建用户界面的 JavaScript 库，特别适合构建现代 Web 应用程序。',
        'node': 'Node.js 让您可以在服务器端运行 JavaScript，是构建现代 Web 应用后端的热门选择。',
        
        // 生活相关
        '天气': '我无法获取实时天气信息，建议您查看当地天气预报应用或网站。',
        '时间': `当前服务器时间是：${new Date().toLocaleString('zh-CN')}`,
        '今天': '今天是美好的一天！有什么特别想要了解或讨论的吗？',
        
        // 情感支持
        '累了': '听起来您有些疲惫。记得适当休息，保持身心健康很重要。',
        '开心': '很高兴听到您心情不错！保持积极的心态对生活很有帮助。',
        '难过': '我理解您的感受。每个人都会有低落的时候，这是很正常的。如果需要聊聊，我在这里。'
    };

    // 转换为小写进行匹配
    const lowerMessage = message.toLowerCase().trim();
    
    // 直接匹配
    if (responses[lowerMessage]) {
        return responses[lowerMessage];
    }
    
    // 包含匹配
    for (const [key, response] of Object.entries(responses)) {
        if (lowerMessage.includes(key)) {
            return response;
        }
    }
    
    // 如果没有匹配的预设回复，生成通用回复
    const genericResponses = [
        '这是一个很有趣的问题！让我想想如何最好地回答您。',
        '感谢您的提问。基于您说的内容，我认为这个话题很值得深入讨论。',
        '您提到的这个点很重要。能否提供更多详细信息，让我更好地帮助您？',
        '这确实是个值得思考的问题。您希望我从哪个角度来分析呢？',
        '我理解您的观点。关于这个话题，还有什么特别想了解的方面吗？',
        '您的想法很有见地！我很乐意继续这个对话。'
    ];
    
    return genericResponses[Math.floor(Math.random() * genericResponses.length)] + 
           `\n\n您刚才说的是："${message}"`;
};

// API 路由
app.post('/api/chat', (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message || message.trim() === '') {
            return res.status(400).json({
                success: false,
                error: '消息不能为空'
            });
        }
        
        // 模拟处理时间
        setTimeout(() => {
            const response = generateResponse(message);
            
            res.json({
                success: true,
                data: {
                    message: response,
                    timestamp: new Date().toISOString(),
                    user_message: message
                }
            });
        }, Math.random() * 1000 + 500); // 0.5-1.5秒随机延迟
        
    } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({
            success: false,
            error: '服务器内部错误'
        });
    }
});

// 获取聊天历史 (可扩展功能)
app.get('/api/chat/history', (req, res) => {
    res.json({
        success: true,
        data: {
            messages: [],
            total: 0
        }
    });
});

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// 根路径
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    console.log(`📱 前端页面: http://localhost:${PORT}`);
    console.log(`🔗 API 健康检查: http://localhost:${PORT}/api/health`);
    console.log('');
    console.log('💡 提示：使用 npm run dev 来启动开发模式（需要安装 nodemon）');
});
