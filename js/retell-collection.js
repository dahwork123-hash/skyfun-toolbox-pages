/**
 * 星鴻工具箱 — Retell AI 電話催收介面
 */
(function () {
  'use strict';

  const OPERATOR_KEY = 'retell-operator-name';
  const ADMIN_KEY_STORAGE = 'retell-admin-key';

  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function apiBase() {
    const fixed = (typeof window.NB_TRACKER_API === 'string' && window.NB_TRACKER_API.trim())
      ? window.NB_TRACKER_API.trim().replace(/\/$/, '')
      : '';
    if (fixed) return fixed;
    const h = location.hostname;
    if (h === '127.0.0.1' || h === 'localhost') return `${location.protocol}//${h}:8765`;
    if (location.protocol !== 'file:') return `${location.origin}`;
    return '';
  }

  function adminHeaders() {
    const key = localStorage.getItem(ADMIN_KEY_STORAGE) || '';
    const h = { 'Content-Type': 'application/json' };
    if (key) h['X-Admin-Key'] = key;
    return h;
  }

  async function api(path, options = {}) {
    const base = apiBase();
    if (!base) throw new Error('無法連線 API。請用公司主機開啟網站，或設定 nb-api-config.js');
    const res = await fetch(`${base}${path}`, {
      ...options,
      headers: { ...adminHeaders(), ...(options.headers || {}) }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.detail || `HTTP ${res.status}`);
    return data;
  }

  function statusLabel(status) {
    const map = {
      queued: '排隊中',
      dialing: '撥號中',
      in_progress: '通話中',
      completed: '已接通',
      analyzed: '已分析',
      no_answer: '未接聽',
      busy: '忙線',
      failed: '失敗',
      demo: '示範紀錄',
      pending: '待處理',
      unknown: '未知'
    };
    return map[status] || status || '—';
  }

  function badgeClass(status) {
    return `retell-badge retell-badge--${(status || 'unknown').replace(/\s/g, '_')}`;
  }

  function setStatus(el, text, type) {
    if (!el) return;
    el.hidden = !text;
    el.textContent = text;
    el.className = `retell-status retell-status--${type || 'wait'}`;
  }

  function readForm() {
    return {
      case_id: $('retell-case-id')?.value?.trim() || '',
      tenant_name: $('retell-tenant-name')?.value?.trim() || '',
      tenant_phone: $('retell-tenant-phone')?.value?.trim() || '',
      property_address: $('retell-address')?.value?.trim() || '',
      rent_month: $('retell-rent-month')?.value?.trim() || '',
      rent_amount: $('retell-rent-amount')?.value?.trim() || '',
      overdue_days: $('retell-overdue-days')?.value?.trim() || '',
      pay_deadline: $('retell-pay-deadline')?.value?.trim() || '',
      notes: $('retell-notes')?.value?.trim() || '',
      operator: $('retell-operator')?.value?.trim() || localStorage.getItem(OPERATOR_KEY) || ''
    };
  }

  function fillFromTimeline() {
    try {
      const raw = sessionStorage.getItem('retell-prefill');
      if (!raw) return;
      const p = JSON.parse(raw);
      if (p.overdue_days && $('retell-overdue-days')) $('retell-overdue-days').value = p.overdue_days;
      if (p.pay_deadline && $('retell-pay-deadline')) $('retell-pay-deadline').value = p.pay_deadline;
      if (p.rent_month && $('retell-rent-month')) $('retell-rent-month').value = p.rent_month;
      sessionStorage.removeItem('retell-prefill');
    } catch { /* ignore */ }
  }

  function renderDetail(call) {
    const box = $('retell-detail');
    if (!box) return;
    box.hidden = false;
    box.innerHTML = [
      `案件編號：${escapeHtml(call.case_id || '—')}`,
      `房客：${escapeHtml(call.tenant_name)}（${escapeHtml(call.tenant_phone)}）`,
      `狀態：${escapeHtml(statusLabel(call.status))}`,
      `摘要：${escapeHtml(call.call_summary || '（通話結束後由 Retell 分析填入）')}`,
      `承諾繳款日：${escapeHtml(call.promise_pay_date || '—')}`,
      `結束原因：${escapeHtml(call.disconnection_reason || '—')}`,
      `建立：${escapeHtml(call.created_at || '')}`,
      call.transcript ? `\n—— 逐字稿 ——\n${escapeHtml(call.transcript)}` : ''
    ].join('\n');
  }

  function renderTable(calls) {
    const tbody = $('retell-calls-body');
    if (!tbody) return;
    if (!calls.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="color:#94a3b8;text-align:center">尚無通話紀錄</td></tr>';
      return;
    }
    tbody.innerHTML = calls.map((c) => `
      <tr>
        <td>${escapeHtml((c.created_at || '').replace('T', ' ').slice(0, 16))}</td>
        <td>${escapeHtml(c.tenant_name || '')}</td>
        <td>${escapeHtml(c.tenant_phone || '')}</td>
        <td>${escapeHtml(c.case_id || '—')}</td>
        <td>${escapeHtml(c.rent_amount || '—')}</td>
        <td><span class="${badgeClass(c.status)}">${escapeHtml(statusLabel(c.status))}</span></td>
        <td><button type="button" class="retell-link-btn" data-retell-view="${escapeHtml(c.id)}">詳情</button></td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-retell-view]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          const data = await api(`/api/retell/ui/calls/${btn.getAttribute('data-retell-view')}`);
          renderDetail(data);
        } catch (e) {
          alert(e.message);
        }
      });
    });
  }

  async function refreshCalls() {
    const statusEl = $('retell-list-status');
    try {
      const data = await api('/api/retell/ui/calls?limit=50');
      renderTable(data.calls || []);
      setStatus(statusEl, `已更新 ${new Date().toLocaleTimeString('zh-TW')}`, 'ok');
    } catch (e) {
      setStatus(statusEl, e.message, 'err');
    }
  }

  async function submitCall() {
    const statusEl = $('retell-form-status');
    const btn = $('retell-submit');
    const body = readForm();
    if (!body.tenant_name || !body.tenant_phone) {
      setStatus(statusEl, '請填寫房客姓名與電話', 'err');
      return;
    }
    if (!body.operator) {
      setStatus(statusEl, '請填寫操作人員（租管師姓名）', 'err');
      return;
    }
    localStorage.setItem(OPERATOR_KEY, body.operator);
    btn.disabled = true;
    setStatus(statusEl, '正在發起 AI 催收電話…', 'wait');
    try {
      const data = await api('/api/retell/outbound-call', {
        method: 'POST',
        body: JSON.stringify(body)
      });
      const msg = data.demo
        ? `已建立示範紀錄（請設定 Retell API）。ID：${data.call?.id || ''}`
        : `已發起撥號。ID：${data.call?.id || ''}`;
      setStatus(statusEl, msg, data.demo ? 'wait' : 'ok');
      await refreshCalls();
      if (data.call) renderDetail(data.call);
    } catch (e) {
      setStatus(statusEl, e.message, 'err');
    } finally {
      btn.disabled = false;
    }
  }

  async function checkHealth() {
    const el = $('retell-api-pill');
    if (!el) return;
    try {
      const base = apiBase();
      if (!base) {
        el.textContent = 'API：未設定';
        el.style.background = '#fee2e2';
        return;
      }
      const res = await fetch(`${base}/api/retell/health`);
      const data = await res.json();
      if (data.retell_configured) {
        el.textContent = 'Retell：已設定';
        el.style.background = '#d1fae5';
      } else {
        el.textContent = 'Retell：示範模式';
        el.style.background = '#fef3c7';
      }
    } catch {
      el.textContent = 'API：連線失敗';
      el.style.background = '#fee2e2';
    }
  }

  function bind() {
    $('retell-submit')?.addEventListener('click', submitCall);
    $('retell-refresh')?.addEventListener('click', refreshCalls);
    $('retell-admin-key-save')?.addEventListener('click', () => {
      const v = $('retell-admin-key')?.value?.trim() || '';
      if (v) localStorage.setItem(ADMIN_KEY_STORAGE, v);
      setStatus($('retell-form-status'), v ? '已儲存管理金鑰（本機）' : '已清除', 'ok');
    });

    const op = localStorage.getItem(OPERATOR_KEY);
    if (op && $('retell-operator')) $('retell-operator').value = op;

    fillFromTimeline();
    checkHealth();
    refreshCalls();
    setInterval(refreshCalls, 30000);
  }

  window.retellCollectionInit = bind;
  window.retellPrefillFromTimeline = function (payload) {
    sessionStorage.setItem('retell-prefill', JSON.stringify(payload || {}));
    if (typeof showPage === 'function') showPage('retell-collection');
    else location.hash = 'retell-collection';
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();
