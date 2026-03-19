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

// 渲染扩展界面
function renderExtension() {
    loadSettings();

    // 尝试将面板渲染到扩展菜单中
    const targetContainer = $('#extensions_settings');
    if (targetContainer.length) {
        // 如果扩展菜单容器存在，直接追加到里面
        renderPanel(targetContainer);
    } else {
        // 否则，在聊天栏上方创建一个按钮，点击后弹出浮动面板
        addFloatingButton();
    }
}

// 渲染完整面板到指定容器
function renderPanel(container) {
    const context = getContext();
    let worldInfoBooks = context.worldInfo?.books || window.world_info || [];
    if (!Array.isArray(worldInfoBooks)) worldInfoBooks = [];

    let options = '<option value="">请选择世界书</option>';
    worldInfoBooks.forEach(book => {
        const bookId = book.id || book.name;
        const selected = (bookId === settings.selectedBookId) ? 'selected' : '';
        options += `<option value="${bookId}" ${selected}>${book.name}</option>`;
    });

    const html = `
        <div id="world-frontend-settings" style="margin: 10px 0; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
            <h3 style="margin-top:0;">世界书前端生成器</h3>
            <div style="margin-bottom: 10px;">
                <label style="display:block; margin-bottom:5px;">选择世界书：</label>
                <select id="world-book-select" style="width:100%; padding:5px;">${options}</select>
            </div>
            <div style="margin-bottom: 10px;">
                <button id="generate-frontend-btn" class="menu_button">一键生成前端 HTML</button>
                <button id="copy-html-btn" class="menu_button">复制 HTML</button>
            </div>
            <div id="preview-area" style="
                margin-top:10px;
                max-height:200px;
                overflow:auto;
                border:1px solid #ccc;
                padding:8px;
                background:#f9f9f9;
                font-size:12px;
            ">预览区域</div>
            <div id="status-msg" style="margin-top:8px; color:#28a745;"></div>
        </div>
    `;
    container.append(html);

    // 绑定事件
    $('#world-book-select').on('change', function() {
        settings.selectedBookId = $(this).val();
        saveSettings();
    });

    $('#generate-frontend-btn').on('click', generateFrontend);
    $('#copy-html-btn').on('click', copyHTML);
}

// 在聊天栏上方添加浮动按钮
function addFloatingButton() {
    const buttonHtml = `
        <div id="world-frontend-toggle" style="display:inline-block; margin-left:10px;">
            <button class="menu_button" style="background:#4a90e2; color:white;">世界书前端</button>
        </div>
    `;
    // 将按钮添加到聊天栏上方（通常有 .send_form 或 .bottom_controls）
    $('.send_form').prepend(buttonHtml);

    let panelVisible = false;
    let panel = null;

    $('#world-frontend-toggle button').on('click', function() {
        if (!panelVisible) {
            // 创建浮动面板
            const context = getContext();
            let worldInfoBooks = context.worldInfo?.books || window.world_info || [];
            if (!Array.isArray(worldInfoBooks)) worldInfoBooks = [];

            let options = '<option value="">请选择世界书</option>';
            worldInfoBooks.forEach(book => {
                const bookId = book.id || book.name;
                options += `<option value="${bookId}">${book.name}</option>`;
            });

            panel = $(`
                <div id="world-frontend-float" style="
                    position: fixed;
                    bottom: 100px;
                    right: 20px;
                    width: 300px;
                    background: white;
                    border: 2px solid #4a90e2;
                    border-radius: 8px;
                    padding: 15px;
                    z-index: 10000;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                ">
                    <h3 style="margin-top:0;">世界书前端生成器</h3>
                    <div style="margin-bottom:10px;">
                        <label>选择世界书：</label>
                        <select id="float-world-book-select" style="width:100%; padding:5px;">${options}</select>
                    </div>
                    <div>
                        <button id="float-generate-btn" class="menu_button">生成</button>
                        <button id="float-copy-btn" class="menu_button">复制</button>
                        <button id="float-close-btn" class="menu_button" style="float:right;">关闭</button>
                    </div>
                    <div id="float-preview" style="
                        margin-top:10px;
                        max-height:150px;
                        overflow:auto;
                        border:1px solid #ccc;
                        padding:5px;
                        background:#f9f9f9;
                    ">预览</div>
                    <div id="float-status" style="margin-top:5px; font-size:12px;"></div>
                </div>
            `).appendTo('body');

            // 绑定浮动面板事件
            $('#float-generate-btn').on('click', function() {
                const selectedId = $('#float-world-book-select').val();
                if (!selectedId) {
                    $('#float-status').text('请选择世界书').css('color', 'red');
                    return;
                }
                const selectedBook = worldInfoBooks.find(book => (book.id || book.name) === selectedId);
                if (!selectedBook || !selectedBook.entries) {
                    $('#float-status').text('未找到世界书条目').css('color', 'red');
                    return;
                }

                const items = [];
                selectedBook.entries.forEach(entry => {
                    if (entry.keys && entry.keys.length > 0) {
                        items.push({
                            keys: entry.keys.join(', '),
                            content: entry.content || ''
                        });
                    }
                });

                if (items.length === 0) {
                    $('#float-status').text('该世界书没有关键词').css('color', 'orange');
                    return;
                }

                let generated = `
                    <div class="world-frontend-container" style="font-family: Arial, sans-serif; padding: 10px; background: #f9f9f9; border-radius: 8px;">
                        <h3 style="margin-top:0;">世界书条目：${selectedBook.name}</h3>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                `;
                items.forEach(item => {
                    const safeKeys = escapeHtml(item.keys);
                    const safeContent = escapeHtml(item.content.substring(0, 100) + (item.content.length > 100 ? '...' : ''));
                    generated += `
                        <div style="background: white; border: 1px solid #ddd; border-radius: 6px; padding: 8px 12px; max-width: 200px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                            <div style="font-weight: bold; color: #2c3e50;">${safeKeys}</div>
                            <div style="font-size: 0.9em; color: #555; margin-top: 4px;">${safeContent}</div>
                        </div>
                    `;
                });
                generated += `</div></div>`;

                lastGeneratedHTML = generated;
                $('#float-preview').html(generated);
                $('#float-status').text(`已生成 ${items.length} 个卡片`).css('color', 'green');

                const escaped = JSON.stringify(generated);
                if (context.executeSlashCommands) {
                    context.executeSlashCommands(`/setvar key=world_frontend_html value=${escaped}`);
                } else {
                    window.SillyTavern?.getContext?.()?.variables?.world_frontend_html = generated;
                }
            });

            $('#float-copy-btn').on('click', function() {
                if (!lastGeneratedHTML) {
                    $('#float-status').text('无内容可复制').css('color', 'red');
                    return;
                }
                navigator.clipboard.writeText(lastGeneratedHTML).then(() => {
                    $('#float-status').text('已复制').css('color', 'green');
                }).catch(() => {
                    $('#float-status').text('复制失败').css('color', 'red');
                });
            });

            $('#float-close-btn').on('click', function() {
                panel.remove();
                panelVisible = false;
                panel = null;
            });

            panelVisible = true;
        } else {
            panel.remove();
            panelVisible = false;
            panel = null;
        }
    });
}

// 生成前端HTML（供扩展菜单版使用）
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

    const items = [];
    selectedBook.entries.forEach(entry => {
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

    let generated = `
        <div class="world-frontend-container" style="font-family: Arial, sans-serif; padding: 10px; background: #f9f9f9; border-radius: 8px;">
            <h3 style="margin-top:0;">世界书条目：${selectedBook.name}</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
    `;
    items.forEach(item => {
        const safeKeys = escapeHtml(item.keys);
        const safeContent = escapeHtml(item.content.substring(0, 100) + (item.content.length > 100 ? '...' : ''));
        generated += `
            <div style="background: white; border: 1px solid #ddd; border-radius: 6px; padding: 8px 12px; max-width: 200px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <div style="font-weight: bold; color: #2c3e50;">${safeKeys}</div>
                <div style="font-size: 0.9em; color: #555; margin-top: 4px;">${safeContent}</div>
            </div>
        `;
    });
    generated += `</div></div>`;

    lastGeneratedHTML = generated;
    $('#preview-area').html(generated);
    showStatus(`已生成 ${items.length} 个卡片，并存入变量 world_frontend_html`, 'green');

    const escaped = JSON.stringify(generated);
    context.executeSlashCommands(`/setvar key=world_frontend_html value=${escaped}`);
}

// 复制HTML（供扩展菜单版使用）
function copyHTML() {
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

// 处理聊天消息（自动响应指令）
function handleChat(data) {
    if (settings.mode !== 'auto') return;

    const userMessage = data?.message;
    if (typeof userMessage === 'string' && userMessage.trim().startsWith('/genfront')) {
        generateFrontend();
        setTimeout(() => {
            if (lastGeneratedHTML) {
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

// 保存/加载设置
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
