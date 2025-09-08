// AI模型問答系統 - 統一配置檔案
// 請在此處填入您的實際 API 金鑰

// API 金鑰配置 - 請在此處填入您的實際 API 金鑰
const API_KEYS = {
    openai: 'YOUR_openai_KEY',
    claude: 'YOUR_CLAUDE_API_KEY',
    gemini: 'YOUR_GEMINI_API_KEY',
    deepseek: 'YOUR_deepseek_API_KEY'
};

// 將 API_KEYS 設定為全域變數，供 script.js 使用
window.API_KEYS = API_KEYS;

// 聊天設定
const chatConfig = {
    // 最大對話輪數
    maxConversationTurns: 50,

    // 自動儲存間隔 (分鐘)
    autoSaveInterval: 5,

    // 支援的語言
    supportedLanguages: ['zh-TW', 'en-US', 'ja-JP'],

    // 預設提示詞
    defaultPrompts: {
        system: '你是一個有用的AI助手，請用友善和專業的態度回答問題。',
        user: '請簡潔地回答我的問題。',
        assistant: '我會盡力幫助您解決問題。'
    }
};

// 模型配置範例
const customModelConfigs = {
    // OpenAI GPT 配置
    openai: {
        endpoint: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-4', // 或 'gpt-3.5-turbo'
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEYS.openai}`
        },
        // 自定義參數
        parameters: {
            max_tokens: 5000,
            temperature: 0.5,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        }
    },

    // Claude 配置
    claude: {
        endpoint: 'https://api.anthropic.com/v1/messages',
        model: 'claude-3-opus-20240229', // 或 'claude-3-sonnet-20240229'
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEYS.claude,
            'anthropic-version': '2023-06-01'
        },
        parameters: {
            max_tokens: 2000,
            temperature: 0.7
        }
    },

    // Gemini 配置
    gemini: {
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        model: 'gemini-pro',
        headers: {
            'Content-Type': 'application/json'
        },
        // Gemini API 金鑰作為查詢參數使用
        apiKey: API_KEYS.gemini,
        parameters: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2000
        }
    },

    // DeepSeek 配置
    deepseek: {
        endpoint: 'https://api.deepseek.com/v1/chat/completions',
        model: 'deepseek-chat', // 或 'deepseek-reasoner'
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEYS.deepseek}`
        },
        parameters: {
            max_tokens: 5000,
            temperature: 0.7,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        }
    },

    // 自定義模型配置
    custom: {
        endpoint: 'https://your-custom-api.com/chat',
        model: 'your-model-name',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_API_KEY',
            'X-Custom-Header': 'custom-value'
        },
        parameters: {
            max_tokens: 1000,
            temperature: 0.5
        }
    }
};


// 匯出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        API_KEYS,
        customModelConfigs,
        chatConfig
    };
}
