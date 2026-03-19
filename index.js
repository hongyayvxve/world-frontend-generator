// world-frontend-generator/index.js
// 暗色简约版 + 增强世界书读取

(function() {
    console.log('世界书前端生成器加载中...');

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        if (document.getElementById('wfg-toggle-btn')) return;

        // ================== 样式定义 ==================
        const colors = {
            bg: '#1e1e1e',           // 主背景
            panelBg: '#2d2d2d',       // 面板背景
            border: '#3c3c3c',         // 边框
            text: '#e0e0e0',           // 主文字
            textMuted: '#a0a0a0',       // 辅助文字
            accent: '#4a90e2',          // 强调色（按钮）
            accentHover: '#5aa0f2',
            danger: '#f04747',
            success: '#43b581'
        };

        // ================== 创建按钮 ==================
        const btn = document.createElement('div');
        btn.id = 'wfg-toggle-btn';
        btn.innerHTML = '📚 世界书前端';
        Object.assign(btn.style, {
            position: 'fixed',
            bottom: '120px',
            right: '20px',
            backgroundColor: colors.accent,
            color: '#ffffff',
            padding: '10px 16px',
            borderRadius: '30px',
            cursor: 'pointer',
            zIndex: '10001',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
            fontWeight: '500',
            fontSize: '14px',
            userSelect: 'none',
            transition: 'background-color 0.2s',
            border: `1px solid ${colors.border}`
        });
        btn.addEventListener('mouseenter', () => btn.style.backgroundColor = colors.accentHover);
        btn.addEventListener('mouseleave', () => btn.style.backgroundColor = colors.accent);
        document.body.appendChild(btn);

        // ================== 创建浮动面板 ==================
        const panel = document.createElement('div');
        panel.id = 'wfg-float-panel';
        Object.assign(panel.style, {
            position: 'fixed',
            bottom: '180px',
            right: '20px',
            width: '360px',
            maxHeight: '520px',
            overflowY: 'auto',
            backgroundColor: colors.panelBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '10px',
            padding: '18px',
            zIndex: '10002',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            display: 'none',
            fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
            color: colors.text,
            fontSize: '13px',
            lineHeight: '1.5'
        });
        document.body.appendChild(panel);

        // ================== 安全获取世界书列表 ==================
        function getWorldBooks() {
            let books = [];
            const context = window.SillyTavern?.getContext?.() || window;

            // 尝试多个可能的来源
            const possiblePaths = [
                context.worldInfo?.books,
                context.world_info,
                window.world_info,
                window.WorldInfo?.books,
                window.SillyTavern?.getContext?.()?.worldInfo?.books
            ];

            for (let src of possiblePaths) {
                if (src) {
                    if (Array.isArray(src)) {
                        books = src;
                        break;
                    } else if (typeof src === 'object') {
                        // 可能是以ID为键的对象
                        books = Object.values(src);
                        if (books.length > 0) break;
                    }
                }
            }

            // 如果还是空，尝试从全局 world 对象查找
            if (books.length === 0 && window.world) {
                if (Array.isArray(window.world)) books = window.world;
                else if (typeof window.world === 'object') books = Object.values(window.world);
            }

            // 过滤掉无效项，确保每个条目有 id 或 name
            books = books.filter(b => b && (b.id || b.name));

            console.log('获取到的世界书列表:', books);
            return books;
        }

        // ================== 渲染面板内容 ==================
        function renderPanel() {
            const books = getWorldBooks();

            // 构建下拉选项
            let options = '<option value="">— 请选择世界书 —</option>';
            if (books.length === 0) {
                options = '<option value="" disabled>⚠️ 未检测到世界书，请先导入</option>';
            } else {
                books.forEach(book => {
                    const bookId = book.id || book.name || `book_${Math.random()}`;
                    const bookName = book.name || book.id || '未命名世界书';
                    options += `<option value="${bookId}">${escapeHtml(bookName)}</option>`;
                });
            }

            // 面板HTML
            panel.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                    <h3 style="margin:0; font-size:16px; font-weight:600; color:${colors.text};">世界书前端生成器</h3>
                    <span id="wfg-close" style="cursor:pointer; font-size:20px; color:${colors.textMuted}; line-height:1;">&times;</span>
                </div>
                <div style="margin-bottom:16px;">
                    <label style="display:block; margin-bottom:6px; color:${colors.textMuted};">选择世界书：</label>
                    <select id="wfg-select" style="width:100%; padding:8px 10px; background-color:${colors.bg}; border:1px solid ${colors.border}; border-radius:6px; color:${colors.text}; font-size:13px;">
                        ${options}
                    </select>
                </div>
                <div style="display:flex; gap:8px; margin-bottom:16px;">
                    <button id="wfg-generate" style="flex:1; padding:8px 12px; background-color:${colors.accent}; border:none; border-radius:6px; color:white; font-weight:500; cursor:pointer; transition:background-color 0.2s;">✨ 生成前端</button>
                    <button id="wfg-copy" style="flex:1; padding:8px 12px; background-color:${colors.bg}; border:1px solid ${colors.border}; border-radius:6px; color:${colors.text}; cursor:pointer; transition:all 0.2s;">📋 复制HTML</button>
                </div>
                <div id="wfg-preview" style="
                    border:1px solid ${colors.border};
                    border-radius:6px;
                    padding:10px;
                    max-height:200px;
                    overflow:auto;
                    background-color:${colors.bg};
                    color:${colors.text};
                    font-size:12px;
                ">预览区域</div>
                <div id="wfg-status" style="margin-top:10px; font-size:12px; color:${colors.success}; min-height:18px;"></div>
            `;

            // 绑定关闭事件
            document.getElementById('wfg-close').addEventListener('click', () => {
                panel.style.display = 'none';
            });

            let lastHTML = '';

            // 生成按钮事件
            document.getElementById('wfg-generate').addEventListener('click', () => {
                const select = document.getElementById('wfg-select');
                const selectedId = select.value;
                if (!selectedId || selectedId === '') {
                    setStatus('请选择世界书', 'error');
                    return;
                }

                const books = getWorldBooks();
                const book = books.find(b => (b.id || b.name) === selectedId);
                if (!book) {
                    setStatus('未找到选中的世界书', 'error');
                    return;
                }

                // 确保 entries 存在且为数组
                const entries = book.entries || [];
                if (!Array.isArray(entries) || entries.length === 0) {
                    setStatus('世界书条目为空或格式错误', 'error');
                    return;
                }

                // 提取关键词
                const items = [];
                entries.forEach(entry => {
                    if (entry.keys && Array.isArray(entry.keys) && entry.keys.length > 0) {
                        items.push({
                            keys: entry.keys.join(', '),
                            content: entry.content || ''
                        });
                    }
                });

                if (items.length === 0) {
                    setStatus('该世界书没有关键词', 'warning');
                    return;
                }

                // 生成HTML卡片
                let generated = `
                    <div style="font-family:system-ui; padding:12px; background:${colors.bg}; border-radius:8px;">
                        <h4 style="margin:0 0 10px 0; font-size:14px; color:${colors.text};">世界书条目：${escapeHtml(book.name || book.id || '未命名')}</h4>
                        <div style="display:flex; flex-wrap:wrap; gap:8px;">
                `;
                items.forEach(item => {
                    const safeKeys = escapeHtml(item.keys);
                    const safeContent = escapeHtml(item.content.substring(0, 80) + (item.content.length > 80 ? '…' : ''));
                    generated += `
                        <div style="background:${colors.panelBg}; border:1px solid ${colors.border}; border-radius:6px; padding:8px; max-width:180px; flex:1 1 auto;">
                            <div style="font-weight:600; color:${colors.accent}; margin-bottom:4px; word-break:break-word;">${safeKeys}</div>
                            <div style="font-size:11px; color:${colors.textMuted}; line-height:1.4;">${safeContent}</div>
                        </div>
                    `;
                });
                generated += `</div></div>`;

                lastHTML = generated;
                document.getElementById('wfg-preview').innerHTML = generated;
                setStatus(`✅ 已生成 ${items.length} 个卡片`, 'success');

                // 存入变量 world_frontend_html
                const context = window.SillyTavern?.getContext?.();
                if (context && context.executeSlashCommands) {
                    const escaped = JSON.stringify(generated);
                    context.executeSlashCommands(`/setvar key=world_frontend_html value=${escaped}`);
                } else {
                    window.world_frontend_html = generated;
                }
            });

            // 复制按钮事件
            document.getElementById('wfg-copy').addEventListener('click', () => {
                if (!lastHTML) {
                    setStatus('没有可复制的内容', 'error');
                    return;
                }
                navigator.clipboard.writeText(lastHTML).then(() => {
                    setStatus('📋 HTML 已复制到剪贴板', 'success');
                }).catch(() => {
                    setStatus('复制失败', 'error');
                });
            });

            // 辅助函数：设置状态信息
            function setStatus(msg, type = 'info') {
                const el = document.getElementById('wfg-status');
                if (!el) return;
                let color = colors.textMuted;
                if (type === 'success') color = colors.success;
                if (type === 'error') color = colors.danger;
                if (type === 'warning') color = '#faa61a';
                el.innerText = msg;
                el.style.color = color;
                setTimeout(() => { el.innerText = ''; }, 3000);
            }
        }

        // ================== 点击按钮切换面板 ==================
        btn.addEventListener('click', () => {
            if (panel.style.display === 'none' || panel.style.display === '') {
                renderPanel(); // 每次打开重新渲染，保证数据最新
                panel.style.display = 'block';
            } else {
                panel.style.display = 'none';
            }
        });

        // HTML转义函数（用于防止XSS）
        function escapeHtml(unsafe) {
            if (!unsafe) return '';
            return unsafe
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        console.log('世界书前端生成器已启动，浮动按钮已添加。');
    }
})();
