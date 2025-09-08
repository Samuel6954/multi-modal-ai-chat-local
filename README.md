# AI模型問答系統

一個功能完整的AI模型問答介面，支援四種主流AI模型API，提供完整的AI對話體驗和檔案分析功能。

## 🚀 功能特色

- **四模型支援**: 支援OpenAI GPT、DeepSeek、Gemini、Claude等主流AI模型
- **檔案上傳分析**: 支援圖片、PDF、Word、Excel等多種格式檔案上傳和分析
- **多模型比較**: 同時向多個AI模型發問，便於比較不同答案
- **ChatGPT風格介面**: 仿照ChatGPT網頁版的現代化設計
- **Markdown渲染**: 支援完整的Markdown語法，包含程式碼高亮
- **智能對話**: 即時AI問答，支援多輪對話
- **統一配置**: 所有API Key統一在config.js中管理
- **響應式設計**: 支援桌面、平板、手機等各種設備
- **錯誤處理**: 完善的錯誤處理和使用者提示

## 📁 檔案結構

```
AiModel/
├── index.html          # 主要HTML頁面
├── styles.css          # CSS樣式檔案（ChatGPT風格）
├── script.js           # JavaScript功能邏輯（Markdown渲染）
├── config.js           # 統一配置檔案（包含所有API Key）
├── API_KEY_SETUP.md    # API Key配置說明
├── 操作手冊.html        # 完整操作手冊
└── README.md           # 說明文件
```

## 🛠️ 安裝與使用

### 1. 基本使用
1. 下載所有檔案到同一個資料夾
2. 編輯 `config.js` 檔案，填入您的API金鑰
3. 用瀏覽器開啟 `index.html`
4. 選擇您要使用的AI模型（預設選擇OpenAI GPT）
5. 輸入問題或上傳檔案進行分析
6. 開始與AI對話！

### 2. API Key配置

所有API Key統一在 `config.js` 檔案中管理：

```javascript
const API_KEYS = {
    openai: '您的OpenAI_API_Key',
    deepseek: '您的DeepSeek_API_Key',
    gemini: '您的Gemini_API_Key',
    claude: '您的Claude_API_Key'
};
```

#### 各模型API Key獲取方式

| 模型 | 獲取地址 | 說明 |
|------|----------|------|
| **OpenAI GPT** | [OpenAI Platform](https://platform.openai.com/api-keys) | 支援GPT-4、GPT-3.5等模型 |
| **DeepSeek** | [DeepSeek Platform](https://platform.deepseek.com/) | 支援Chat和Reasoner模型 |
| **Gemini** | [Google AI Studio](https://makersuite.google.com/app/apikey) | 支援Gemini Pro等模型 |
| **Claude** | [Anthropic Console](https://console.anthropic.com/) | 支援Claude 3系列模型 |



## 💡 使用說明

### 基本操作
1. **選擇模型**: 勾選要使用的AI模型（可同時選擇多個）
2. **輸入問題**: 在聊天輸入框中輸入您的問題
3. **上傳檔案**: （可選）上傳圖片、PDF、Word等檔案進行分析
4. **發送訊息**: 點擊發送按鈕或按Enter鍵
5. **查看回答**: 在不同頁籤中查看各AI模型的回答
6. **比較分析**: 切換頁籤比較不同模型的回答差異

### 檔案上傳功能
- **支援格式**: 圖片、PDF、Word、Excel、音頻、視頻等
- **檔案限制**: 單個檔案最大50MB，最多10個檔案
- **上傳方式**: 點擊選擇檔案或直接拖拽到上傳區域
- **自動分析**: AI會自動讀取檔案內容並進行分析

### 快捷鍵
- `Enter`: 發送訊息
- `Shift + Enter`: 換行

### 聊天管理
- **清除對話**: 點擊「清除對話」按鈕清空所有聊天記錄
- **多模型對話**: 每個模型保持獨立的對話歷史

## 🔧 自定義設定

### Markdown支援
系統支援完整的Markdown語法：
- **標題**: # ## ### 等
- **文字格式**: **粗體** *斜體* `程式碼`
- **程式碼區塊**: ```javascript ```python 等
- **列表**: - 項目1 - 項目2
- **表格**: | 欄位1 | 欄位2 |
- **引用**: > 引用文字
- **連結**: [文字](URL)

### 修改模型配置
在 `config.js` 中的 `customModelConfigs` 物件可以修改預設的模型設定：

```javascript
const customModelConfigs = {
    openai: {
        endpoint: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-4',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEYS.openai}`
        },
        parameters: {
            max_tokens: 5000,
            temperature: 0.5
        }
    }
    // 其他模型配置...
};
```



## 🚨 注意事項

1. **API金鑰安全**: 請妥善保管您的API金鑰，不要分享給他人，建議將 `config.js` 加入 `.gitignore`
2. **使用限制**: 請注意各AI服務的使用限制和計費標準
3. **檔案上傳**: 檔案會上傳到AI服務進行分析，請注意隱私安全
4. **網路連線**: 確保網路連線穩定，以獲得最佳體驗
5. **瀏覽器支援**: 建議使用Chrome、Firefox、Safari等現代瀏覽器
6. **檔案大小**: 單個檔案限制50MB，避免上傳過大檔案

## 🐛 故障排除

### 常見問題

**Q: API調用失敗怎麼辦？**
A: 檢查API金鑰是否正確、網路連線是否正常、API端點是否正確



**Q: 頁面無法正常顯示？**
A: 確保所有檔案都在同一個資料夾中，並用現代瀏覽器開啟

**Q: 聊天記錄消失？**
A: 聊天記錄只儲存在瀏覽器記憶體中，重新整理頁面會清空記錄

### 錯誤代碼
- `401 Unauthorized`: API金鑰錯誤或過期
- `403 Forbidden`: 權限不足
- `429 Too Many Requests`: 請求頻率過高
- `500 Internal Server Error`: 伺服器錯誤

## 📱 響應式設計

系統支援各種螢幕尺寸：
- **桌面**: 完整功能，最佳體驗
- **平板**: 自適應佈局，觸控友善
- **手機**: 垂直佈局，行動優化

## 🔄 更新日誌

### v3.0.0 (2024年12月)
- 新增DeepSeek模型支援
- 新增檔案上傳分析功能
- 統一API Key配置管理
- 優化模型順序：OpenAI → DeepSeek → Gemini → Claude
- 新增API_KEY_SETUP.md配置說明
- 更新操作手冊

### v2.0.0
- 多模型比較功能
- Markdown渲染支援
- 響應式設計

### v1.0.0
- 初始版本發布
- 支援OpenAI、Claude、Gemini

## 📄 授權

本專案採用MIT授權，詳見LICENSE檔案。

## 🤝 貢獻

歡迎提交Issue和Pull Request來改善這個專案！

## 📞 支援

如果您遇到問題或有建議，請：
1. 檢查本README的故障排除部分
2. 在GitHub上提交Issue
3. 聯繫開發者

---

**享受與AI的智能對話！** 🚀
