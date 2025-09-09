// 全域變數
let currentTab = 'openai'; // 當前選中的頁籤
let uploadedFiles = []; // 上傳的檔案列表

// 各模型的對話歷史記錄
let conversationHistory = {
    openai: [],
    deepseek: [],
    gemini: [],
    claude: []
};

// DOM元素引用
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const statusMessage = document.getElementById('statusMessage');

// 檔案上傳相關元素
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const clearFilesBtn = document.getElementById('clearFilesBtn');
const fileCount = document.querySelector('.file-count');

// 頁籤相關元素
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

// 模型選擇器
const openaiModelSelect = document.getElementById('openaiModel');
const claudeModelSelect = document.getElementById('claudeModel');
const geminiModelSelect = document.getElementById('geminiModel');
const deepseekModelSelect = document.getElementById('deepseekModel');

// 模型勾選框
const openaiCheckbox = document.getElementById('openaiCheckbox');
const claudeCheckbox = document.getElementById('claudeCheckbox');
const geminiCheckbox = document.getElementById('geminiCheckbox');
const deepseekCheckbox = document.getElementById('deepseekCheckbox');

// 聊天訊息容器
const openaiMessages = document.getElementById('openaiMessages');
const claudeMessages = document.getElementById('claudeMessages');
const geminiMessages = document.getElementById('geminiMessages');
const deepseekMessages = document.getElementById('deepseekMessages');

// API金鑰配置 - 直接使用 config.js 中的 window.API_KEYS

// 模型配置
const modelConfigs = {
    openai: {
        endpoint: 'https://api.openai.com/v1/chat/completions',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${window.API_KEYS.openai}`
        }
    },
    claude: {
        endpoint: 'https://api.anthropic.com/v1/messages',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': window.API_KEYS.claude,
            'anthropic-version': '2023-06-01'
        }
    },
    gemini: {
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
        headers: {
            'Content-Type': 'application/json'
        }
    },
    deepseek: {
        endpoint: 'https://api.deepseek.com/v1/chat/completions',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${window.API_KEYS.deepseek}`
        }
    }
};

// 初始化
document.addEventListener('DOMContentLoaded', function () {
    initializeEventListeners();

    initializeMarked();
    initializeTabs();

    // 初始化發送按鈕文字
    updateSendButtonText();

    // 預設選擇OpenAI GPT頁籤
    setTimeout(() => {
        switchTab('openai');
    }, 100);
});

// 初始化Marked.js設定
function initializeMarked() {
    marked.setOptions({
        highlight: function (code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(code, { language: lang }).value;
                } catch (err) { }
            }
            return hljs.highlightAuto(code).value;
        },
        breaks: true,
        gfm: true
    });
}

// 初始化頁籤功能
function initializeTabs() {
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            switchTab(tabName);
        });
    });
}

// 切換頁籤
function switchTab(tabName) {
    // 移除所有頁籤的active狀態
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabPanes.forEach(pane => pane.classList.remove('active'));

    // 激活選中的頁籤
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');

    currentTab = tabName;



    showStatus(`已切換到 ${getTabDisplayName(tabName)} 頁籤`, 'success');
}

// 獲取頁籤顯示名稱
function getTabDisplayName(tabName) {
    const names = {
        'openai': 'OpenAI GPT',
        'deepseek': 'DeepSeek',
        'gemini': 'Gemini',
        'claude': 'Claude'
    };
    return names[tabName] || tabName;
}



// 更新發送按鈕文字
function updateSendButtonText() {
    const selectedModels = getSelectedModels();
    if (selectedModels.length === 0) {
        sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 請選擇至少一個模型';
        sendBtn.disabled = true;
        sendBtn.classList.add('btn-disabled');
    } else if (selectedModels.length === 4) {
        sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 發送給所有模型';
        sendBtn.disabled = false;
        sendBtn.classList.remove('btn-disabled');
    } else {
        const modelNames = selectedModels.map(model => getTabDisplayName(model));
        sendBtn.innerHTML = `<i class="fas fa-paper-plane"></i> 發送給 ${modelNames.join('、')}`;
        sendBtn.disabled = false;
        sendBtn.classList.remove('btn-disabled');
    }
}

// 獲取選中的模型
function getSelectedModels() {
    const selected = [];
    if (openaiCheckbox.checked) selected.push('openai');
    if (deepseekCheckbox.checked) selected.push('deepseek');
    if (geminiCheckbox.checked) selected.push('gemini');
    if (claudeCheckbox.checked) selected.push('claude');
    return selected;
}

// 添加訊息到對話歷史
function addToConversationHistory(model, role, content) {
    if (!conversationHistory[model]) {
        conversationHistory[model] = [];
    }
    conversationHistory[model].push({ role, content });

    // 限制歷史記錄長度，避免API請求過大
    if (conversationHistory[model].length > 20) {
        conversationHistory[model] = conversationHistory[model].slice(-20);
    }
}

// 獲取模型的對話歷史
function getConversationHistory(model) {
    return conversationHistory[model] || [];
}

// 清除特定模型的對話歷史
function clearModelHistory(model) {
    if (conversationHistory[model]) {
        conversationHistory[model] = [];
    }
}

// 清除所有模型的對話歷史
function clearAllConversationHistory() {
    Object.keys(conversationHistory).forEach(model => {
        conversationHistory[model] = [];
    });
}

// 事件監聽器
function initializeEventListeners() {
    // 發送按鈕
    sendBtn.addEventListener('click', sendMessageToAllModels);

    // 清除按鈕
    clearBtn.addEventListener('click', clearAllChats);



    // 檔案上傳相關事件
    fileInput.addEventListener('change', handleFileUpload);
    clearFilesBtn.addEventListener('click', clearAllFiles);

    // 拖拽上傳功能
    initializeDragAndDrop();

    // 剪貼簿貼上功能
    initializePasteHandler();

    // Enter鍵發送
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessageToAllModels();
        }
    });

    // 模型選擇器變更事件
    openaiModelSelect.addEventListener('change', () => {
        showStatus(`已選擇OpenAI模型: ${openaiModelSelect.value}`, 'success');
    });

    claudeModelSelect.addEventListener('change', () => {
        showStatus(`已選擇Claude模型: ${claudeModelSelect.value}`, 'success');
    });

    geminiModelSelect.addEventListener('change', () => {
        showStatus(`已選擇Gemini模型: ${geminiModelSelect.value}`, 'success');
    });

    deepseekModelSelect.addEventListener('change', () => {
        showStatus(`已選擇DeepSeek模型: ${deepseekModelSelect.value}`, 'success');
    });

    // 模型勾選框變更事件
    openaiCheckbox.addEventListener('change', updateSendButtonText);
    claudeCheckbox.addEventListener('change', updateSendButtonText);
    geminiCheckbox.addEventListener('change', updateSendButtonText);
    deepseekCheckbox.addEventListener('change', updateSendButtonText);
}

// 處理檔案上傳
function handleFileUpload(event) {
    const files = Array.from(event.target.files);

    // 檢查檔案大小限制 (50MB)
    const maxSize = 50 * 1024 * 1024;
    const validFiles = files.filter(file => {
        if (file.size > maxSize) {
            showStatus(`檔案 ${file.name} 超過50MB限制`, 'error');
            return false;
        }

        // 檢查檔案類型
        const allowedTypes = [
            'text/plain', 'text/csv', 'text/html', 'text/css', 'text/javascript',
            'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/avi', 'video/mov',
            'audio/mpeg', 'audio/wav', 'audio/ogg'
        ];

        if (!allowedTypes.includes(file.type) && !file.type.startsWith('image/')) {
            showStatus(`不支援的檔案類型: ${file.name} (${file.type})`, 'error');
            return false;
        }

        return true;
    });

    if (validFiles.length === 0) return;

    // 檢查是否超過檔案數量限制 (10個)
    if (uploadedFiles.length + validFiles.length > 10) {
        showStatus('最多只能上傳10個檔案', 'error');
        return;
    }

    // 添加檔案到列表並讀取內容
    validFiles.forEach((file, index) => {
        const fileInfo = {
            id: Date.now() + Math.random(),
            file: file,
            name: file.name,
            size: file.size,
            type: file.type,
            preview: null,
            content: null
        };

        // 顯示上傳進度
        showStatus(`正在處理檔案 ${index + 1}/${validFiles.length}: ${file.name}`, 'info');
        updateUploadProgress((index + 1) / validFiles.length * 100);

        // 讀取檔案內容
        readFileContent(fileInfo).then(() => {
            updateFileList();
            // 完成後隱藏進度條
            if (index === validFiles.length - 1) {
                hideUploadProgress();
            }
        });

        uploadedFiles.push(fileInfo);
    });

    updateFileCount();
    showFileList();
    showStatus(`成功上傳 ${validFiles.length} 個檔案`, 'success');

    // 清空input值，允許重複上傳相同檔案
    event.target.value = '';
}

// 讀取檔案內容
async function readFileContent(fileInfo) {
    try {
        if (fileInfo.type.startsWith('text/') ||
            fileInfo.type.includes('csv') ||
            fileInfo.type.includes('javascript') ||
            fileInfo.type.includes('css') ||
            fileInfo.type.includes('html')) {
            // 讀取文字檔案內容
            const text = await readTextFile(fileInfo.file);
            fileInfo.content = text;
        } else if (fileInfo.type.startsWith('image/')) {
            // 創建圖片預覽和base64數據
            const reader = new FileReader();
            reader.onload = (e) => {
                fileInfo.preview = e.target.result;
                // 儲存base64數據供AI模型使用
                fileInfo.base64Data = e.target.result;
                // 為圖片添加詳細描述
                fileInfo.content = `[圖片檔案: ${fileInfo.name}]\n檔案類型: ${fileInfo.type}\n檔案大小: ${formatFileSize(fileInfo.size)}\n這是一個圖片檔案，請根據圖片內容進行分析。`;
            };
            reader.readAsDataURL(fileInfo.file);
        } else if (fileInfo.type.includes('pdf')) {
            // 嘗試讀取PDF內容
            try {
                const pdfText = await extractPDFText(fileInfo.file);
                fileInfo.content = `[PDF文檔: ${fileInfo.name}]\n檔案類型: ${fileInfo.type}\n檔案大小: ${formatFileSize(fileInfo.size)}\n\n文檔內容:\n${pdfText}`;
            } catch (error) {
                fileInfo.content = `[PDF文檔: ${fileInfo.name}]\n檔案類型: ${fileInfo.type}\n檔案大小: ${formatFileSize(fileInfo.size)}\n\n注意: 無法直接讀取PDF內容，請手動複製文檔中的文字內容進行分析。`;
            }
        } else if (fileInfo.type.includes('word') || fileInfo.type.includes('document')) {
            // 嘗試讀取Word文檔內容
            try {
                const wordText = await extractWordText(fileInfo.file);
                fileInfo.content = `[Word文檔: ${fileInfo.name}]\n檔案類型: ${fileInfo.type}\n檔案大小: ${formatFileSize(fileInfo.size)}\n\n文檔內容:\n${wordText}`;
            } catch (error) {
                fileInfo.content = `[Word文檔: ${fileInfo.name}]\n檔案類型: ${fileInfo.type}\n檔案大小: ${formatFileSize(fileInfo.size)}\n\n注意: 無法直接讀取Word文檔內容，請手動複製文檔中的文字內容進行分析。`;
            }
        } else if (fileInfo.type.includes('excel') || fileInfo.type.includes('spreadsheet')) {
            // 嘗試讀取Excel表格內容
            try {
                const excelText = await extractExcelText(fileInfo.file);
                fileInfo.content = `[Excel表格: ${fileInfo.name}]\n檔案類型: ${fileInfo.type}\n檔案大小: ${formatFileSize(fileInfo.size)}\n\n表格內容:\n${excelText}`;
            } catch (error) {
                fileInfo.content = `[Excel表格: ${fileInfo.name}]\n檔案類型: ${fileInfo.type}\n檔案大小: ${formatFileSize(fileInfo.size)}\n\n注意: 無法直接讀取Excel表格內容，請手動複製表格中的數據進行分析。`;
            }
        } else if (fileInfo.type.startsWith('video/') || fileInfo.type.startsWith('audio/')) {
            // 對於音頻視頻檔案，添加檔案描述
            fileInfo.content = `[${fileInfo.type.startsWith('video/') ? '視頻' : '音頻'}檔案: ${fileInfo.name}]\n檔案類型: ${fileInfo.type}\n檔案大小: ${formatFileSize(fileInfo.size)}\n這是一個${fileInfo.type.startsWith('video/') ? '視頻' : '音頻'}檔案，請根據媒體內容進行分析。`;
        } else {
            fileInfo.content = `[檔案: ${fileInfo.name}]\n檔案類型: ${fileInfo.type}\n檔案大小: ${formatFileSize(fileInfo.size)}`;
        }
    } catch (error) {
        console.error('讀取檔案內容錯誤:', error);
        fileInfo.content = `[檔案讀取失敗: ${fileInfo.name}]\n錯誤信息: ${error.message}`;
    }
}

// 讀取文字檔案
function readTextFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
}

// 獲取檔案類型描述
function getFileTypeDescription(mimeType) {
    if (mimeType.includes('pdf')) return 'PDF文檔';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'Word文檔';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'Excel表格';
    return '文檔';
}

// 更新檔案列表顯示
function updateFileList() {
    fileList.innerHTML = '';

    uploadedFiles.forEach(fileInfo => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.dataset.fileId = fileInfo.id;

        let previewContent = '';
        if (fileInfo.preview) {
            previewContent = `<div class="file-preview"><img src="${fileInfo.preview}" alt="${fileInfo.name}"></div>`;
        } else {
            const iconClass = getFileIconClass(fileInfo.type);
            previewContent = `<div class="file-preview"><i class="${iconClass}"></i></div>`;
        }

        // 添加檔案內容預覽
        let contentPreview = '';
        if (fileInfo.content && fileInfo.type.startsWith('text/')) {
            const truncatedContent = fileInfo.content.length > 100
                ? fileInfo.content.substring(0, 100) + '...'
                : fileInfo.content;
            contentPreview = `<div class="file-content-preview">${truncatedContent}</div>`;
        }

        fileItem.innerHTML = `
            ${previewContent}
            <div class="file-info">
                <div class="file-name">${fileInfo.name}</div>
                <div class="file-size">${formatFileSize(fileInfo.size)}</div>
                ${contentPreview}
            </div>
            <button class="remove-file-btn" onclick="removeFile(${fileInfo.id})">
                <i class="fas fa-times"></i>
            </button>
        `;

        fileList.appendChild(fileItem);
    });
}

// 獲取檔案圖標類別
function getFileIconClass(mimeType) {
    if (mimeType.startsWith('image/')) return 'fas fa-image';
    if (mimeType.startsWith('video/')) return 'fas fa-video';
    if (mimeType.startsWith('audio/')) return 'fas fa-music';
    if (mimeType.includes('pdf')) return 'fas fa-file-pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'fas fa-file-word';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'fas fa-file-excel';
    if (mimeType.includes('text/')) return 'fas fa-file-alt';
    return 'fas fa-file';
}

// 格式化檔案大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 移除單個檔案
function removeFile(fileId) {
    uploadedFiles = uploadedFiles.filter(file => file.id !== fileId);
    updateFileCount();
    updateFileList();

    if (uploadedFiles.length === 0) {
        hideFileList();
    }

    showStatus('檔案已移除', 'success');
}

// 清除所有檔案
function clearAllFiles() {
    uploadedFiles = [];
    updateFileCount();
    updateFileList();
    hideFileList();
    fileInput.value = '';
    showStatus('已清除所有檔案', 'success');
}

// 更新檔案計數
function updateFileCount() {
    fileCount.textContent = `${uploadedFiles.length} 個檔案`;
}

// 顯示檔案列表
function showFileList() {
    fileList.style.display = 'block';
    clearFilesBtn.style.display = 'inline-block';
}

// 隱藏檔案列表
function hideFileList() {
    fileList.style.display = 'none';
    clearFilesBtn.style.display = 'none';
}

// 初始化拖拽上傳功能
function initializeDragAndDrop() {
    const fileUploadArea = document.querySelector('.file-upload-area');

    // 防止瀏覽器預設的拖拽行為
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileUploadArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // 拖拽進入區域
    ['dragenter', 'dragover'].forEach(eventName => {
        fileUploadArea.addEventListener(eventName, highlight, false);
    });

    // 拖拽離開區域
    ['dragleave', 'drop'].forEach(eventName => {
        fileUploadArea.addEventListener(eventName, unhighlight, false);
    });

    // 檔案拖拽放下
    fileUploadArea.addEventListener('drop', handleDrop, false);
}

// 初始化剪貼簿貼上功能
function initializePasteHandler() {
    // 監聽全域的貼上事件
    document.addEventListener('paste', handlePaste);

    const fileUploadArea = document.querySelector('.file-upload-area');

    // 當用戶點擊檔案上傳區域時，確保焦點在該區域
    fileUploadArea.addEventListener('click', () => {
        fileUploadArea.focus();
    });

    // 讓檔案上傳區域可以接收鍵盤事件
    fileUploadArea.setAttribute('tabindex', '0');
}

// 防止預設行為
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// 高亮拖拽區域
function highlight(e) {
    document.querySelector('.file-upload-area').classList.add('drag-over');
}

// 取消高亮
function unhighlight(e) {
    document.querySelector('.file-upload-area').classList.remove('drag-over');
}

// 處理拖拽放下
function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length > 0) {
        // 創建一個模擬的change事件
        const event = new Event('change', { bubbles: true });
        fileInput.files = files;
        fileInput.dispatchEvent(event);
    }
}

// 處理剪貼簿貼上
function handlePaste(e) {
    const clipboardData = e.clipboardData || window.clipboardData;
    const items = clipboardData.items;

    // 檢查是否有圖片數據
    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        // 檢查是否為圖片類型
        if (item.type.indexOf('image') !== -1) {
            e.preventDefault();

            const file = item.getAsFile();
            if (file) {
                // 檢查檔案大小限制
                const maxSize = 50 * 1024 * 1024; // 50MB
                if (file.size > maxSize) {
                    showStatus('貼上的圖片超過50MB限制', 'error');
                    return;
                }

                // 檢查檔案數量限制
                if (uploadedFiles.length >= 10) {
                    showStatus('最多只能上傳10個檔案', 'error');
                    return;
                }

                // 為圖片檔案添加時間戳，確保檔案名稱唯一
                const timestamp = Date.now();
                const fileExtension = file.type.split('/')[1] || 'png';
                const fileName = `screenshot_${timestamp}.${fileExtension}`;

                // 創建一個新的File對象，使用自定義名稱
                const customFile = new File([file], fileName, { type: file.type });

                // 創建一個FileList來模擬文件輸入
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(customFile);

                // 創建一個模擬的change事件
                const event = new Event('change', { bubbles: true });
                fileInput.files = dataTransfer.files;
                fileInput.dispatchEvent(event);

                showStatus(`已貼上螢幕截圖: ${fileName}`, 'success');
            }
            break;
        }
    }
}

// 更新上傳進度
function updateUploadProgress(percentage) {
    const progressBar = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    const uploadProgress = document.getElementById('uploadProgress');

    if (progressBar && progressText && uploadProgress) {
        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `處理中... ${Math.round(percentage)}%`;
        uploadProgress.style.display = 'block';
    }
}

// 隱藏上傳進度
function hideUploadProgress() {
    const uploadProgress = document.getElementById('uploadProgress');
    if (uploadProgress) {
        uploadProgress.style.display = 'none';
    }
}

// 提取PDF文字內容
async function extractPDFText(file) {
    return new Promise((resolve, reject) => {
        // 使用PDF.js來讀取PDF內容
        if (typeof pdfjsLib === 'undefined') {
            // 如果PDF.js未載入，嘗試使用其他方法
            reject(new Error('PDF.js未載入，無法讀取PDF內容'));
            return;
        }

        const reader = new FileReader();
        reader.onload = async function (e) {
            try {
                const typedarray = new Uint8Array(e.target.result);
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                let fullText = '';

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    fullText += `第${i}頁: ${pageText}\n\n`;
                }

                resolve(fullText.trim());
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// 提取Word文檔文字內容
async function extractWordText(file) {
    return new Promise((resolve, reject) => {
        // 使用mammoth.js來讀取Word文檔內容
        if (typeof mammoth === 'undefined') {
            // 如果mammoth.js未載入，嘗試使用其他方法
            reject(new Error('mammoth.js未載入，無法讀取Word文檔內容'));
            return;
        }

        const reader = new FileReader();
        reader.onload = async function (e) {
            try {
                const arrayBuffer = e.target.result;
                const result = await mammoth.extractRawText({ arrayBuffer });
                resolve(result.value);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// 提取Excel表格文字內容
async function extractExcelText(file) {
    return new Promise((resolve, reject) => {
        // 使用SheetJS來讀取Excel表格內容
        if (typeof XLSX === 'undefined') {
            // 如果SheetJS未載入，嘗試使用其他方法
            reject(new Error('SheetJS未載入，無法讀取Excel表格內容'));
            return;
        }

        const reader = new FileReader();
        reader.onload = async function (e) {
            try {
                const arrayBuffer = e.target.result;
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                let fullText = '';

                workbook.SheetNames.forEach(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                    fullText += `工作表: ${sheetName}\n`;
                    jsonData.forEach((row, rowIndex) => {
                        if (row && row.length > 0) {
                            fullText += `第${rowIndex + 1}行: ${row.join('\t')}\n`;
                        }
                    });
                    fullText += '\n';
                });

                resolve(fullText.trim());
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// 向選中的模型發送訊息
async function sendMessageToAllModels() {
    const message = document.getElementById('userInput').value.trim();
    const selectedModels = getSelectedModels();

    if (selectedModels.length === 0) {
        showStatus('請至少選擇一個AI模型', 'error');
        return;
    }

    if (!message && uploadedFiles.length === 0) {
        showStatus('請輸入問題或上傳檔案', 'error');
        return;
    }

    // 構建完整的訊息內容（包含檔案內容，用於AI模型分析）
    let fullMessage = message;

    // 檢查是否有圖片檔案
    const imageFiles = uploadedFiles.filter(file => file.type.startsWith('image/') && file.base64Data);

    if (uploadedFiles.length > 0) {
        const fileContents = uploadedFiles.map(file => {
            // 對於AI模型，我們發送完整的檔案內容
            if (file.content) {
                return `[檔案: ${file.name}]\n${file.content}`;
            } else {
                return `[檔案: ${file.name}]\n檔案類型: ${file.type}\n檔案大小: ${formatFileSize(file.size)}`;
            }
        }).join('\n\n');

        if (message) {
            fullMessage = `${message}\n\n${fileContents}`;
        } else {
            fullMessage = fileContents;
        }
    }

    // 在用戶界面中顯示的訊息（只顯示檔案名稱，不顯示內容）
    let displayMessage = message;
    if (uploadedFiles.length > 0) {
        const fileNames = uploadedFiles.map(file => file.name).join(', ');
        if (message) {
            displayMessage = `${message}\n\n[已上傳檔案: ${fileNames}]`;
        } else {
            displayMessage = `[已上傳檔案: ${fileNames}]`;
        }
    }

    // 顯示用戶訊息（只顯示檔案名稱）
    selectedModels.forEach(model => {
        addMessageToTab(model, 'user', displayMessage);
        // 添加用戶訊息到對話歷史
        addToConversationHistoryOnly(model, 'user', fullMessage);
    });

    // 清空輸入框和檔案
    document.getElementById('userInput').value = '';
    clearAllFiles();

    // 顯示載入指示器
    showLoading(true);

    try {
        // 向選中的模型發送完整訊息（包含檔案內容）
        const promises = selectedModels.map(async (model) => {
            try {
                const response = await callAIAPI(model, fullMessage, imageFiles);
                addMessageToTab(model, 'assistant', response);
                // 添加助手回應到對話歷史
                addToConversationHistoryOnly(model, 'assistant', response);
            } catch (error) {
                console.error(`發送訊息到 ${model} 時發生錯誤:`, error);
                let errorMessage = `發送訊息時發生錯誤: ${error.message}`;

                // 為特定錯誤添加解決建議
                if (error.message.includes('配額超限') || error.message.includes('429')) {
                    errorMessage += `\n\n**解決建議：**\n`;
                    if (model === 'gemini') {
                        errorMessage += `• 檢查 Google Cloud Console 中的 Gemini API 配額設置\n`;
                        errorMessage += `• 確認您的計費帳戶已啟用並有足夠的配額\n`;
                        errorMessage += `• 考慮升級到付費計劃以獲得更高配額\n`;
                        errorMessage += `• 等待配額重置（通常是每分鐘或每小時）\n`;
                        errorMessage += `• 訪問：https://ai.google.dev/gemini-api/docs/rate-limits`;
                    } else {
                        errorMessage += `• 請稍後再試，避免過於頻繁的請求\n`;
                        errorMessage += `• 檢查該 API 的速率限制設置`;
                    }
                }

                addMessageToTab(model, 'assistant', errorMessage);
                // 添加錯誤訊息到對話歷史
                addToConversationHistoryOnly(model, 'assistant', errorMessage);
            }
        });

        await Promise.all(promises);
    } catch (error) {
        console.error('發送訊息時發生錯誤:', error);
        showStatus('發送訊息時發生錯誤', 'error');
    } finally {
        showLoading(false);
    }
}

// 向指定頁籤添加訊息
function addMessageToTab(tabName, type, content) {
    const messagesContainer = document.getElementById(`${tabName}Messages`);
    if (!messagesContainer) return;

    // 移除系統提示訊息
    const systemMessage = messagesContainer.querySelector('.message.system');
    if (systemMessage && systemMessage.querySelector('.message-content').textContent.includes('等待您的問題')) {
        systemMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;

    let avatarClass, avatarText;
    if (type === 'user') {
        avatarClass = 'user-avatar';
        avatarText = 'U';
    } else if (type === 'assistant') {
        avatarClass = 'assistant-avatar';
        avatarText = tabName.charAt(0).toUpperCase();
    } else {
        avatarClass = 'system-avatar';
        avatarText = 'S';
    }

    messageDiv.innerHTML = `
        <div class="message-avatar ${avatarClass}">${avatarText}</div>
        <div class="message-content">${type === 'assistant' ? marked.parse(content) : content}</div>
    `;

    messagesContainer.appendChild(messageDiv);

    // 滾動到底部
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // 如果是代碼塊，應用語法高亮
    if (type === 'assistant') {
        messageDiv.querySelectorAll('pre code').forEach(block => {
            hljs.highlightElement(block);
        });
    }
}

// 添加訊息到對話歷史（僅用於API調用）
function addToConversationHistoryOnly(model, role, content) {
    if (!conversationHistory[model]) {
        conversationHistory[model] = [];
    }
    conversationHistory[model].push({ role, content });

    // 限制歷史記錄長度，避免API請求過大
    if (conversationHistory[model].length > 20) {
        conversationHistory[model] = conversationHistory[model].slice(-20);
    }
}

// 調用AI API
async function callAIAPI(modelType, message, imageFiles = []) {
    const model = getSelectedModel(modelType);
    const config = modelConfigs[modelType];

    if (!model) {
        throw new Error(`${getTabDisplayName(modelType)} 模型未選擇`);
    }

    console.log(`調用 ${modelType} API，模型: ${model}`);

    let requestBody, headers, endpoint;

    switch (modelType) {
        case 'openai':
            headers = config.headers;
            endpoint = config.endpoint;
            requestBody = createOpenAIRequestBody(model, message, imageFiles);
            break;

        case 'claude':
            headers = config.headers;
            endpoint = config.endpoint;
            requestBody = createClaudeRequestBody(model, message, imageFiles);
            break;

        case 'gemini':
            headers = config.headers;
            // 動態構建 Gemini 端點
            endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
            requestBody = createGeminiRequestBody(model, message, imageFiles);
            // Gemini需要API金鑰作為查詢參數
            const url = new URL(endpoint);
            url.searchParams.append('key', window.API_KEYS.gemini);
            endpoint = url.toString();
            break;

        case 'deepseek':
            headers = config.headers;
            endpoint = config.endpoint;
            requestBody = createDeepSeekRequestBody(model, message, imageFiles);
            break;

        default:
            throw new Error(`不支援的模型類型: ${modelType}`);
    }

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`${modelType} API 錯誤詳情:`, errorData);

            // 處理特定的錯誤類型
            if (response.status === 429) {
                if (modelType === 'gemini') {
                    throw new Error(`Gemini API 配額超限 (429): 您已超過當前配額限制。請檢查您的 Google Cloud 計費設置和配額限制。詳細信息：${errorData.error?.message || errorData.message || response.statusText}`);
                } else {
                    throw new Error(`API 速率限制 (429): 請求過於頻繁，請稍後再試。詳細信息：${errorData.error?.message || errorData.message || response.statusText}`);
                }
            } else if (response.status === 403) {
                throw new Error(`API 權限錯誤 (403): 請檢查您的 API 金鑰是否正確且具有必要的權限。詳細信息：${errorData.error?.message || errorData.message || response.statusText}`);
            } else if (response.status === 401) {
                throw new Error(`API 認證錯誤 (401): API 金鑰無效或已過期。詳細信息：${errorData.error?.message || errorData.message || response.statusText}`);
            } else {
                throw new Error(`API錯誤: ${response.status} - ${errorData.error?.message || errorData.message || response.statusText}`);
            }
        }

        const data = await response.json();
        return parseAPIResponse(modelType, data);

    } catch (error) {
        console.error(`${modelType} API調用錯誤:`, error);
        throw error;
    }
}

// 獲取選中的模型
function getSelectedModel(modelType) {
    switch (modelType) {
        case 'openai':
            return openaiModelSelect.value;
        case 'deepseek':
            return deepseekModelSelect.value;
        case 'gemini':
            return geminiModelSelect.value;
        case 'claude':
            return claudeModelSelect.value;
        default:
            return null;
    }
}

// 創建OpenAI請求體
function createOpenAIRequestBody(model, message, imageFiles = []) {
    const history = getConversationHistory('openai');

    // 構建當前訊息內容
    let content = [{ type: "text", text: message }];

    // 如果有圖片，添加圖片內容
    if (imageFiles.length > 0) {
        imageFiles.forEach(imageFile => {
            content.push({
                type: "image_url",
                image_url: {
                    url: imageFile.base64Data
                }
            });
        });
    }

    const messages = [...history, { role: 'user', content: content }];

    const baseBody = {
        model: model,
        messages: messages
    };

    // 根據模型類型設置正確的參數
    if (model.includes('gpt-5') || model.includes('gpt-4o') || model.includes('gpt-4o-mini') || model.includes('o4-mini')) {
        baseBody.max_completion_tokens = 5000;
    } else {
        baseBody.max_tokens = 5000;
    }

    return baseBody;
}

// 創建Claude請求體
function createClaudeRequestBody(model, message, imageFiles = []) {
    const history = getConversationHistory('claude');

    // 構建當前訊息內容
    let content = [{ type: "text", text: message }];

    // 如果有圖片，添加圖片內容
    if (imageFiles.length > 0) {
        imageFiles.forEach(imageFile => {
            content.push({
                type: "image",
                source: {
                    type: "base64",
                    media_type: imageFile.type,
                    data: imageFile.base64Data.split(',')[1] // 移除 data:image/...;base64, 前綴
                }
            });
        });
    }

    const messages = [...history, { role: 'user', content: content }];

    return {
        model: model,
        max_completion_tokens: 5000,
        messages: messages
    };
}

// 創建Gemini請求體
function createGeminiRequestBody(model, message, imageFiles = []) {
    const history = getConversationHistory('gemini');
    const contents = [];

    // 將歷史記錄轉換為Gemini格式
    history.forEach(msg => {
        // Gemini 只支援 'user' 和 'model' 角色，將 'assistant' 轉換為 'model'，其他都轉換為 'user'
        const role = msg.role === 'assistant' ? 'model' : 'user';
        contents.push({
            parts: [{ text: msg.content }],
            role: role
        });
    });

    // 構建當前訊息內容
    let parts = [{ text: message }];

    // 如果有圖片，添加圖片內容
    if (imageFiles.length > 0) {
        imageFiles.forEach(imageFile => {
            parts.push({
                inline_data: {
                    mime_type: imageFile.type,
                    data: imageFile.base64Data.split(',')[1] // 移除 data:image/...;base64, 前綴
                }
            });
        });
    }

    // 添加當前訊息
    contents.push({
        parts: parts,
        role: 'user'
    });

    return {
        contents: contents,
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2000
        }
    };
}

// 創建DeepSeek請求體
function createDeepSeekRequestBody(model, message, imageFiles = []) {
    const history = getConversationHistory('deepseek');

    // DeepSeek API 目前不支援多模態輸入，只發送文字內容
    // 如果有圖片檔案，在訊息中提及
    let textMessage = message;
    if (imageFiles.length > 0) {
        const imageNames = imageFiles.map(img => img.name).join(', ');
        textMessage += `\n\n[注意：已上傳圖片檔案：${imageNames}，但 DeepSeek 目前不支援圖片分析，請您描述圖片內容以便我協助分析]`;
    }

    const messages = [...history, { role: 'user', content: textMessage }];

    return {
        model: model,
        messages: messages,
        max_tokens: 5000,
        temperature: 0.7
    };
}

// 解析API回應
function parseAPIResponse(modelType, data) {
    switch (modelType) {
        case 'openai':
            if (data.choices && data.choices[0] && data.choices[0].message) {
                return data.choices[0].message.content;
            }
            throw new Error('OpenAI回應格式錯誤');

        case 'claude':
            if (data.content && data.content[0] && data.content[0].text) {
                return data.content[0].text;
            }
            throw new Error('Claude回應格式錯誤');

        case 'gemini':
            if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
                return data.candidates[0].content.parts[0].text;
            }
            throw new Error('Gemini回應格式錯誤');

        case 'deepseek':
            if (data.choices && data.choices[0] && data.choices[0].message) {
                return data.choices[0].message.content;
            }
            throw new Error('DeepSeek回應格式錯誤');

        default:
            throw new Error(`不支援的模型類型: ${modelType}`);
    }
}

// 清除所有聊天記錄
function clearAllChats() {
    // 清除所有頁籤的聊天記錄
    [openaiMessages, deepseekMessages, geminiMessages, claudeMessages].forEach(container => {
        container.innerHTML = `
            <div class="message system">
                <div class="system-avatar">S</div>
                <div class="message-content">等待您的問題...</div>
            </div>
        `;
    });

    // 清除所有對話歷史和檔案
    clearAllConversationHistory();
    clearAllFiles();

    showStatus('已清除所有聊天記錄和檔案', 'success');
}









// 顯示載入指示器
function showLoading(show) {
    if (show) {
        loadingIndicator.classList.remove('hidden');
    } else {
        loadingIndicator.classList.add('hidden');
    }
}

// 顯示狀態訊息
function showStatus(message, type = 'success') {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    statusMessage.classList.remove('hidden');

    // 對於錯誤訊息，顯示更長時間
    const displayTime = type === 'error' ? 8000 : 3000;
    setTimeout(() => {
        statusMessage.classList.add('hidden');
    }, displayTime);
}

// 錯誤處理
window.addEventListener('error', function (e) {
    console.error('全域錯誤:', e.error);
    showStatus('發生錯誤: ' + e.error.message, 'error');
});

// 未處理的Promise拒絕
window.addEventListener('unhandledrejection', function (e) {
    console.error('未處理的Promise拒絕:', e.reason);
    showStatus('發生錯誤: ' + e.reason.message, 'error');
});
