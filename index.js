import { getContext } from '../../../extensions.js';
import { registerExtension, saveSettings, loadSettings } from '../../../script.js';

const extensionName = 'world-frontend-generator';

// 默认设置
let settings = {
    selectedBookId: '',
    mode: 'manual' // 'manual' 或 'auto'
};

// 存储最新生成的HTML
let lastGeneratedHTML = '';

// 注册扩展
registerExtension(extensionName, { chat: handleChat }, { render: renderExtension });

// 渲染设置面板（由酒馆自动调用）
function renderExtension() {
    loadSettings(); // 加载已有设置

    // 绑定生成按钮
    $('#generate-frontend-btn').on('click', generateFrontend);
    $('#copy-html-btn').on('click', copyHTMLToClipboard);

    // 绑定模式切换
    $('input[name="gen-mode"]').on('change', function() {
        settings.mode = $(this).val();
        saveSettings();
    });

    // 加载世界书下拉列表
    populateWorldBookSelect();
}

// 填充世界书下拉框
function populateWorldBookSelect() {
    const context = getContext();
    let worldInfoBooks = context.worldInfo?.books || window.world_info || [];

    if (!Array.isArray(worldInfoBooks)) worldInfoBooks = [];

    const select = $('#world-book-select');
    select.empty();

    if (worldInfoBooks.length === 0) {
        select.append('<option value="">无可用世界书</option>');
        return;
    }

    worldInfoBooks.forEach(book => {
        const bookId = book.id || book.name;
        select.append(`<option value="${bookId}" ${bookId === settings.selectedBookId ? 'selected' : ''}>${book.name}</option>`);
    });

    // 监听选择变化
    select.on('change', function() {
        settings.selectedBookId = $(this).val();
        saveSettings();
    });
}

// 生成前端HTML
function generateFrontend() {
    const context = getContext();
    const selectedBookId = $('#world-book-select').val();

    if (!selectedBookId) {
        showStatus('请先选择一本世界书', 'red');
        return;
    }

    let worldInfoBooks = context.worldInfo?.books || window.world_info || [];
    const selectedBook = worldInfoBooks.find(book => (book.id || book.name) === selectedBookId);

    if (!selectedBook || !selectedBook.entries) {
        showStatus('未找到世界书条目', 'red');
        return;
    }

    // 提取所有条目的关键词和内容（可根据需要调整）
    const entries = selectedBook.entries;
    const items = [];

    entries.forEach(entry => {
        if (entry.keys && entry.keys.length > 0) {
            items.push({
                keys: entry.keys.join(', '),
                content: entry.content || ''
            });
        }
    });

    if (items.length === 0) {
        showStatus('该世界书没有关键词', 'orange');
        return;
    }

    // 生成HTML - 这里设计为卡片列表，你也可以自由修改样式
    let html = `
        <div class="world-frontend-container" style="font-family: Arial, sans-serif; padding: 10px; background: #f9f9f9; border-radius: 8px;">
            <h3 style="margin-top:0;">世界书条目：${selectedBook.name}</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
    `;

    items.forEach(item => {
        // 对关键词和内容进行转义，防止XSS
        const safeKeys = escapeHtml(item.keys);
        const safeContent = escapeHtml(item.content.substring(0, 100) + (item.content.length > 100 ? '...' : ''));
        html += `
            <div class="world-card" style="background: white; border: 1px solid #ddd; border-radius: 6px; padding: 8px 12px; max-width: 200px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <div style="font-weight: bold; color: #2c3e50;">${safeKeys}</div>
                <div style="font-size: 0.9em; color: #555; margin-top: 4px;">${safeContent}</div>
            </div>
        `;
    });

    html += `</div></div>`;

    // 将HTML存入变量
    lastGeneratedHTML = html;
    const escapedHtml = JSON.stringify(html);
    context.executeSlashCommands(`/setvar key=world_frontend_html value=${escapedHtml}`);

    // 预览
    $('#preview-content').html(html);
    showStatus(`已生成 ${items.length} 个卡片，并存入变量 world_frontend_html`, 'green');
}

// 复制到剪贴板
function copyHTMLToClipboard() {
    if (!lastGeneratedHTML) {
        showStatus('没有可复制的内容', 'red');
        return;
    }
    navigator.clipboard.writeText(lastGeneratedHTML).then(() => {
        showStatus('HTML 已复制到剪贴板', 'green');
    }).catch(() => {
        showStatus('复制失败', 'red');
    });
}

// 处理聊天消息（自动响应指令）
function handleChat(data) {
    if (settings.mode !== 'auto') return;

    // 检查用户消息是否以 /genfront 开头
    const userMessage = data?.message;
    if (typeof userMessage === 'string' && userMessage.trim().startsWith('/genfront')) {
        generateFrontend();
        // 可选：将生成的内容自动作为AI消息发送
        setTimeout(() => {
            if (lastGeneratedHTML) {
                // 使用 sendMessageAs 发送系统消息？这里简单插入到输入框
                const textarea = $('#send_textarea');
                const currentText = textarea.val();
                const macro = '{{getvar::world_frontend_html}}';
                if (!currentText.includes(macro)) {
                    textarea.val(currentText + ' ' + macro);
                }
            }
        }, 500);
    }
}

// 显示状态信息
function showStatus(msg, color) {
    $('#status-msg').text(msg).css('color', color || '#333');
    setTimeout(() => $('#status-msg').text(''), 3000);
}

// HTML转义
function escapeHtml(unsafe) {
    return unsafe.replace(/[&<>"]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        if (m === '"') return '&quot;';
        return m;
    });
}

// 保存/加载设置（酒馆自动调用）
export function onSettingsChange() {
    saveSettings();
}
export function loadSettings() {
    const loaded = window.SillyTavern?.settings?.extensions?.[extensionName];
    if (loaded) settings = loaded;
}
export function saveSettings() {
    window.SillyTavern.settings.extensions[extensionName] = settings;
    saveSettings();
}