/**
 * 新人業績任務板 — API 在公司主機（見 js/nb-api-config.js）
 * 本機測試：修復並啟動.bat → http://127.0.0.1:8765
 */
(function () {
    'use strict';

    const STORAGE_KEY = 'nb-quest-session-v2';
    const LEGACY_KEY = 'nb-quest-user-v1';

    function officeSelectHtml(selected) {
        if (typeof window.buildSkyfunDepartmentSelectHtml === 'function') {
            return window.buildSkyfunDepartmentSelectHtml(selected);
        }
        const fallback = [
            '北一處', '北二處', '北三處', '基一處', '桃一處', '竹一處', '宜一處',
            '中一處', '中二處', '中三處', '中四處', '中五處', '中六處',
            '彰一處', '嘉一處', '南一處', '南二處', '高一處', '高二處',
            '租賃管理部', '客服部', '客滿部', '財務部'
        ];
        let html = '<option value="">請選擇部門</option>';
        if (selected && !fallback.includes(selected)) {
            html += `<option value="${escapeHtml(selected)}" selected>${escapeHtml(selected)}（舊）</option>`;
        }
        fallback.forEach((o) => {
            html += `<option value="${escapeHtml(o)}"${o === selected ? ' selected' : ''}>${escapeHtml(o)}</option>`;
        });
        return html;
    }
    function apiCandidates() {
        const list = [];
        const fixed = (typeof window.NB_TRACKER_API === 'string' && window.NB_TRACKER_API.trim())
            ? window.NB_TRACKER_API.trim().replace(/\/$/, '')
            : '';
        if (fixed) list.push(fixed);
        if (location.protocol.startsWith('http')) list.push(location.origin);
        list.push('http://127.0.0.1:8765', 'http://localhost:8765');
        list.push('http://127.0.0.1:8787', 'http://localhost:8787');
        const h = location.hostname;
        if (h && h !== '127.0.0.1' && h !== 'localhost') {
            list.push(`${location.protocol}//${h}:8765`);
        }
        return [...new Set(list)];
    }

    let API_BASE = '';

    async function detectApi() {
        for (const base of apiCandidates()) {
            try {
                const ctrl = new AbortController();
                const t = setTimeout(() => ctrl.abort(), 2500);
                const res = await fetch(`${base}/api/health`, { signal: ctrl.signal });
                clearTimeout(t);
                if (res.ok) {
                    API_BASE = base;
                    const health = await res.json().catch(() => ({}));
                    detectApi._version = health.apiVersion;
                    return true;
                }
            } catch { /* try next */ }
        }
        API_BASE = '';
        return false;
    }

    function $(id) { return document.getElementById(id); }

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function loadSession() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
        } catch {
            return null;
        }
    }

    function loadUserId() {
        const s = loadSession();
        if (s?.userId) return s.userId;
        try {
            const o = JSON.parse(localStorage.getItem(LEGACY_KEY) || '{}');
            return o.userId || '';
        } catch {
            return '';
        }
    }

    function saveSession({ userId, name, role, team }) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            userId,
            name: String(name).trim(),
            role,
            team: String(team || '').trim()
        }));
        localStorage.removeItem(LEGACY_KEY);
    }

    function clearSession() {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(LEGACY_KEY);
    }

    async function enterByName(name, role, team, silent) {
        const body = { name, role, team: team || '' };
        let data;
        try {
            data = await api('/api/users/enter', {
                method: 'POST',
                body: JSON.stringify(body)
            });
        } catch (e) {
            if (!String(e.message).includes('404')) throw e;
            data = await api('/api/users/register', {
                method: 'POST',
                body: JSON.stringify(body)
            });
        }
        saveSession({
            userId: data.userId,
            name,
            role,
            team: team || ''
        });
        renderDashboard(data.profile);
        if (!silent) {
            toast(data.isNew ? '已建立任務板，開始打卡吧' : '歡迎回來，繼續衝刺');
        }
        return data;
    }

    function mergeAuthHeaders(extra) {
        const base = { 'Content-Type': 'application/json', ...(extra || {}) };
        if (window.skyfunAuth?.getToken?.()) {
            base.Authorization = `Bearer ${window.skyfunAuth.getToken()}`;
        }
        return base;
    }

    async function api(path, opts = {}) {
        if (!API_BASE) throw new Error('offline');
        const res = await fetch(`${API_BASE}${path}`, {
            headers: mergeAuthHeaders(opts.headers),
            ...opts
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            if (res.status === 404 && path.includes('/enter')) {
                throw new Error('HTTP 404');
            }
            if (res.status === 404) {
                throw new Error('伺服器版本過舊，請關閉黑窗後重新執行「修復並啟動.bat」');
            }
            throw new Error(data.error || `HTTP ${res.status}`);
        }
        return data;
    }

    function fmtNum(n) {
        return Number(n || 0).toLocaleString('zh-TW');
    }

    function roleLabel(role) {
        return role === 'rentmgr' ? '租管師' : '業務';
    }

    function renderLevelBar(level) {
        const pct = level.progressPct ?? 0;
        return `<div class="nq-xp-wrap">
            <div class="nq-xp-meta">
                <span>Lv.${level.level} ${escapeHtml(level.title)}</span>
                <span>${fmtNum(level.xp)} XP</span>
            </div>
            <div class="nq-xp-bar"><div class="nq-xp-fill" style="width:${pct}%"></div></div>
            <div class="nq-xp-hint">${pct < 100 ? `距離下一級還差 ${fmtNum((level.nextThreshold || 0) - level.xp)} XP` : '已達目前最高等級門檻'}</div>
        </div>`;
    }

    function renderQuestCard(q) {
        const pct = q.target ? Math.min(100, Math.round((q.current / q.target) * 100)) : 0;
        const state = q.claimed ? 'claimed' : q.done ? 'done' : '';
        let action = '';
        if (q.canClaim) {
            action = `<button type="button" class="nq-claim-btn" data-quest-id="${escapeHtml(q.id)}" data-period-key="${escapeHtml(q.periodKey)}">領取 +${q.bonusXp} XP</button>`;
        } else if (q.claimed) {
            action = '<span class="nq-quest-tag nq-quest-tag--claimed">已領取</span>';
        } else {
            action = `<span class="nq-quest-tag">${q.current}/${q.target}</span>`;
        }
        return `<article class="nq-quest-card ${state}">
            <div class="nq-quest-top">
                <strong>${escapeHtml(q.title)}</strong>
                ${action}
            </div>
            <div class="nq-quest-bar"><div class="nq-quest-fill" style="width:${pct}%"></div></div>
        </article>`;
    }

    function renderBadges(badges) {
        if (!badges?.length) {
            return '<p class="nq-muted">完成里程碑後徽章會出現在這裡</p>';
        }
        return `<div class="nq-badges">${badges.map((b) =>
            `<div class="nq-badge" title="${escapeHtml(b.desc)}">
                <span class="nq-badge-icon">🏅</span>
                <strong>${escapeHtml(b.title)}</strong>
                <small>${escapeHtml(b.desc)}</small>
            </div>`
        ).join('')}</div>`;
    }

    function renderMetrics(profile) {
        const meta = profile.metricsMeta || {};
        const role = profile.user.role;
        const today = profile.totalsToday || {};
        return Object.entries(meta)
            .filter(([key, m]) => key !== 'quest_bonus' && (!m.roles || m.roles.includes(role)))
            .map(([key, m]) => {
                const count = today[key] || 0;
                return `<button type="button" class="nq-metric-btn" data-metric="${escapeHtml(key)}" title="點一下 +1">
                    <span class="nq-metric-icon">${m.icon || '✓'}</span>
                    <span class="nq-metric-label">${escapeHtml(m.label)}</span>
                    <span class="nq-metric-count">${count}</span>
                    <span class="nq-metric-xp">+${m.xpEach} XP</span>
                </button>`;
            }).join('');
    }

    function renderDashboard(profile) {
        const root = $('page-newbie-quest');
        if (!root) return;
        const main = root.querySelector('[data-nq-main]');
        if (!main) return;

        const u = profile.user;
        main.innerHTML = `
            <header class="nq-hero">
                <div class="nq-hero-top">
                    <div>
                        <h3>${escapeHtml(u.name)}</h3>
                        <p>${roleLabel(u.role)}${u.team ? ` · ${escapeHtml(u.team)}` : ''}</p>
                    </div>
                    <div class="nq-streak" title="連續打卡天數">
                        <span>🔥</span>
                        <strong>${profile.streak}</strong>
                        <small>天</small>
                    </div>
                </div>
                ${renderLevelBar(profile.level)}
            </header>

            <section class="nq-section">
                <h4>⚡ 今日快速打卡</h4>
                <p class="nq-muted">每點一次 +1；長按可一次 +5（電開／591／催收）</p>
                <div class="nq-metrics">${renderMetrics(profile)}</div>
            </section>

            <section class="nq-section nq-section--daily">
                <h4>📅 每日任務</h4>
                <div class="nq-quest-list">${(profile.dailyQuests || []).map(renderQuestCard).join('')}</div>
            </section>

            <section class="nq-section nq-section--weekly">
                <h4>🗓️ 本週任務</h4>
                <div class="nq-quest-list">${(profile.weeklyQuests || []).map(renderQuestCard).join('')}</div>
            </section>

            <section class="nq-section">
                <h4>🏅 徽章</h4>
                ${renderBadges(profile.badges)}
            </section>

            <section class="nq-section nq-totals">
                <h4>📊 本週累計</h4>
                <ul>${Object.entries(profile.totalsWeek || {}).map(([k, v]) => {
                    const label = profile.metricsMeta?.[k]?.label || k;
                    return v ? `<li><span>${escapeHtml(label)}</span><strong>${fmtNum(v)}</strong></li>` : '';
                }).filter(Boolean).join('') || '<li class="nq-muted">尚無紀錄，開始打卡吧</li>'}</ul>
            </section>

            <footer class="nq-footer">
                <button type="button" class="btn btn-sm tone-slate-soft" data-nq-switch-user>換人登入</button>
                <button type="button" class="btn btn-sm tone-slate-soft" data-nq-refresh>重新整理</button>
            </footer>
        `;

        main.querySelectorAll('.nq-metric-btn').forEach((btn) => {
            let holdTimer = null;
            const metric = btn.getAttribute('data-metric');
            const log = (amount) => logMetric(metric, amount).catch(showError);

            btn.addEventListener('click', () => log(1));
            btn.addEventListener('mousedown', () => {
                holdTimer = setTimeout(() => log(5), 600);
            });
            ['mouseup', 'mouseleave'].forEach((ev) => {
                btn.addEventListener(ev, () => clearTimeout(holdTimer));
            });
        });

        main.querySelectorAll('.nq-claim-btn').forEach((btn) => {
            btn.addEventListener('click', async () => {
                try {
                    const profile2 = await api(`/api/users/${u.id}/claim-quest`, {
                        method: 'POST',
                        body: JSON.stringify({
                            questId: btn.getAttribute('data-quest-id'),
                            periodKey: btn.getAttribute('data-period-key')
                        })
                    });
                    renderDashboard(profile2);
                    toast('任務獎勵已領取');
                } catch (e) {
                    showError(e);
                }
            });
        });

        main.querySelector('[data-nq-switch-user]')?.addEventListener('click', () => {
            if (confirm('要換另一位同事登入嗎？')) {
                clearSession();
                showLogin();
            }
        });
        main.querySelector('[data-nq-refresh]')?.addEventListener('click', () => refresh().catch(showError));
    }

    function showError(err) {
        const msg = !API_BASE
            ? '追蹤 API 未連線，請確認公司主機已啟動或 nb-api-config.js 網址正確'
            : (err?.message || '發生錯誤');
        toast(msg, true);
    }

    function isPhoneOnLocalhost() {
        const h = location.hostname;
        return (h === '127.0.0.1' || h === 'localhost') &&
            /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
    }

    function isRemoteStaticHost() {
        const h = location.hostname;
        return location.protocol === 'https:' ||
            (h && h !== '127.0.0.1' && h !== 'localhost' &&
                !/^192\.168\.|^10\.|^172\.(1[6-9]|2\d|3[0-1])\./.test(h));
    }

    function apiStatusHtml(state) {
        if (state === 'ok') {
            return '<p class="nq-status nq-status--ok">✅ 已連線，請輸入姓名後按「進入任務板」</p>';
        }
        if (state === 'old') {
            return '<p class="nq-status nq-status--err">⚠️ 伺服器版本過舊。請 IT 在公司主機重新啟動（server/啟動公司主機.bat）</p>';
        }
        if (state === 'checking') {
            return '<p class="nq-status nq-status--wait">⏳ 正在連線公司主機…</p>';
        }
        const fixedApi = (typeof window.NB_TRACKER_API === 'string' && window.NB_TRACKER_API.trim())
            ? window.NB_TRACKER_API.trim().replace(/\/$/, '')
            : '';
        let extra = '';
        if (fixedApi) {
            extra = `<li>已設定 API：<code>${escapeHtml(fixedApi)}</code>，請確認公司主機有開機且防火牆允許</li>`;
        } else if (isRemoteStaticHost()) {
            extra = '<li>從 Netlify 開啟時，須由 IT 在 <code>js/nb-api-config.js</code> 填入公司主機網址後重新部署</li>';
        } else if (isPhoneOnLocalhost()) {
            extra = '<li class="nq-status-warn"><strong>手機不能用 127.0.0.1</strong>，請改開公司主機網址（向 IT 索取）</li>';
        } else {
            extra = '<li>外縣市請用<strong>公司主機對外網址</strong>；僅本機測試才執行「修復並啟動.bat」</li>';
        }
        return `<div class="nq-status nq-status--err">
            <p><strong>⚠️ 無法連線公司主機</strong></p>
            <ol class="nq-status-steps">
                ${extra}
                <li>公司伺服器：執行 <strong>server/啟動公司主機.bat</strong>，勿關閉視窗</li>
                <li>或直接開 IT 提供的網址，例如 <code>http://公司主機:8765</code></li>
                <li>完成後按「重新連線」</li>
            </ol>
            <button type="button" class="btn btn-sm tone-violet" data-nq-retry>重新連線</button>
        </motion>`;
    }

    function toast(text, isError) {
        let el = document.querySelector('.nq-toast');
        if (!el) {
            el = document.createElement('div');
            el.className = 'nq-toast';
            document.body.appendChild(el);
        }
        el.textContent = text;
        el.classList.toggle('is-error', !!isError);
        el.classList.add('is-visible');
        clearTimeout(el._t);
        el._t = setTimeout(() => el.classList.remove('is-visible'), 2800);
    }

    async function logMetric(metric, amount) {
        const userId = loadUserId();
        if (!userId) return showLogin();
        const profile = await api(`/api/users/${userId}/log`, {
            method: 'POST',
            body: JSON.stringify({ metric, amount })
        });
        renderDashboard(profile);
    }

    function bindRetryButton(scope) {
        scope?.querySelector('[data-nq-retry]')?.addEventListener('click', () => {
            updateApiStatus().then(() => {
                if (API_BASE) toast('已連線，可以登入了');
            });
        });
    }

    async function updateApiStatus() {
        const el = document.querySelector('[data-nq-api-status]');
        if (!el) return;
        el.innerHTML = apiStatusHtml('checking');
        bindRetryButton(el);
        const ok = await detectApi();
        const state = ok ? (detectApi._version >= 2 ? 'ok' : 'old') : 'err';
        el.innerHTML = apiStatusHtml(state);
        bindRetryButton(el);
        const submit = $('nq-reg-submit');
        if (submit) submit.disabled = !ok || state === 'old';
    }

    function showLogin() {
        const root = $('page-newbie-quest');
        if (!root) return;
        const main = root.querySelector('[data-nq-main]');
        if (!main) return;
        const prev = loadSession();
        const defName = escapeHtml(prev?.name || '');
        const defTeam = escapeHtml(prev?.team || '');
        const defRole = prev?.role || 'business';
        main.innerHTML = `
            <section class="nq-register">
                <h3>🎮 業績任務板</h3>
                <p>用<strong>姓名</strong>登入；電腦、手機輸入相同姓名＋角色為<strong>同一筆</strong>紀錄。</p>
                <div data-nq-api-status>${apiStatusHtml('checking')}</div>
                <label>姓名<input type="text" id="nq-reg-name" placeholder="王小明" maxlength="30" value="${defName}" /></label>
                <label>部門
                    <select id="nq-reg-team">${officeSelectHtml(defTeam)}</select>
                </label>
                <label>角色
                    <select id="nq-reg-role">
                        <option value="business"${defRole === 'business' ? ' selected' : ''}>業務 — 電開／591／場勘／委租</option>
                        <option value="rentmgr"${defRole === 'rentmgr' ? ' selected' : ''}>租管師 — 催收／續約／送審</option>
                    </select>
                </label>
                <button type="button" class="btn btn-block tone-amber" id="nq-reg-submit" disabled>進入任務板</button>
            </section>
        `;
        bindRetryButton(main);
        updateApiStatus();

        $('nq-reg-submit')?.addEventListener('click', async () => {
            const name = $('nq-reg-name')?.value?.trim();
            const role = $('nq-reg-role')?.value;
            const team = $('nq-reg-team')?.value?.trim() || '';
            if (!name) return toast('請輸入姓名', true);
            if (!API_BASE) {
                await updateApiStatus();
                return showError(new Error());
            }
            try {
                await enterByName(name, role, team, false);
            } catch (e) {
                showError(e);
            }
        });
    }

    async function refresh() {
        const session = loadSession();
        if (session?.name && session?.role && API_BASE) {
            try {
                await enterByName(session.name, session.role, session.team, true);
                return;
            } catch { /* fallback */ }
        }
        const userId = loadUserId();
        if (!userId) return showLogin();
        if (!API_BASE) return showLogin();
        const profile = await api(`/api/users/${userId}`);
        saveSession({
            userId,
            name: profile.user.name,
            role: profile.user.role,
            team: profile.user.team || ''
        });
        renderDashboard(profile);
    }

    function init() {
        const root = $('page-newbie-quest');
        if (!root) return;
        document.addEventListener('skyfun-auth-invalidated', () => {
            clearSession();
            if (root && !root.classList.contains('hidden')) showLogin();
        });
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && root && !root.classList.contains('hidden')) {
                refresh().catch(() => {});
            }
        });
    }

    async function refreshFromGlobalAuth() {
        const gu = window.skyfunAuth?.getUser?.();
        const token = window.skyfunAuth?.getToken?.();
        if (!gu?.id || !token) return false;
        const profile = await api(`/api/users/${gu.id}`);
        saveSession({
            userId: gu.id,
            name: profile.user.name,
            role: profile.user.role,
            team: profile.user.team || '',
            jobTitle: gu.jobTitle || profile.user.jobTitle || ''
        });
        renderDashboard(profile);
        return true;
    }

    window.nbQuestInit = async function () {
        await detectApi();
        if (!API_BASE) {
            showLogin();
            return;
        }
        try {
            if (window.skyfunAuth?.isReady?.()) {
                const ok = await refreshFromGlobalAuth();
                if (ok) return;
            }
            await refresh();
        } catch {
            showLogin();
        }
    };

    init();
})();
