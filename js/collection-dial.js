/**
 * 催收試算表 · Retell 手動撥號（含篩選、排序）
 */
(function () {
  'use strict';

  let allRows = [];
  let listMeta = { source: '', lastSyncAt: '', count: 0 };
  let sortKey = 'overdueDays';
  let sortDir = 'desc';
  let currentPage = 1;
  const PAGE_SIZE = 20;

  function $(id) { return document.getElementById(id); }

  function authHeaders() {
    const h = { 'Content-Type': 'application/json' };
    const token = window.skyfunAuth?.getToken?.();
    if (token) h.Authorization = 'Bearer ' + token;
    return h;
  }

  async function apiBase() {
    if (typeof window.loadNbApiBase === 'function') {
      return window.loadNbApiBase();
    }
    return String(window.NB_TRACKER_API || '').trim().replace(/\/$/, '');
  }

  async function parseJson(r) {
    const text = await r.text();
    try { return JSON.parse(text); } catch { throw new Error('API 回傳非 JSON'); }
  }

  function setStatus(msg, isErr) {
    const el = $('collection-dial-status');
    if (!el) return;
    el.textContent = msg || '';
    el.className = 'text-sm mt-3 text-center ' + (isErr ? 'text-rose-700 font-semibold' : 'text-slate-600');
  }

  function esc(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function fmtMoney(v) {
    const n = Number(String(v).replace(/[^\d.-]/g, ''));
    return Number.isFinite(n) ? n.toLocaleString('zh-TW') : esc(v);
  }

  function fmtPhone(v) {
    const d = String(v ?? '').replace(/\D/g, '');
    if (!d) return '';
    if (d.startsWith('886') && d.length >= 11) return '0' + d.slice(3);
    if (d.length === 9 && d.startsWith('9')) return '0' + d;
    if (d.length === 10 && d.startsWith('09')) return d;
    return d;
  }

  function fmtDueDate(v) {
    if (v == null || v === '') return '';
    const s = String(v);
    if (s.includes('T')) {
      const d = new Date(s);
      if (!Number.isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}/${m}/${day}`;
      }
    }
    return s.replace(/T[\s\S]*$/, '');
  }

  function formatSyncAt(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso).replace(/T[\s\S]*$/, '');
    return d.toLocaleString('zh-TW', { hour12: false });
  }

  function listMetaSuffix() {
    const parts = [];
    if (listMeta.lastSyncAt) parts.push(`RPA 同步 ${formatSyncAt(listMeta.lastSyncAt)}`);
    if (listMeta.source) parts.push(listMeta.source === 'listCollection' ? '試算表完整清單' : '試算表（舊版 API）');
    return parts.length ? ` · ${parts.join(' · ')}` : '';
  }

  function rowKey(r) {
    return [r.caseId, r.dueDate, r.tenantPhone].join('|');
  }

  function extractRegionFromAddress(address) {
    const s = String(address || '').trim();
    const m = s.match(/^(?:台|臺)?[^市縣]+[市縣]/);
    if (!m) return '';
    return m[0].replace(/^台/, '臺');
  }

  function getFilters() {
    return {
      q: ($('collection-dial-filter-q')?.value || '').trim().toLowerCase(),
      minDays: Math.max(0, Number($('collection-dial-filter-min-days')?.value) || 0),
      region: $('collection-dial-filter-region')?.value || ''
    };
  }

  function hasActiveFilters() {
    const f = getFilters();
    return !!(f.q || f.minDays > 0 || f.region);
  }

  function compareRows(a, b) {
    const mul = sortDir === 'asc' ? 1 : -1;
    if (sortKey === 'overdueDays' || sortKey === 'amount') {
      const na = Number(String(a[sortKey]).replace(/[^\d.-]/g, '')) || 0;
      const nb = Number(String(b[sortKey]).replace(/[^\d.-]/g, '')) || 0;
      return (na - nb) * mul;
    }
    if (sortKey === 'dueDate') {
      const ta = Date.parse(String(a.dueDate)) || 0;
      const tb = Date.parse(String(b.dueDate)) || 0;
      if (ta !== tb) return (ta - tb) * mul;
      return String(a.dueDate || '').localeCompare(String(b.dueDate || ''), 'zh-Hant') * mul;
    }
    return String(a[sortKey] || '').localeCompare(String(b[sortKey] || ''), 'zh-Hant') * mul;
  }

  function applyFiltersAndSort(data) {
    const f = getFilters();
    let list = data.slice();
    if (f.q) {
      list = list.filter((r) => {
        const hay = [
          r.tenantName, r.tenantPhone, r.address, r.caseId, r.manager, r.contractType
        ].join(' ').toLowerCase();
        return hay.includes(f.q);
      });
    }
    if (f.minDays > 0) {
      list = list.filter((r) => Number(r.overdueDays) >= f.minDays);
    }
    if (f.region) {
      list = list.filter((r) => extractRegionFromAddress(r.address) === f.region);
    }
    list.sort(compareRows);
    return list;
  }

  function fillFilterOptions() {
    const regionSel = $('collection-dial-filter-region');
    if (!regionSel) return;

    const regions = [...new Set(
      allRows.map((r) => extractRegionFromAddress(r.address)).filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, 'zh-Hant'));

    const cur = regionSel.value;
    regionSel.innerHTML = '<option value="">地區（全部）</option>' +
      regions.map((t) => `<option value="${esc(t)}">${esc(t)}</option>`).join('');
    if (regions.includes(cur)) regionSel.value = cur;
  }

  function updateSortIndicators() {
    document.querySelectorAll('.collection-dial-sort-ind').forEach((el) => {
      const col = el.getAttribute('data-col');
      el.textContent = col === sortKey ? (sortDir === 'asc' ? '▲' : '▼') : '';
    });
    document.querySelectorAll('.collection-dial-sort-th').forEach((btn) => {
      btn.classList.toggle('is-active', btn.getAttribute('data-sort') === sortKey);
    });
  }

  function updatePager(total) {
    const pager = $('collection-dial-pager');
    const info = $('collection-dial-page-info');
    const prev = $('collection-dial-prev');
    const next = $('collection-dial-next');
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;
    if (pager) pager.classList.toggle('hidden', total <= PAGE_SIZE);
    if (info) {
      const from = total ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
      const to = Math.min(currentPage * PAGE_SIZE, total);
      info.textContent = total ? `第 ${currentPage} / ${totalPages} 頁（${from}–${to}，每頁 ${PAGE_SIZE} 筆）` : '';
    }
    if (prev) prev.disabled = currentPage <= 1;
    if (next) next.disabled = currentPage >= totalPages || total === 0;
  }

  function renderTable() {
    const body = $('collection-dial-tbody');
    const empty = $('collection-dial-empty');
    if (!body) return;

    const filtered = applyFiltersAndSort(allRows);
    updateSortIndicators();
    updatePager(filtered.length);

    if (!filtered.length) {
      body.innerHTML = '';
      if (empty) {
        empty.classList.remove('hidden');
        empty.textContent = allRows.length
          ? '沒有符合篩選條件的資料'
          : '尚無資料（請確認 RPA 已推送試算表）';
      }
      const pendingOnly = $('collection-dial-pending-only')?.checked;
      const suffix = pendingOnly ? '（僅待撥，與試算表「全部」可能不同）' : '（與試算表同步）';
      if (allRows.length) {
        setStatus(`顯示 0 / 共 ${allRows.length} 筆${suffix}${hasActiveFilters() ? ' · 請調整篩選' : ''}${listMetaSuffix()}`);
      }
      return;
    }
    if (empty) empty.classList.add('hidden');

    const start = (currentPage - 1) * PAGE_SIZE;
    const pageRows = filtered.slice(start, start + PAGE_SIZE);

    body.innerHTML = pageRows.map((r) => {
      const key = rowKey(r);
      const phone = fmtPhone(r.tenantPhone);
      const pending = !r.callStatus || r.callStatus === '待撥';
      const btn = pending
        ? `<button type="button" class="btn btn-sm tone-indigo collection-dial-call" data-key="${esc(key)}" ${phone ? '' : 'disabled title="無電話"'}>📞 撥號</button>`
        : `<span class="text-xs text-slate-500">${esc(r.callStatus)}</span>`;
      return `<tr class="border-b border-slate-100">
        <td class="py-2 px-2 text-xs">${esc(r.tenantName)}</td>
        <td class="py-2 px-2 text-xs font-mono">${esc(phone)}</td>
        <td class="py-2 px-2 text-xs text-rose-700 font-bold">${esc(r.overdueDays)}</td>
        <td class="py-2 px-2 text-xs tabular-nums">${fmtMoney(r.amount)}</td>
        <td class="py-2 px-2 text-xs max-w-[10rem] truncate" title="${esc(r.address)}">${esc(r.address)}</td>
        <td class="py-2 px-2 text-xs whitespace-nowrap">${esc(fmtDueDate(r.dueDate))}</td>
        <td class="py-2 px-2 text-xs">${btn}</td>
      </tr>`;
    }).join('');

    body.querySelectorAll('.collection-dial-call').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-key');
        const row = allRows.find((r) => rowKey(r) === key);
        if (row) dialOne(row, btn);
      });
    });

    const pendingOnly = $('collection-dial-pending-only')?.checked;
    const suffix = pendingOnly ? '（僅待撥，與試算表「全部」可能不同）' : '（與試算表同步）';
    const filterNote = hasActiveFilters() ? ' · 已篩選' : '';
    setStatus(`顯示 ${filtered.length} / 共 ${allRows.length} 筆${suffix}${filterNote} · 每頁 ${PAGE_SIZE} 筆${listMetaSuffix()}`);
  }

  function resetFilters() {
    const q = $('collection-dial-filter-q');
    const min = $('collection-dial-filter-min-days');
    const region = $('collection-dial-filter-region');
    if (q) q.value = '';
    if (min) min.value = '';
    if (region) region.value = '';
    currentPage = 1;
    renderTable();
  }

  function onSortClick(key) {
    if (sortKey === key) {
      sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey = key;
      sortDir = key === 'tenantName' || key === 'address' ? 'asc' : 'desc';
    }
    currentPage = 1;
    renderTable();
  }

  async function loadStatus() {
    const base = await apiBase();
    if (!base) {
      setStatus('請設定 api-base.json 指向工具箱 API 主機', true);
      return;
    }
    try {
      const r = await fetch(base + '/api/collection/status', { headers: authHeaders() });
      const j = await parseJson(r);
      if (!r.ok) throw new Error(j.error || 'status failed');
      const parts = [];
      parts.push(j.gasConfigured ? '試算表已連線' : '試算表未設定');
      parts.push(j.retellConfigured ? 'Retell 已設定' : 'Retell 未設定（撥號按鈕會失敗）');
      $('collection-dial-config-hint').textContent = parts.join(' · ');
    } catch (e) {
      setStatus(e.message || String(e), true);
    }
  }

  async function loadList() {
    const base = await apiBase();
    if (!base) {
      setStatus('請設定 API 主機（api-base.json）', true);
      return;
    }
    setStatus('載入中…');
    const pendingOnly = $('collection-dial-pending-only')?.checked;
    try {
      const q = pendingOnly ? '?pendingOnly=1' : '';
      const r = await fetch(base + '/api/collection/list' + q, { headers: authHeaders() });
      const j = await parseJson(r);
      if (!r.ok) throw new Error(j.error || '載入失敗');
      allRows = (j.rows || []).map((r) => ({
        ...r,
        tenantPhone: fmtPhone(r.tenantPhone)
      }));
      listMeta = {
        source: j.source || '',
        lastSyncAt: j.lastSyncAt || '',
        count: j.count || allRows.length
      };
      currentPage = 1;
      fillFilterOptions();
      renderTable();
    } catch (e) {
      setStatus(e.message || String(e), true);
    }
  }

  async function dialOne(row, btn) {
    const phone = fmtPhone(row.tenantPhone);
    if (!confirm(`確定撥打給 ${row.tenantName || '房客'}？\n${phone}`)) return;
    const base = await apiBase();
    btn.disabled = true;
    setStatus('正在撥號…');
    try {
      const r = await fetch(base + '/api/collection/call', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ row })
      });
      const j = await parseJson(r);
      if (!r.ok || !j.ok) throw new Error(j.error || '撥號失敗');
      setStatus(`已送出撥號（通話 ID：${j.callId || '—'}）`);
      await loadList();
    } catch (e) {
      setStatus(e.message || String(e), true);
      btn.disabled = false;
    }
  }

  function init() {
    $('collection-dial-refresh')?.addEventListener('click', loadList);
    $('collection-dial-pending-only')?.addEventListener('change', loadList);
    $('collection-dial-filter-reset')?.addEventListener('click', resetFilters);

    ['collection-dial-filter-q', 'collection-dial-filter-min-days'].forEach((id) => {
      $(id)?.addEventListener('input', () => {
        currentPage = 1;
        renderTable();
      });
    });
    $('collection-dial-filter-region')?.addEventListener('change', () => {
      currentPage = 1;
      renderTable();
    });

    $('collection-dial-prev')?.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage -= 1;
        renderTable();
      }
    });
    $('collection-dial-next')?.addEventListener('click', () => {
      const total = applyFiltersAndSort(allRows).length;
      const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
      if (currentPage < maxPage) {
        currentPage += 1;
        renderTable();
      }
    });

    document.querySelectorAll('.collection-dial-sort-th').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-sort');
        if (key) onSortClick(key);
      });
    });

    document.addEventListener('skyfun-auth-ready', () => {
      loadStatus();
      loadList();
    });
    if (window.skyfunAuth?.getToken?.()) {
      loadStatus();
      loadList();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
