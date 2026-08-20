/**
 * 領款收據照會 — 送件五欄／照會完畢四欄
 */
(function () {
  'use strict';

  const SUBMIT_FIELD_IDS = [
    'receipt-endorse-rm',
    'receipt-endorse-addr-submit',
    'receipt-endorse-landlord',
    'receipt-endorse-phone',
    'receipt-endorse-deposit'
  ];

  async function apiBase() {
    if (typeof window.loadNbApiBase === 'function') {
      return window.loadNbApiBase();
    }
    return String(window.NB_TRACKER_API || '').trim().replace(/\/$/, '');
  }

  async function parseJsonResponse(r) {
    const text = await r.text();
    if (!text || !text.trim()) {
      throw new Error('API 回傳空白（請確認 api-base.json 或 NB_TRACKER_API_URL 已指向雲端主機）');
    }
    try {
      return JSON.parse(text);
    } catch {
      throw new Error('API 回傳非 JSON（網址可能指到 Netlify 靜態頁，請設定 api-base.json）');
    }
  }

  const RECEIPT_SCHEMA_VERSION = 2;

  function apiRestartHint() {
    return 'API 主機仍是舊版（仍要求案件編號）。請關閉「SkyfunAPI8765」視窗後，重新執行「啟動雲端API主機.bat」。';
  }

  function isLegacyApiMessage(msg) {
    const s = String(msg || '');
    return s.includes('案件編號') || s.includes('業務姓名') || s.includes('caseId');
  }

  function netlifySetupHint() {
    if (typeof window.isNbStaticHosting === 'function' && window.isNbStaticHosting()) {
      return 'Netlify 請在專案根目錄 api-base.json 填 "base": "https://隧道網址" 後重新部署，或在 Netlify 後台設 NB_TRACKER_API_URL。';
    }
    return '請執行「啟動雲端API主機.bat」或設定 js/nb-api-config.js。';
  }

  function $(id) {
    return document.getElementById(id);
  }

  function setStatus(text, isError) {
    const el = $('receipt-endorse-status');
    if (!el) return;
    el.textContent = text || '';
    el.className = 'text-sm mt-3 ' + (isError ? 'text-rose-700 font-semibold' : 'text-slate-600');
  }

  function setRepushVisible(show) {
    const btn = $('receipt-endorse-repush-btn');
    if (btn) btn.classList.toggle('hidden', !show);
  }

  function syncPanels() {
    const type = $('receipt-endorse-type')?.value || 'submit';
    document.querySelectorAll('[data-receipt-panel]').forEach((el) => {
      const panel = el.getAttribute('data-receipt-panel');
      el.classList.toggle('hidden', panel !== type);
    });
  }

  function collectPayload() {
    const formType = $('receipt-endorse-type')?.value || 'submit';
    if (formType === 'done') {
      return {
        formType: 'done',
        propertyAddress: ($('receipt-endorse-addr-done')?.value || '').trim(),
        supervisor: ($('receipt-endorse-supervisor')?.value || '').trim(),
        result: ($('receipt-endorse-result')?.value || '').trim(),
        submitRentManagerName: ($('receipt-endorse-rm-submit')?.value || '').trim()
      };
    }
    return {
      formType: 'submit',
      rentManagerName: ($('receipt-endorse-rm')?.value || '').trim(),
      propertyAddress: ($('receipt-endorse-addr-submit')?.value || '').trim(),
      landlordName: ($('receipt-endorse-landlord')?.value || '').trim(),
      landlordPhone: ($('receipt-endorse-phone')?.value || '').trim(),
      deposit: ($('receipt-endorse-deposit')?.value || '').trim()
    };
  }

  function validateLocal(payload) {
    if (payload.formType === 'done') {
      const labels = {
        propertyAddress: '物件地址',
        supervisor: '照會主管',
        result: '照會結果',
        submitRentManagerName: '送件租管師姓名'
      };
      const missing = [];
      Object.keys(labels).forEach((k) => {
        if (!payload[k]) missing.push(labels[k]);
      });
      return missing;
    }
    const labels = {
      rentManagerName: '租管師姓名',
      propertyAddress: '物件地址',
      landlordName: '房東姓名',
      landlordPhone: '房東電話',
      deposit: '押金'
    };
    const missing = [];
    Object.keys(labels).forEach((k) => {
      if (!payload[k]) missing.push(labels[k]);
    });
    return missing;
  }

  function clearSubmitFields() {
    SUBMIT_FIELD_IDS.forEach((id) => {
      const el = $(id);
      if (el) el.value = '';
    });
  }

  async function refreshLineStatus() {
    const base = await apiBase();
    const badge = $('receipt-endorse-line-badge');
    if (!base) {
      if (badge) {
        badge.textContent = '需設定 API 網址';
        badge.className = 'text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900';
      }
      setStatus(netlifySetupHint(), true);
      return;
    }
    try {
      const r = await fetch(base + '/api/receipt-endorsement/status');
      const j = await parseJsonResponse(r);
      if (j.schemaVersion !== RECEIPT_SCHEMA_VERSION) {
        if (badge) {
          badge.textContent = 'API 需重啟';
          badge.className = 'text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900';
        }
        setStatus(apiRestartHint(), true);
        return;
      }
      if (badge) {
        if (j.ready) {
          badge.textContent = 'LINE 照會群已就緒';
          badge.className = 'text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900';
        } else if (j.lineConfigured) {
          badge.textContent = '待設定照會群';
          badge.className = 'text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900';
        } else {
          badge.textContent = '未設定 LINE';
          badge.className = 'text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-900';
        }
      }
      if (!j.ready) {
        setStatus(
          '請在 server/config.json 設定 lineChannelAccessToken，將官方帳號拉進照會群，詳見設定教學。',
          true
        );
      } else {
        setStatus('');
      }
    } catch (e) {
      if (badge) badge.textContent = 'API 連線失敗';
      const hint =
        (e?.message || '').includes('fetch') || (e?.message || '').includes('Failed')
          ? '請確認公司電腦已執行「啟動雲端API主機.bat」且 SkyfunAPI8765、SkyfunTunnel 兩視窗都開著；隧道網址若已變請更新 api-base.json 後重 deploy Netlify。'
          : '';
      setStatus((e?.message || '無法連線') + '（' + base + '）' + (hint ? ' ' + hint : ''), true);
    }
  }

  async function postReceiptEndorsement(payload, options) {
    const base = await apiBase();
    if (!base) {
      setStatus(netlifySetupHint(), true);
      return null;
    }
    const headers = { 'Content-Type': 'application/json' };
    if (window.skyfunAuth?.getToken?.()) {
      headers.Authorization = 'Bearer ' + window.skyfunAuth.getToken();
    }
    const r = await fetch(base + '/api/receipt-endorsement', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    return parseJsonResponse(r);
  }

  async function submitForm(repushOnly) {
    const base = await apiBase();
    if (!base) {
      setStatus(netlifySetupHint(), true);
      return;
    }

    const payload = collectPayload();
    const missing = validateLocal(payload);
    if (missing.length) {
      setStatus('請填寫：' + missing.join('、'), true);
      return;
    }

    const btn = repushOnly ? $('receipt-endorse-repush-btn') : $('receipt-endorse-submit-btn');
    const otherBtn = repushOnly ? $('receipt-endorse-submit-btn') : $('receipt-endorse-repush-btn');
    const btnLabel = repushOnly ? '重新推播照會群（不重複存檔）' : '送出並通知照會群';
    if (btn) {
      btn.disabled = true;
      btn.textContent = repushOnly ? '推播中…' : '送出中…';
    }
    if (otherBtn) otherBtn.disabled = true;
    if (!repushOnly) setStatus('');

    try {
      const body = repushOnly ? { ...payload, repushOnly: true } : payload;
      const j = await postReceiptEndorsement(body);
      if (!j) return;
      if (!j.ok) {
        const msg = j.message || j.error || '送出失敗';
        setStatus(isLegacyApiMessage(msg) ? apiRestartHint() : msg, true);
        setRepushVisible(!!(j.canRepush || j.saved || repushOnly || String(msg).includes('推播失敗')));
        return;
      }
      setStatus('✓ ' + (j.message || '已送出'), false);
      setRepushVisible(false);
      if (!repushOnly && payload.formType === 'submit') {
        clearSubmitFields();
      }
    } catch (e) {
      const msg = String(e?.message || e);
      const hint =
        msg.includes('fetch') || msg.includes('Failed')
          ? ' → 公司主機請執行「啟動雲端API主機.bat」，並確認隧道視窗網址與 api-base.json 相同。'
          : '';
      setStatus('連線失敗：' + msg + hint, true);
      if (repushOnly) setRepushVisible(true);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = btnLabel;
      }
      if (otherBtn) otherBtn.disabled = false;
    }
  }

  function initReceiptEndorsementForm() {
    const root = $('receipt-endorse-form-root');
    if (!root || root.dataset.bound) return;
    root.dataset.bound = '1';

    $('receipt-endorse-type')?.addEventListener('change', syncPanels);
    $('receipt-endorse-submit-btn')?.addEventListener('click', () => submitForm(false));
    $('receipt-endorse-repush-btn')?.addEventListener('click', () => submitForm(true));
    syncPanels();
    refreshLineStatus();
  }

  window.initReceiptEndorsementForm = initReceiptEndorsementForm;
  window.refreshReceiptEndorseLineStatus = refreshLineStatus;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReceiptEndorsementForm);
  } else {
    initReceiptEndorsementForm();
  }
})();
