/**
 * 場勘照拍攝範本：雙北／台中 + 靜態圖片預覽（Netlify 適用，不依賴 fetch）
 */
(function () {
    const REGION_STORAGE_KEY = 'nb-photo-region-v1';
    let currentRegion = localStorage.getItem(REGION_STORAGE_KEY) || 'shuangbei';
    let modalEl = null;

    function data() {
        return window.PHOTO_GUIDE_DATA || null;
    }

    function $(id) {
        return document.getElementById(id);
    }

    function getRegionMeta(region) {
        return data()?.regions?.[region] || null;
    }

    function getPreviewImages(region, photoId) {
        return data()?.previews?.[region]?.[photoId] || [];
    }

    function getPreviewHint(region, photoId) {
        return data()?.hints?.[region]?.[photoId] || '';
    }

    function ensureModal() {
        if (modalEl) return modalEl;
        modalEl = document.createElement('div');
        modalEl.id = 'nb-photo-preview-modal';
        modalEl.className = 'nb-photo-modal';
        modalEl.hidden = true;
        modalEl.innerHTML = `
            <div class="nb-photo-modal-backdrop" data-nb-photo-modal-close></div>
            <div class="nb-photo-modal-panel" role="dialog" aria-modal="true" aria-labelledby="nb-photo-modal-title">
                <div class="nb-photo-modal-head">
                    <div>
                        <div id="nb-photo-modal-title" class="nb-photo-modal-title"></div>
                        <div id="nb-photo-modal-sub" class="nb-photo-modal-sub"></div>
                    </div>
                    <button type="button" class="nb-photo-modal-close" data-nb-photo-modal-close aria-label="關閉">✕</button>
                </div>
                <div id="nb-photo-modal-body" class="nb-photo-modal-body"></div>
                <div class="nb-photo-modal-foot">
                    <a id="nb-photo-modal-ppt" class="btn btn-sm tone-sky-soft" href="#" target="_blank" rel="noopener noreferrer">📎 開啟完整 PPT</a>
                    <button type="button" class="btn btn-sm tone-slate-soft" data-nb-photo-modal-close>關閉</button>
                </div>
            </div>`;
        document.body.appendChild(modalEl);
        modalEl.addEventListener('click', (e) => {
            if (e.target.closest('[data-nb-photo-modal-close]')) closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalEl && !modalEl.hidden) closeModal();
        });
        return modalEl;
    }

    function openModal({ title, sub, images, pptHref }) {
        const m = ensureModal();
        $('nb-photo-modal-title').textContent = title || '拍攝範例';
        $('nb-photo-modal-sub').textContent = sub || '';
        const body = $('nb-photo-modal-body');
        body.innerHTML = images.length
            ? images
                  .map(
                      (src, i) =>
                          `<figure class="nb-photo-modal-fig"><a href="${src}" target="_blank" rel="noopener noreferrer"><img src="${src}" alt="範例 ${i + 1}" loading="lazy"></a><figcaption>範例 ${i + 1}（點圖可放大）</figcaption></figure>`
                  )
                  .join('')
            : '<p class="text-slate-600 text-sm">此項目尚無範例圖。請將照片放到 <code class="text-xs bg-slate-100 px-1 rounded">assets/photo-guides/' +
              currentRegion +
              '/項目資料夾/</code> 後重新產生資料檔，或開啟完整 PPT。</p>';
        const pptLink = $('nb-photo-modal-ppt');
        if (pptHref) {
            pptLink.href = pptHref;
            pptLink.classList.remove('hidden');
        } else {
            pptLink.classList.add('hidden');
        }
        m.hidden = false;
        document.body.classList.add('nb-photo-modal-open');
    }

    function closeModal() {
        if (!modalEl) return;
        modalEl.hidden = true;
        document.body.classList.remove('nb-photo-modal-open');
    }

    function updateRegionUi(root) {
        const scope = root || document;
        const d = data();
        scope.querySelectorAll('[data-nb-photo-region]').forEach((btn) => {
            const on = btn.getAttribute('data-nb-photo-region') === currentRegion;
            btn.classList.toggle('is-selected', on);
            btn.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        scope.querySelectorAll('[data-nb-heater-section]').forEach((sec) => {
            const mode = sec.getAttribute('data-nb-heater-section');
            let show = false;
            if (mode === 'default') show = currentRegion !== 'taoyuan' && currentRegion !== 'tainan';
            else if (mode === 'taoyuan') show = currentRegion === 'taoyuan';
            else if (mode === 'tainan') show = currentRegion === 'tainan';
            sec.hidden = !show;
            sec.classList.toggle('hidden', !show);
        });
        scope.querySelectorAll('[data-nb-photo-skip-region]').forEach((row) => {
            const skip = (row.getAttribute('data-nb-photo-skip-region') || '')
                .split(/[\s,]+/)
                .filter(Boolean);
            const hide = skip.includes(currentRegion);
            row.hidden = hide;
            row.classList.toggle('hidden', hide);
        });
        scope.querySelectorAll('[data-nb-photo-region-only]').forEach((el) => {
            const only = (el.getAttribute('data-nb-photo-region-only') || '')
                .split(/[\s,]+/)
                .filter(Boolean);
            const show = only.includes(currentRegion);
            el.hidden = !show;
            el.classList.toggle('hidden', !show);
        });
        scope.querySelectorAll('[data-nb-photo-label]').forEach((el) => {
            const regionKey = `data-nb-photo-label-${currentRegion}`;
            const regionLabel = el.getAttribute(regionKey);
            const fallback = el.getAttribute('data-nb-photo-label-default') || el.textContent;
            el.textContent = regionLabel || fallback;
        });
        const regionMeta = getRegionMeta(currentRegion);
        scope.querySelectorAll('[data-nb-photo-preview]').forEach((btn) => {
            const photoId = btn.getAttribute('data-nb-photo-preview');
            const images = getPreviewImages(currentRegion, photoId);
            const has = images.length > 0;
            btn.disabled = !has;
            btn.title = has ? `預覽${regionMeta?.label || ''}拍攝範例` : '尚無範例圖';
            btn.classList.toggle('is-disabled', !has);
        });
        if (!d) {
            scope.querySelectorAll('[data-nb-photo-preview]').forEach((btn) => {
                btn.disabled = true;
                btn.title = '缺少 photo-guide-data.js';
            });
        }
    }

    function injectPreviewButtons(root) {
        const scope = root || document;
        scope.querySelectorAll('[data-nb-photo-checklist] [data-nb-photo-id]').forEach((cb) => {
            const li = cb.closest('li');
            if (!li || li.hasAttribute('data-nb-photo-no-preview') || li.querySelector('[data-nb-photo-preview]')) return;
            const id = cb.getAttribute('data-nb-photo-id');
            li.classList.add('nb-photo-check-row');
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'nb-photo-preview-btn';
            btn.setAttribute('data-nb-photo-preview', id);
            btn.textContent = '範本';
            li.appendChild(btn);
        });
    }

    function bindRegionTabs(root) {
        const scope = root || document;
        scope.querySelectorAll('[data-nb-photo-region]').forEach((btn) => {
            if (btn.dataset.nbPhotoRegionBound) return;
            btn.dataset.nbPhotoRegionBound = '1';
            btn.addEventListener('click', () => {
                const region = btn.getAttribute('data-nb-photo-region');
                if (!region || region === currentRegion) return;
                currentRegion = region;
                try {
                    localStorage.setItem(REGION_STORAGE_KEY, region);
                } catch { /* ignore */ }
                updateRegionUi(document);
                document.querySelectorAll('[data-nb-photo-checklist]').forEach((panel) => {
                    if (window.__nbUpdatePhotoProgress) window.__nbUpdatePhotoProgress(panel);
                });
            });
        });
    }

    function bindPreviewClicks() {
        if (document.body.dataset.nbPhotoPreviewBound) return;
        document.body.dataset.nbPhotoPreviewBound = '1';
        document.addEventListener('click', (e) => {
            const btn = e.target.closest?.('[data-nb-photo-preview]');
            if (!btn || btn.disabled) return;
            e.preventDefault();
            const photoId = btn.getAttribute('data-nb-photo-preview');
            const label = btn.closest('.nb-photo-check')?.querySelector('span')?.textContent?.trim() || photoId;
            const regionMeta = getRegionMeta(currentRegion);
            const images = getPreviewImages(currentRegion, photoId);
            const hint = getPreviewHint(currentRegion, photoId);
            openModal({
                title: `${regionMeta?.label || ''} · ${label}`,
                sub: hint,
                images,
                pptHref: regionMeta?.ppt
            });
        });
    }

    function initPhotoGuidePreview(root) {
        injectPreviewButtons(root);
        bindRegionTabs(root);
        updateRegionUi(root || document);
        document.querySelectorAll('[data-nb-photo-checklist]').forEach((panel) => {
            if (window.__nbUpdatePhotoProgress) window.__nbUpdatePhotoProgress(panel);
        });
    }

    window.initPhotoGuidePreview = initPhotoGuidePreview;

    document.addEventListener('DOMContentLoaded', () => {
        bindPreviewClicks();
        initPhotoGuidePreview(document);
    });
})();
