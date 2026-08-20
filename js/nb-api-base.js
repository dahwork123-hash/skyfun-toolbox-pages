/**
 * 解析任務板／照會 API 基底網址（本機同源、Netlify + api-base.json、NB_TRACKER_API）
 */
(function () {
  'use strict';

  function trimBase(s) {
    return String(s || '').trim().replace(/\/$/, '');
  }

  function isStaticHost() {
    const h = (location.hostname || '').toLowerCase();
    return (
      h.endsWith('.netlify.app') ||
      h.endsWith('.netlify.live') ||
      h.endsWith('.pages.dev') ||
      h === 'netlify.app'
    );
  }

  function readMetaApi() {
    const el = document.querySelector('meta[name="nb-tracker-api"]');
    return el ? trimBase(el.getAttribute('content')) : '';
  }

  async function readApiBaseJson() {
    try {
      const r = await fetch('./api-base.json', { cache: 'no-store' });
      if (!r.ok) return '';
      const j = await r.json();
      if (j && j.proxy && isStaticHost()) return trimBase(location.origin);
      return trimBase(j && j.base);
    } catch (_) {
      return '';
    }
  }

  window.loadNbApiBase = function loadNbApiBase() {
    if (window.__NB_API_BASE_READY) {
      return Promise.resolve(trimBase(window.NB_TRACKER_API));
    }
    if (window.__NB_API_BASE_PROMISE) return window.__NB_API_BASE_PROMISE;

    window.__NB_API_BASE_PROMISE = (async function () {
      let base = '';

      if (isStaticHost()) {
        base = await readApiBaseJson();
      }

      if (!base) base = trimBase(window.NB_TRACKER_API);
      if (!base) base = readMetaApi();
      if (!base) base = await readApiBaseJson();

      if (!base && !isStaticHost() && location.protocol.startsWith('http')) {
        base = trimBase(location.origin);
      }

      window.NB_TRACKER_API = base;
      window.__NB_API_BASE_READY = true;
      return base;
    })();

    return window.__NB_API_BASE_PROMISE;
  };

  window.getNbApiBase = function getNbApiBase() {
    return trimBase(window.NB_TRACKER_API);
  };

  window.isNbStaticHosting = isStaticHost;

  window.loadNbApiBase();
})();
