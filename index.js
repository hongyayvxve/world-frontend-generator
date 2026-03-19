// world-frontend-generator/index.js
// 超级兼容版 v2：支持 entries 对象 + originalData 数组
// 暗色简约风格

(function() {
    console.log('世界书前端生成器（超级兼容版v2）加载中...');

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        if (document.getElementById('wfg-toggle-btn')) return;

        // ================== 暗色主题颜色 ==================
        const colors = {
            bg: '#1e1e1e',
            panelBg: '#2d2d2d',
            border: '#3c3c3c',
            text: '#e0e0e0',
            textMuted: '#a0a0a0',
            accent: '#4a90e2',
            accentHover: '#5aa0f2',
            danger: '#f04747',
            success: '#43b581',
            warning: '#faa61a'
        };

        // ================== 创建悬浮按钮 ==================
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
            width: '380px',
            maxHeight: '560px',
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

        // ================== 渲染面板 ==================
        function renderPanel() {
            panel.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                    <h3 style="margin:0; font-size:16px; font-weight:600; color:${colors.text};">世界书前端生成器</h3>
                    <span id="wfg-close" style="cursor:pointer; font-size:20px; color:${colors.textMuted}; line-height:1;">&times;</span>
                </div>
                <div style="margin-bottom:16px;">
                    <label style="display:block; margin-bottom:6px; color:${colors.textMuted};">📁 上传世界书JSON文件</label>
                    <div style="display:flex; gap:8px;">
                        <button id="wfg-file-button" style="flex:1; padding:8px 12px; background-color:${colors.bg}; border:1px solid ${colors.border}; border-radius:6px; color:${colors.text}; cursor:pointer; text-align:center;">选择文件</button>
                        <span id="wfg-file-name" style="flex:2; padding:8px 0; color:${colors.textMuted}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">未选择任何文件</span>
                    </div>
                    <input type="file" id="wfg-file-input" accept=".json" style="display:none;">
                </div>
                <div style="margin-bottom:16px;">
                    <label style="display:block; margin-bottom:6px; color:${colors.textMuted};">📖 世界书名称（可选）</label>
                    <input type="text" id="wfg-book-name" placeholder="留空则用文件名" style="width:100%; padding:8px 10px; background-color:${colors.bg}; border:1px solid ${colors.border}; border-radius:6px; color:${colors.text}; font-size:13px; box-sizing:border-box;">
                </div>
                <div style="display:flex; gap:8px; margin-bottom:16px;">
                    <button id="wfg-generate" style="flex:1; padding:8px 12px; background-color:${colors.accent}; border:none; border-radius:6px; color:white; font-weight:500; cursor:pointer; transition:background-color 0.2s;">✨ 解析并生成</button>
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

            // 文件选择逻辑
            const fileButton = document.getElementById('wfg-file-button');
            const fileInput = document.getElementById('wfg-file-input');
            const fileNameSpan = document.getElementById('wfg-file-name');

            fileButton.addEventListener('click', () => {
                fileInput.click();
            });

            fileInput.addEventListener('change', (e) => {
                if (fileInput.files.length > 0) {
                    fileNameSpan.textContent = fileInput.files[0].name;
                    fileNameSpan.style.color = colors.text;
                } else {
                    fileNameSpan.textContent = '未选择任何文件';
                    fileNameSpan.style.color = colors.textMuted;
                }
            });

            let lastHTML = '';

            // 生成按钮事件
            document.getElementById('wfg-generate').addEventListener('click', () => {
                const file = fileInput.files[0];
                if (!file) {
                    setStatus('请先选择JSON文件', 'error');
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const json = JSON.parse(e.target.result);
                        console.log('解析的JSON原始对象:', json);

                        // ===== 智能提取条目数组 =====
                        let entries = [];

                        // 情况1：直接是数组
                        if (Array.isArray(json)) {
                            entries = json;
                        }
                        // 情况2：有 entries 字段且为数组
                        else if (json.entries && Array.isArray(json.entries)) {
                            entries = json.entries;
                        }
                        // 情况2b：有 entries 字段且为对象（比如 {0:{...}, 1:{...}}）
                        else if (json.entries && typeof json.entries === 'object') {
                            entries = Object.values(json.entries);
                        }
                        // 情况3：有 originalData 字段且 originalData.entries 是数组
                        else if (json.originalData && Array.isArray(json.originalData.entries)) {
                            entries = json.originalData.entries;
                        }
                        // 情况4：有 data 字段且为数组
                        else if (json.data && Array.isArray(json.data)) {
                            entries = json.data;
                        }
                        // 情况5：有 list 字段且为数组
                        else if (json.list && Array.isArray(json.list)) {
                            entries = json.list;
                        }
                        // 情况6：有 worldInfoEntries 字段且为数组
                        else if (json.worldInfoEntries && Array.isArray(json.worldInfoEntries)) {
                            entries = json.worldInfoEntries;
                        }
                        // 情况7：对象的值可能是条目（如 { "1": {...}, "2": {...} }）
                        else {
                            const values = Object.values(json);
                            // 检查第一个值是否看起来像条目（有keys或content）
                            if (values.length > 0 && values[0] && (values[0].keys || values[0].content)) {
                                entries = values;
                            }
                        }

                        console.log('提取到的条目数组:', entries);
                        console.log('条目数量:', entries.length);

                        if (entries.length === 0) {
                            setStatus('未找到条目，请检查JSON格式。控制台已输出原始对象', 'error');
                            return;
                        }

                        // 提取关键词
                        const items = [];
                        entries.forEach((entry, index) => {
                            // 兼容不同字段名：keys / key / keywords / tags
                            let keyArray = [];
                            if (Array.isArray(entry.keys)) {
                                keyArray = entry.keys;
                            } else if (Array.isArray(entry.key)) {
                                keyArray = entry.key;
                            } else if (Array.isArray(entry.keywords)) {
                                keyArray = entry.keywords;
                            } else if (Array.isArray(entry.tags)) {
                                keyArray = entry.tags;
                            } else if (typeof entry.keys === 'string') {
                                keyArray = [entry.keys];
                            } else if (typeof entry.key === 'string') {
                                keyArray = [entry.key];
                            }

                            if (keyArray.length > 0) {
                                items.push({
                                    keys: keyArray.join(', '),
                                    content: entry.content || entry.entry || entry.text || ''
                                });
                            }
                        });

                        if (items.length === 0) {
                            setStatus('未找到关键词，请检查条目中是否有 keys/content 等字段', 'warning');
                            return;
                        }

                        // 获取世界书名称
                        let bookName = document.getElementById('wfg-book-name').value.trim();
                        if (!bookName) {
                            bookName = file.name.replace(/\.json$/, '');
                        }

                        // 生成HTML卡片
                        let generated = `
                            <div style="font-family:system-ui; padding:12px; background:${colors.bg}; border-radius:8px;">
                                <h4 style="margin:0 0 10px 0; font-size:14px; color:${colors.text};">世界书条目：${escapeHtml(bookName)}</h4>
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

                        // 存入变量
                        const context = window.SillyTavern?.getContext?.();
                        if (context && context.executeSlashCommands) {
                            const escaped = JSON.stringify(generated);
                            context.executeSlashCommands(`/setvar key=world_frontend_html value=${escaped}`);
                        } else {
                            window.world_frontend_html = generated;
                        }
                    } catch (err) {
                        setStatus('JSON解析失败：' + err.message, 'error');
                        console.error(err);
                    }
                };
                reader.readAsText(file);
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

            function setStatus(msg, type = 'info') {
                const el = document.getElementById('wfg-status');
                if (!el) return;
                let color = colors.textMuted;
                if (type === 'success') color = colors.success;
                if (type === 'error') color = colors.danger;
                if (type === 'warning') color = colors.warning;
                el.innerText = msg;
                el.style.color = color;
                setTimeout(() => { el.innerText = ''; }, 3000);
            }
        }

        btn.addEventListener('click', () => {
            if (panel.style.display === 'none' || panel.style.display === '') {
                renderPanel();
                panel.style.display = 'block';
            } else {
                panel.style.display = 'none';
            }
        });

        function escapeHtml(unsafe) {
            if (!unsafe) return '';
            return unsafe
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        console.log('世界书前端生成器（超级兼容版v2）已启动，浮动按钮已添加。');
    }
})();
