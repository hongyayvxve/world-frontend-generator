// world-frontend-generator/index.js
// 强制浮动面板版本，不依赖酒馆特定容器

(function() {
    console.log('世界书前端生成器加载中...');

    // 等待 DOM 加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        // 如果已经存在，先移除旧的
        if (document.getElementById('wfg-float-container')) return;

        // 创建悬浮按钮
        const btn = document.createElement('div');
        btn.id = 'wfg-toggle-btn';
        btn.innerHTML = '📚 世界书前端';
        Object.assign(btn.style, {
            position: 'fixed',
            bottom: '120px',
            right: '20px',
            backgroundColor: '#4a90e2',
            color: 'white',
            padding: '10px 16px',
            borderRadius: '30px',
            cursor: 'pointer',
            zIndex: '10001',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold',
            userSelect: 'none'
        });
        document.body.appendChild(btn);

        // 创建浮动面板（初始隐藏）
        const panel = document.createElement('div');
        panel.id = 'wfg-float-panel';
        Object.assign(panel.style, {
            position: 'fixed',
            bottom: '180px',
            right: '20px',
            width: '340px',
            maxHeight: '500px',
            overflowY: 'auto',
            backgroundColor: 'white',
            border: '2px solid #4a90e2',
            borderRadius: '10px',
            padding: '16px',
            zIndex: '10002',
            boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
            display: 'none',
            fontFamily: 'Arial, sans-serif'
        });
        document.body.appendChild(panel);

        // 获取世界书数据
        function getWorldBooks() {
            const context = window.SillyTavern?.getContext?.() || window;
            return context.worldInfo?.books || window.world_info || [];
        }

        // 渲染面板内容
        function renderPanel() {
            const books = getWorldBooks();
            let options = '<option value="">请选择世界书</option>';
            books.forEach(book => {
                const bookId = book.id || book.name;
                options += `<option value="${bookId}">${book.name}</option>`;
            });

            panel.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <h3 style="margin:0;">世界书前端生成器</h3>
                    <span id="wfg-close" style="cursor:pointer; font-size:20px;">&times;</span>
                </div>
                <div style="margin-bottom:12px;">
                    <label style="display:block; margin-bottom:5px;">选择世界书：</label>
                    <select id="wfg-select" style="width:100%; padding:6px;">${options}</select>
                </div>
                <div style="margin-bottom:12px;">
                    <button id="wfg-generate" style="padding:8px 12px; background:#4a90e2; color:white; border:none; border-radius:5px; cursor:pointer; margin-right:8px;">生成前端 HTML</button>
                    <button id="wfg-copy" style="padding:8px 12px; background:#6c757d; color:white; border:none; border-radius:5px; cursor:pointer;">复制 HTML</button>
                </div>
                <div id="wfg-preview" style="
                    border:1px solid #ccc;
                    border-radius:5px;
                    padding:8px;
                    max-height:200px;
                    overflow:auto;
                    background:#f9f9f9;
                    font-size:12px;
                ">预览区域</div>
                <div id="wfg-status" style="margin-top:8px; color:#28a745; font-size:12px;"></div>
            `;

            // 绑定事件
            document.getElementById('wfg-close').addEventListener('click', () => {
                panel.style.display = 'none';
            });

            let lastHTML = '';

            document.getElementById('wfg-generate').addEventListener('click', () => {
                const select = document.getElementById('wfg-select');
                const selectedId = select.value;
                if (!selectedId) {
                    document.getElementById('wfg-status').innerText = '请选择世界书';
                    document.getElementById('wfg-status').style.color = 'red';
                    return;
                }

                const books = getWorldBooks();
                const book = books.find(b => (b.id || b.name) === selectedId);
                if (!book || !book.entries) {
                    document.getElementById('wfg-status').innerText = '未找到世界书条目';
                    document.getElementById('wfg-status').style.color = 'red';
                    return;
                }

                // 提取关键词
                const items = [];
                book.entries.forEach(entry => {
                    if (entry.keys && entry.keys.length > 0) {
                        items.push({
                            keys: entry.keys.join(', '),
                            content: entry.content || ''
                        });
                    }
                });

                if (items.length === 0) {
                    document.getElementById('wfg-status').innerText = '该世界书没有关键词';
                    document.getElementById('wfg-status').style.color = 'orange';
                    return;
                }

                // 生成HTML卡片
                let generated = `
                    <div style="font-family:Arial,sans-serif; padding:10px; background:#f9f9f9; border-radius:8px;">
                        <h3 style="margin-top:0;">世界书条目：${escapeHtml(book.name)}</h3>
                        <div style="display:flex; flex-wrap:wrap; gap:8px;">
                `;
                items.forEach(item => {
                    const safeKeys = escapeHtml(item.keys);
                    const safeContent = escapeHtml(item.content.substring(0, 100) + (item.content.length > 100 ? '...' : ''));
                    generated += `
                        <div style="background:white; border:1px solid #ddd; border-radius:6px; padding:8px 12px; max-width:200px; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
                            <div style="font-weight:bold; color:#2c3e50;">${safeKeys}</div>
                            <div style="font-size:0.9em; color:#555; margin-top:4px;">${safeContent}</div>
                        </div>
                    `;
                });
                generated += `</div></div>`;

                lastHTML = generated;
                document.getElementById('wfg-preview').innerHTML = generated;
                document.getElementById('wfg-status').innerText = `已生成 ${items.length} 个卡片`;
                document.getElementById('wfg-status').style.color = 'green';

                // 存入变量
                const context = window.SillyTavern?.getContext?.();
                if (context && context.executeSlashCommands) {
                    const escaped = JSON.stringify(generated);
                    context.executeSlashCommands(`/setvar key=world_frontend_html value=${escaped}`);
                } else {
                    // 降级：直接设置全局变量
                    window.world_frontend_html = generated;
                }
            });

            document.getElementById('wfg-copy').addEventListener('click', () => {
                if (!lastHTML) {
                    document.getElementById('wfg-status').innerText = '没有可复制的内容';
                    document.getElementById('wfg-status').style.color = 'red';
                    return;
                }
                navigator.clipboard.writeText(lastHTML).then(() => {
                    document.getElementById('wfg-status').innerText = '已复制到剪贴板';
                    document.getElementById('wfg-status').style.color = 'green';
                }).catch(() => {
                    document.getElementById('wfg-status').innerText = '复制失败';
                    document.getElementById('wfg-status').style.color = 'red';
                });
            });
        }

        // 点击按钮切换面板
        btn.addEventListener('click', () => {
            if (panel.style.display === 'none' || panel.style.display === '') {
                renderPanel(); // 每次打开时重新渲染（确保数据最新）
                panel.style.display = 'block';
            } else {
                panel.style.display = 'none';
            }
        });

        // HTML转义函数
        function escapeHtml(unsafe) {
            return unsafe.replace(/[&<>"]/g, function(m) {
                if (m === '&') return '&amp;';
                if (m === '<') return '&lt;';
                if (m === '>') return '&gt;';
                if (m === '"') return '&quot;';
                return m;
            });
        }

        console.log('世界书前端生成器已启动，浮动按钮已添加。');
    }
})();
