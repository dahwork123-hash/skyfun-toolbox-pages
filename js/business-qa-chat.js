/**
 * 業務問答聊天：站內知識庫即時回答；可選伺服器 AI（OPENAI_API_KEY）
 */
(function () {
    'use strict';

    const SUGGESTIONS = [
        '我要去場勘該注意什麼？',
        '我現在要解約該怎麼做？',
        '包租跟代租差在哪？',
        '修繕獎勵費上限多少？',
        '欠租催收第一步要做什麼？',
        '續約要注意什麼？',
    ];

    let panelOpen = false;
    let busy = false;
    let aiEnabled = null;

    async function apiBase() {
        if (typeof window.loadNbApiBase === 'function') {
            return window.loadNbApiBase();
        }
        return (typeof window.NB_TRACKER_API === 'string' ? window.NB_TRACKER_API : '').replace(/\/$/, '');
    }

    function escapeHtml(s) {
        return String(s || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function formatMessageHtml(text) {
        const escaped = escapeHtml(text);
        return escaped
            .replace(/【([^】]+)】/g, '<strong class="bqa-section-head">$1</strong>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }

    function getRole() {
        const sel = document.getElementById('bqa-role');
        const v = sel ? sel.value : 'all';
        return v === 'all' ? null : v;
    }

    function scrollMessagesToBottom(force) {
        const box = document.getElementById('bqa-messages');
        if (!box) return;
        const gap = box.scrollHeight - box.scrollTop - box.clientHeight;
        if (!force && gap > 140) return;
        requestAnimationFrame(() => {
            box.scrollTo({ top: box.scrollHeight, behavior: force ? 'smooth' : 'auto' });
        });
    }

    function focusChatInput() {
        const input = document.getElementById('bqa-input');
        if (!input) return;
        try {
            input.focus({ preventScroll: true });
        } catch {
            input.focus();
        }
    }

    function appendMessage(role, html, extraClass) {
        const box = document.getElementById('bqa-messages');
        if (!box) return;
        const div = document.createElement('div');
        div.className = `bqa-msg bqa-msg--${role}${extraClass ? ` ${extraClass}` : ''}`;
        div.innerHTML = html;
        box.appendChild(div);
        scrollMessagesToBottom(true);
    }

    function appendUserMessage(text) {
        appendMessage('user', `<div class="bqa-msg-bubble">${escapeHtml(text)}</div>`);
    }

    function appendBotMessage(text, links, meta) {
        let linkHtml = '';
        if (links && links.length) {
            linkHtml =
                '<div class="bqa-msg-links">' +
                links
                    .map(
                        (l) =>
                            `<button type="button" class="bqa-link-btn" data-bqa-page="${escapeHtml(l.page)}">${escapeHtml(l.title)} →</button>`
                    )
                    .join('') +
                '</div>';
        }
        const badge = meta ? `<span class="bqa-msg-meta">${escapeHtml(meta)}</span>` : '';
        appendMessage(
            'bot',
            `${badge}<div class="bqa-msg-bubble">${formatMessageHtml(text)}</div>${linkHtml}`
        );
        document.querySelectorAll('[data-bqa-page]').forEach((btn) => {
            if (btn.dataset.bqaBound) return;
            btn.dataset.bqaBound = '1';
            btn.addEventListener('click', () => {
                const page = btn.getAttribute('data-bqa-page');
                if (page && typeof window.showPage === 'function') {
                    window.showPage(page);
                    setPanelOpen(false);
                }
            });
        });
    }

    function setTyping(on) {
        const el = document.getElementById('bqa-typing');
        if (el) el.classList.toggle('hidden', !on);
        if (on) scrollMessagesToBottom(true);
    }

    function setPanelOpen(open) {
        panelOpen = open;
        const panel = document.getElementById('bqa-panel');
        const fab = document.getElementById('bqa-fab');
        const root = document.getElementById('bqa-root');
        if (panel) panel.classList.toggle('hidden', !open);
        if (fab) fab.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (root) {
            root.setAttribute('aria-hidden', open ? 'false' : 'true');
            root.classList.toggle('bqa-root--open', open);
        }
        if (open) {
            if (typeof window.nbRefreshKnowledgeIndex === 'function') {
                window.nbRefreshKnowledgeIndex();
            }
            refreshAiStatus();
            requestAnimationFrame(() => focusChatInput());
        }
    }

    async function refreshAiStatus() {
        const hint = document.getElementById('bqa-ai-hint');
        if (!hint) return;
        try {
            const res = await fetch(`${await apiBase()}/api/chat/status`, { signal: AbortSignal.timeout(4000) });
            if (!res.ok) throw new Error('status');
            const data = await res.json();
            aiEnabled = !!data.aiEnabled;
            hint.textContent = aiEnabled
                ? '已啟用 AI 增強（回答會參考站內資料）'
                : '目前為站內知識庫模式；若要 AI 請管理者在伺服器設定 OPENAI_API_KEY';
            hint.classList.toggle('bqa-ai-hint--on', aiEnabled);
        } catch {
            aiEnabled = false;
            hint.textContent = '站內知識庫模式（開放題請含關鍵字；完整 AI 請執行「啟動雲端API主機」）';
            hint.classList.remove('bqa-ai-hint--on');
        }
    }

    function friendlyAiErrorMessage(err) {
        const m = String(err?.message || err || '');
        if (/額度|quota|billing|insufficient_quota/i.test(m)) {
            return 'OpenAI 帳戶額度已用完，請管理者至 platform.openai.com 儲值或檢查帳單。';
        }
        if (/invalid_api_key|金鑰無效/i.test(m)) {
            return 'API 金鑰無效，請管理者更新設定。';
        }
        if (/rate limit|過於頻繁/i.test(m)) {
            return '請求過於頻繁，請稍後再試。';
        }
        if (m.length > 80) return 'AI 暫時無法使用，以下為站內教材整理。';
        return m || 'AI 暫時無法連線';
    }

    async function fetchAiAnswer(query, role, context) {
        const headers = { 'Content-Type': 'application/json' };
        if (window.skyfunAuth?.getToken?.()) {
            headers.Authorization = `Bearer ${window.skyfunAuth.getToken()}`;
        }
        const res = await fetch(`${await apiBase()}/api/chat`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ message: query, role: role || 'all', context }),
            signal: AbortSignal.timeout(45000),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) throw new Error(data.error || 'AI 無法回應');
        return data.reply;
    }

    async function handleSend() {
        if (busy) return;
        const input = document.getElementById('bqa-input');
        const query = (input?.value || '').trim();
        if (!query) return;

        busy = true;
        const sendBtn = document.getElementById('bqa-send');
        if (sendBtn) sendBtn.disabled = true;
        if (input) input.value = '';

        appendUserMessage(query);
        scrollMessagesToBottom(true);
        setTyping(true);

        const role = getRole();
        const searchFn = typeof window.nbSearchKnowledge === 'function' ? window.nbSearchKnowledge : () => [];
        const composeFn = typeof window.nbComposeLocalAnswer === 'function' ? window.nbComposeLocalAnswer : () => ({ text: '知識庫尚未載入，請重新整理頁面。', links: [] });

        if (typeof window.nbRefreshKnowledgeIndex === 'function') window.nbRefreshKnowledgeIndex();
        let hits = searchFn(query, role);
        if (!hits.length || (hits.length === 1 && hits[0].type === 'playbook')) {
            const broader = searchFn(query, null);
            const seen = new Set(hits.map((h) => `${h.type}|${h.title}`));
            broader.forEach((h) => {
                const k = `${h.type}|${h.title}`;
                if (!seen.has(k)) {
                    seen.add(k);
                    hits.push(h);
                }
            });
            hits = hits.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 6);
        }
        const context = hits.map((h) => ({ title: h.title, text: [h.text, h.when].filter(Boolean).join(' ') }));
        const local = composeFn(query, hits);

        let answered = false;

        if (aiEnabled === null) await refreshAiStatus();

        if (aiEnabled) {
            try {
                const aiContext = context.length > 0 ? context.slice(0, 8) : [];
                const aiText = await fetchAiAnswer(query, role, aiContext);
                appendBotMessage(aiText, local.links, 'AI 回答');
                answered = true;
            } catch (err) {
                const aiNote = friendlyAiErrorMessage(err);
                if (local.links.length || !local.text.includes('沒有直接對應')) {
                    appendBotMessage(
                        `${local.text}\n\n【提醒】${aiNote}`,
                        local.links,
                        '站內知識庫'
                    );
                    answered = true;
                }
            }
        }

        if (!answered) {
            appendBotMessage(local.text, local.links, '站內知識庫');
        }

        setTyping(false);
        busy = false;
        if (sendBtn) sendBtn.disabled = false;
        focusChatInput();
    }

    function bindSuggestions() {
        document.querySelectorAll('[data-bqa-suggest]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const input = document.getElementById('bqa-input');
                if (input) input.value = btn.getAttribute('data-bqa-suggest') || '';
                handleSend();
            });
        });
    }

    function injectWidget() {
        if (document.getElementById('bqa-root')) return;

        const root = document.createElement('div');
        root.id = 'bqa-root';
        root.className = 'bqa-root';
        root.setAttribute('aria-hidden', 'true');
        root.innerHTML = `
            <button type="button" id="bqa-fab" class="bqa-fab" aria-label="業務問答助手" aria-expanded="false" title="業務問答">
                <span class="bqa-fab-icon" aria-hidden="true">💬</span>
                <span class="bqa-fab-label">業務問答</span>
            </button>
            <div id="bqa-panel" class="bqa-panel hidden" role="dialog" aria-labelledby="bqa-title">
                <header class="bqa-header">
                    <div>
                        <h2 id="bqa-title" class="bqa-title">業務問答助手</h2>
                        <p id="bqa-ai-hint" class="bqa-ai-hint">載入中…</p>
                    </div>
                    <button type="button" id="bqa-close" class="bqa-close" aria-label="關閉">×</button>
                </header>
                <div class="bqa-body">
                    <div id="bqa-messages" class="bqa-messages">
                    <div class="bqa-msg bqa-msg--bot">
                        <span class="bqa-msg-meta">歡迎</span>
                        <div class="bqa-msg-bubble">我是站內業務助教，會用白話整理重點（不是貼長條文）。可問包租代管、補助、公證、續約等，輸入問題或點下方快捷問題。</div>
                    </div>
                    <div class="bqa-suggestions">
                        ${SUGGESTIONS.map((s) => `<button type="button" class="bqa-suggest-chip" data-bqa-suggest="${escapeHtml(s)}">${escapeHtml(s)}</button>`).join('')}
                    </div>
                        <div id="bqa-typing" class="bqa-typing hidden" aria-live="polite">正在整理回答…</div>
                    </div>
                </div>
                <footer class="bqa-footer">
                    <label class="bqa-role-label">
                        <span>身份</span>
                        <select id="bqa-role" class="bqa-role-select">
                            <option value="all">全部</option>
                            <option value="business" selected>業務</option>
                            <option value="rentmgr">租管師</option>
                        </select>
                    </label>
                    <div class="bqa-input-row">
                        <textarea id="bqa-input" class="bqa-input" rows="2" placeholder="例如：第五期修繕獎勵上限？" maxlength="500"></textarea>
                        <button type="button" id="bqa-send" class="bqa-send">送出</button>
                    </div>
                </footer>
            </div>`;

        document.body.appendChild(root);

        document.getElementById('bqa-fab')?.addEventListener('click', () => setPanelOpen(!panelOpen));
        document.getElementById('bqa-close')?.addEventListener('click', () => setPanelOpen(false));
        document.getElementById('bqa-send')?.addEventListener('click', handleSend);
        document.getElementById('bqa-input')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        });

        bindSuggestions();

        document.getElementById('nb-hub-open-qa')?.addEventListener('click', () => {
            setPanelOpen(true);
        });
    }

    function init() {
        injectWidget();
        const refreshKb = () => {
            if (typeof window.nbRefreshKnowledgeIndex === 'function') window.nbRefreshKnowledgeIndex();
        };
        if (document.readyState === 'complete') refreshKb();
        else window.addEventListener('load', refreshKb, { once: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
