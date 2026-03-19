// world-frontend-generator/index.js
// 世界书摘要生成器 - 暗红高级版
// 功能：生成结构化JSON摘要，供AI理解世界书内容

(function() {
    console.log('世界书摘要生成器加载中...');

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        if (document.getElementById('wfg-toggle-btn')) return;

        // ================== 暗红色系配色 ==================
        const colors = {
            bg: '#1a0c0c',           // 深红黑背景
            panelBg: '#2a1a1a',       // 面板背景
            border: '#5a3a3a',         // 边框
            text: '#f0d0d0',           // 主文字（淡红白）
            textMuted: '#b09090',       // 辅助文字
            accent: '#b34444',          // 主色（暗红）
            accentHover: '#c55555',
            danger: '#d46b6b',
            success: '#8b6b4b',
            warning: '#c99a3b'
        };

        // ================== 创建悬浮按钮 ==================
        const btn = document.createElement('div');
        btn.id = 'wfg-toggle-btn';
        btn.innerHTML = '📜 世界书摘要';
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
            boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
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
            width: '440px',
            maxHeight: '600px',
            overflowY: 'auto',
            backgroundColor: colors.panelBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            padding: '20px',
            zIndex: '10002',
            boxShadow: '0 12px 28px rgba(0,0,0,0.8)',
            display: 'none',
            fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
            color: colors.text,
            fontSize: '13px',
            lineHeight: '1.5'
        });
        document.body.appendChild(panel);

        // ================== 存储输入框历史快照 ==================
        let lastTextareaState = '';

        // ================== 渲染面板 ==================
        function renderPanel() {
            panel.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                    <h3 style="margin:0; font-size:18px; font-weight:500; letter-spacing:1px; color:${colors.accent};">📖 世界书摘要</h3>
                    <span id="wfg-close" style="cursor:pointer; font-size:22px; color:${colors.textMuted};">&times;</span>
                </div>
                <div style="margin-bottom:20px;">
                    <label style="display:block; margin-bottom:8px; color:${colors.textMuted};">📁 上传世界书JSON</label>
                    <div style="display:flex; gap:8px;">
                        <button id="wfg-file-button" style="flex:1; padding:8px 12px; background-color:${colors.bg}; border:1px solid ${colors.border}; border-radius:8px; color:${colors.text}; cursor:pointer;">选择文件</button>
                        <span id="wfg-file-name" style="flex:2; padding:8px 0; color:${colors.textMuted}; overflow:hidden; text-overflow:ellipsis;">未选择</span>
                    </div>
                    <input type="file" id="wfg-file-input" accept=".json" style="display:none;">
                </div>
                <div style="margin-bottom:20px;">
                    <label style="display:block; margin-bottom:8px; color:${colors.textMuted};">📝 生成的摘要（可编辑）</label>
                    <textarea id="wfg-summary" rows="8" style="width:100%; padding:10px; background-color:${colors.bg}; border:1px solid ${colors.border}; border-radius:8px; color:${colors.text}; font-family:monospace; font-size:12px; resize:vertical;" placeholder="摘要将显示在这里..." readonly></textarea>
                </div>
                <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:16px;">
                    <button id="wfg-copy" class="wfg-btn" style="background:${colors.accent};">📋 复制摘要</button>
                    <button id="wfg-append-top" class="wfg-btn" style="background:${colors.accent};">⬆️ 追加到顶部</button>
                    <button id="wfg-append-bottom" class="wfg-btn" style="background:${colors.accent};">⬇️ 追加到底部</button>
                    <button id="wfg-send" class="wfg-btn" style="background:${colors.danger};">📤 发送</button>
                    <button id="wfg-undo" class="wfg-btn" style="background:${colors.border};">↩️ 撤销</button>
                </div>
                <div id="wfg-status" style="margin-top:8px; font-size:12px; color:${colors.success};"></div>
            `;

            // 添加按钮统一样式
            const style = document.createElement('style');
            style.textContent = `
                .wfg-btn {
                    flex:1 0 auto;
                    padding:8px 12px;
                    border:none;
                    border-radius:6px;
                    color:white;
                    font-weight:500;
                    cursor:pointer;
                    transition:all 0.2s;
                    min-width:70px;
                }
                .wfg-btn:hover {
                    filter: brightness(1.2);
                }
            `;
            panel.appendChild(style);

            // 绑定事件
            document.getElementById('wfg-close').addEventListener('click', () => {
                panel.style.display = 'none';
            });

            // 文件选择
            const fileButton = document.getElementById('wfg-file-button');
            const fileInput = document.getElementById('wfg-file-input');
            const fileNameSpan = document.getElementById('wfg-file-name');
            fileButton.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', () => {
                if (fileInput.files.length) {
                    fileNameSpan.textContent = fileInput.files[0].name;
                    fileNameSpan.style.color = colors.text;
                } else {
                    fileNameSpan.textContent = '未选择';
                    fileNameSpan.style.color = colors.textMuted;
                }
            });

            // 生成摘要（在文件选择后自动触发，但这里用生成按钮替代？简化：当文件选择后，点击某个按钮生成？我们直接在文件选择后解析？不行，需要用户确认。为了简单，我们提供一个“生成”按钮，但面板上暂无，我们可以在文件选择后立即生成？用户可能希望控制生成时机。我们添加一个隐式生成：当文件选择后，自动解析并填充摘要。这样少一个按钮。
            // 修改：在文件选择后自动解析
            fileInput.addEventListener('change', () => {
                const file = fileInput.files[0];
                if (!file) return;
                parseFile(file);
            });

            function parseFile(file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const json = JSON.parse(e.target.result);
                        console.log('原始JSON:', json);

                        // 提取条目数组
                        let entries = [];
                        if (Array.isArray(json)) {
                            entries = json;
                        } else if (json.entries && Array.isArray(json.entries)) {
                            entries = json.entries;
                        } else if (json.entries && typeof json.entries === 'object') {
                            entries = Object.values(json.entries);
                        } else if (json.originalData && Array.isArray(json.originalData.entries)) {
                            entries = json.originalData.entries;
                        } else {
                            const values = Object.values(json);
                            if (values.length && values[0]?.keys) entries = values;
                        }

                        console.log('提取条目数:', entries.length);

                        // 构建摘要（简洁JSON数组）
                        const summaryItems = [];
                        entries.forEach(entry => {
                            let keys = [];
                            if (Array.isArray(entry.keys)) keys = entry.keys;
                            else if (Array.isArray(entry.key)) keys = entry.key;
                            else if (Array.isArray(entry.keywords)) keys = entry.keywords;
                            else if (Array.isArray(entry.tags)) keys = entry.tags;
                            else if (typeof entry.keys === 'string') keys = [entry.keys];
                            else if (typeof entry.key === 'string') keys = [entry.key];

                            const content = entry.content || entry.entry || entry.text || '';
                            if (keys.length) {
                                summaryItems.push({
                                    k: keys,           // 关键词数组
                                    c: content.substring(0, 200) // 内容截断200字符，避免过长
                                });
                            }
                        });

                        // 生成JSON字符串（无多余空格，便于AI解析）
                        const summaryJSON = JSON.stringify(summaryItems);
                        document.getElementById('wfg-summary').value = summaryJSON;
                        setStatus(`✅ 已生成摘要，共 ${summaryItems.length} 条`, 'success');
                    } catch (err) {
                        setStatus('解析失败：' + err.message, 'error');
                    }
                };
                reader.readAsText(file);
            }

            // 复制摘要
            document.getElementById('wfg-copy').addEventListener('click', () => {
                const summary = document.getElementById('wfg-summary').value;
                if (!summary) {
                    setStatus('没有摘要可复制', 'warning');
                    return;
                }
                navigator.clipboard.writeText(summary).then(() => {
                    setStatus('📋 摘要已复制', 'success');
                }).catch(() => {
                    setStatus('复制失败', 'error');
                });
            });

            // 保存当前输入框状态
            function saveState() {
                lastTextareaState = document.getElementById('send_textarea').value;
            }

            // 追加到顶部
            document.getElementById('wfg-append-top').addEventListener('click', () => {
                const summary = document.getElementById('wfg-summary').value;
                if (!summary) {
                    setStatus('没有摘要可追加', 'warning');
                    return;
                }
                saveState();
                const textarea = document.getElementById('send_textarea');
                const current = textarea.value;
                const placeholder = '\n\n【你的要求】\n\n';
                textarea.value = summary + placeholder + current;
                setStatus('已追加到顶部', 'success');
            });

            // 追加到底部
            document.getElementById('wfg-append-bottom').addEventListener('click', () => {
                const summary = document.getElementById('wfg-summary').value;
                if (!summary) {
                    setStatus('没有摘要可追加', 'warning');
                    return;
                }
                saveState();
                const textarea = document.getElementById('send_textarea');
                const current = textarea.value;
                const placeholder = '\n\n【你的要求】\n\n';
                textarea.value = current + placeholder + summary;
                setStatus('已追加到底部', 'success');
            });

            // 发送（二次确认）
            document.getElementById('wfg-send').addEventListener('click', () => {
                const textarea = document.getElementById('send_textarea');
                const content = textarea.value;
                if (!content.trim()) {
                    setStatus('输入框为空', 'warning');
                    return;
                }
                if (confirm('确定要发送当前输入框内容吗？')) {
                    saveState();
                    // 触发发送（模拟点击发送按钮）
                    const sendButton = document.getElementById('send_but');
                    if (sendButton) {
                        sendButton.click();
                        setStatus('已发送', 'success');
                    } else {
                        setStatus('找不到发送按钮', 'error');
                    }
                }
            });

            // 撤销
            document.getElementById('wfg-undo').addEventListener('click', () => {
                if (lastTextareaState !== undefined) {
                    document.getElementById('send_textarea').value = lastTextareaState;
                    setStatus('已撤销', 'success');
                } else {
                    setStatus('没有可撤销的状态', 'warning');
                }
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

        console.log('世界书摘要生成器已启动');
    }
})();
