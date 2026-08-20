/**
 * 承租資格試算（租補 / 社宅）
 * 法源：第三至五期執行要點（住都1140030759）、住宅法、300億作業規定、住宅補貼對象一定所得及財產標準（1151002186）
 */
(function () {
    'use strict';

    function L() {
        return window.TenantEligibilityLegal;
    }

    function ri(pass, detail, opts) {
        const legalMod = L();
        return legalMod ? legalMod.item(pass, detail, opts) : { pass, detail };
    }

    function failLegalBoth(key) {
        const legalMod = L();
        if (!legalMod) return '';
        const she = legalMod.cite('she', key);
        const pip = legalMod.cite('pip', key);
        const both = legalMod.cite('both', key);
        return [she, pip, both].filter((s, i, a) => s && a.indexOf(s) === i).join('；');
    }

    /** @type {Record<string, { label: string, detail: string }>} */
    const BY_CITY = {
        taipei: {
            label: '台北市',
            she: { immovableWan: 943, movableWan: 760, incomeMonth: 71327 },
            pip: { incomeMonth: 61137, incomeMonthNewFamily: 71327 },
        },
        newtaipei: {
            label: '新北市',
            she: { immovableWan: 675, movableWan: 479, incomeMonth: 59150 },
            pip: { incomeMonth: 50700, incomeMonthNewFamily: 59150 },
        },
        taoyuan: {
            label: '桃園市',
            she: { immovableWan: 663, movableWan: 479, incomeMonth: 58688 },
            pip: { incomeMonth: 50304, incomeMonthNewFamily: 58688 },
        },
        taichung: {
            label: '台中市',
            she: { immovableWan: 560, movableWan: 479, incomeMonth: 56270 },
            pip: { incomeMonth: 48231, incomeMonthNewFamily: 56270 },
        },
        tainan: {
            label: '台南市',
            she: { immovableWan: 560, movableWan: 479, incomeMonth: 54303 },
            pip: { incomeMonth: 46545, incomeMonthNewFamily: 54303 },
        },
        kaohsiung: {
            label: '高雄市',
            she: { immovableWan: 575, movableWan: 479, incomeMonth: 56140 },
            pip: { incomeMonth: 48120, incomeMonthNewFamily: 56140 },
        },
        hsinchu: {
            label: '新竹縣市',
            she: { immovableWan: 560, movableWan: 479, incomeMonth: 56270 },
            pip: { incomeMonth: 48231, incomeMonthNewFamily: 56270 },
        },
        changhua: {
            label: '彰化縣',
            she: { immovableWan: 560, movableWan: 333, incomeMonth: 54303 },
            pip: { incomeMonth: 46545, incomeMonthNewFamily: 54303 },
        },
        nantou: {
            label: '南投縣',
            she: { immovableWan: 560, movableWan: 333, incomeMonth: 54303 },
            pip: { incomeMonth: 46545, incomeMonthNewFamily: 54303 },
        },
        chiayi: {
            label: '嘉義縣市',
            she: { immovableWan: 560, movableWan: 333, incomeMonth: 54303 },
            pip: { incomeMonth: 46545, incomeMonthNewFamily: 54303 },
        },
        yilan: {
            label: '宜蘭縣',
            she: { immovableWan: 560, movableWan: 333, incomeMonth: 54303 },
            pip: { incomeMonth: 46545, incomeMonthNewFamily: 54303 },
        },
        keelung: {
            label: '基隆市',
            she: { immovableWan: 675, movableWan: 479, incomeMonth: 59150 },
            pip: { incomeMonth: 50700, incomeMonthNewFamily: 59150 },
        },
        offshore: {
            label: '金門縣、連江縣',
            she: { immovableWan: 443, movableWan: 333, incomeMonth: 50194 },
            pip: { incomeMonth: 43023, incomeMonthNewFamily: 50194 },
        },
        other: {
            label: '其餘縣市',
            she: { immovableWan: 560, movableWan: 333, incomeMonth: 54303 },
            pip: { incomeMonth: 46545, incomeMonthNewFamily: 54303 },
        },
    };

    function fmtMoney(n) {
        if (!Number.isFinite(n)) return '—';
        return Math.round(n).toLocaleString('zh-TW');
    }

    function fmtWan(n) {
        if (!Number.isFinite(n)) return '—';
        return n.toLocaleString('zh-TW', { maximumFractionDigits: 2 });
    }

    function parseNum(raw) {
        if (raw == null || raw === '') return null;
        const n = Number(String(raw).replace(/,/g, '').trim());
        return Number.isFinite(n) && n >= 0 ? n : null;
    }

    const MAX_MEMBERS = 20;

    /** 租補／社宅 共用房屋資格認定（擇一） */
    const HOUSING_RULES = {
        no_owned: {
            label: '未持有自有房屋',
            detail: '房屋：家庭成員未持有自有房屋（符合第 1 項；租補、社宅均適用）',
        },
        coowned_under40: {
            label: '持分未滿 40 ㎡',
            detail:
                '房屋：個別持分面積未滿四十平方公尺之共有房屋，且其他共有人非家庭成員（符合第 2 項；租補、社宅均適用）',
        },
        demolish_danger: {
            label: '拆遷或危險建築',
            detail:
                '房屋：僅持有拆遷公告或危險標誌之房屋（符合第 3 項；須檢附證明並經地方主辦機關認定）',
        },
        damaged_over50: {
            label: '毀損五成以上須修復',
            detail:
                '房屋：僅持有毀損面積占整棟五成以上、須修復始能使用之房屋（符合第 4 項；須檢附證明並經地方主辦機關認定）',
        },
        not_ok: {
            label: '不符合',
            detail: '房屋：以上房屋條件皆不符合',
        },
    };

    function hasRegionalCoownedUnder40(regionalIn, regionalOther) {
        return regionalIn === 'under40' || regionalOther === 'under40';
    }

    function judgeHasProperty(hasPropKey, immovableWan) {
        if (!hasPropKey) {
            return ri(null, '房產：請選擇是否有房產', { basisKey: 'property_missing', program: 'both' });
        }
        if (hasPropKey === 'no') {
            if (immovableWan != null && immovableWan > 0) {
                return ri(false, '房產：勾選無，但不動產總額大於 0 萬，請確認申報', {
                    basisKey: 'property_no_immovable_conflict',
                    program: 'both',
                });
            }
            return ri(true, '房產：無');
        }
        let detail = '房產：有（請完成區域房產確認；社宅請填不動產金額）';
        if (immovableWan != null && immovableWan === 0) {
            detail += '；不動產申報 0 萬（請確認是否漏填）';
        }
        return ri(true, detail);
    }

    function judgeHousingWithConsistency(hasPropKey, housingKey, regionalItem) {
        if (!hasPropKey) {
            return ri(null, '房屋：請先選擇有無房產', { basisKey: 'property_missing', program: 'both' });
        }
        if (hasPropKey === 'no') {
            return ri(true, '房屋：無房產，符合資格');
        }
        if (housingKey === 'demolish_danger' || housingKey === 'damaged_over50' || housingKey === 'not_ok') {
            return judgeHousing(housingKey);
        }
        if (regionalItem.pass === false) {
            return ri(false, '房屋：區域房產條件不符', {
                legal: regionalItem.legal,
                basisKey: 'housing_not_ok',
                program: 'both',
            });
        }
        if (regionalItem.pass === null) {
            return ri(null, '房屋：請完成上方區域房產填寫', { basisKey: 'regional_missing', program: 'both' });
        }
        return ri(true, '房屋：區域房產條件符合');
    }

    function syncFormVisibility() {
        const cityKey = document.getElementById('telig-city')?.value || '';
        const hasPropKey = readHasPropertyKey();
        const propBlock = document.getElementById('telig-has-property-block');
        const regionalPanel = document.getElementById('telig-regional-panel');
        const housingPanel = document.getElementById('telig-pip-housing-panel');

        if (propBlock) {
            propBlock.classList.toggle('hidden', !cityKey);
        }
        if (!cityKey) {
            document.querySelectorAll('input[name="telig-has-property"]').forEach((el) => {
                el.checked = false;
            });
        }

        const showRegional = Boolean(cityKey) && hasPropKey === 'yes';
        if (regionalPanel) {
            regionalPanel.classList.toggle('hidden', !showRegional);
            if (cityKey) updateRegionalZoneDisplay(cityKey);
        }
        if (!showRegional) {
            document.querySelectorAll('input[name="telig-regional-in"], input[name="telig-regional-other"]').forEach(
                (el) => {
                    el.checked = false;
                }
            );
        }

        if (housingPanel) {
            const showHousing = hasPropKey === 'yes';
            housingPanel.classList.toggle('hidden', !showHousing);
            if (!showHousing) {
                document.querySelectorAll('input[name="telig-pip-housing"]').forEach((el) => {
                    el.checked = false;
                });
            }
        }
    }

    function judgeHousing(housingKey) {
        if (!housingKey) {
            return ri(null, '房屋：請勾選房屋資格認定項目（擇一）', { basisKey: 'property_missing', program: 'both' });
        }
        const opt = HOUSING_RULES[housingKey];
        if (!opt) {
            return ri(null, '房屋：請勾選有效的房屋資格項目');
        }
        if (housingKey === 'not_ok') {
            return ri(false, opt.detail, { legal: failLegalBoth('housing_not_ok') });
        }
        const basisByKey = {
            coowned_under40: 'housing_coowned_ok',
            no_owned: 'housing_no_owned_ok',
            demolish_danger: 'housing_demolish_ok',
            damaged_over50: 'housing_damaged_ok',
        };
        return ri(true, opt.detail, {
            basisKey: basisByKey[housingKey],
            program: 'both',
        });
    }

    function judgeSheImmovable(immovableWan, limitWan, hasPropKey, regionalIn, regionalOther) {
        const coownedCase = hasPropKey === 'yes' && hasRegionalCoownedUnder40(regionalIn, regionalOther);
        if (coownedCase) {
            if (immovableWan == null) {
                return ri(null, '不動產：持分 40 ㎡ 以下不列入；其餘不動產請填合計（若無則填 0）', {
                    basisKey: 'immovable_coowned_note',
                    program: 'she',
                });
            }
            if (immovableWan === 0) {
                return ri(true, '不動產：持分 40 ㎡ 以下不列入計算；其餘申報 0 萬 ≤ 上限');
            }
            const base = judgeProperty(immovableWan, limitWan, '不動產', 'she');
            if (base.pass === false) return base;
            return ri(
                true,
                `不動產：合計 ${fmtWan(immovableWan)} 萬 ≤ 上限 ${fmtWan(limitWan)} 萬（持分 40 ㎡ 以下部分應不列入，請確認申報）`
            );
        }
        return judgeProperty(immovableWan, limitWan, '不動產', 'she');
    }

    function readHasPropertyKey() {
        const checked = document.querySelector('input[name="telig-has-property"]:checked');
        return checked ? checked.value : null;
    }

    function readPipHousingKey() {
        const checked = document.querySelector('input[name="telig-pip-housing"]:checked');
        return checked ? checked.value : null;
    }

    function readRegionalInKey() {
        const checked = document.querySelector('input[name="telig-regional-in"]:checked');
        return checked ? checked.value : null;
    }

    function readRegionalOtherKey() {
        const checked = document.querySelector('input[name="telig-regional-other"]:checked');
        return checked ? checked.value : null;
    }

    function updateRegionalZoneDisplay(rentalKey) {
        const R = window.TenantEligibilityRegions;
        const zonesEl = document.getElementById('telig-restricted-zones');
        if (!R || !zonesEl || !rentalKey) return;
        const labels = R.getRestrictedLabels(rentalKey);
        zonesEl.textContent = labels.length ? labels.join('、') : '本表未列，請依主管機關／執行要點審查';
    }

    function judgeRegionalProperty(f) {
        const R = window.TenantEligibilityRegions;
        if (!R) {
            return ri(null, '區域房產：區域模組未載入');
        }
        return R.judgeRegionalProperty({
            rentalKey: f.cityKey,
            hasPropertyKey: f.hasPropertyKey,
            regionalIn: f.regionalIn,
            regionalOther: f.regionalOther,
            resultItem: ri,
        });
    }

    const MEMBER_RELATIONS = [
        { value: 'self', label: '本人（申請人）', pip: true, she: true },
        { value: 'spouse', label: '配偶', pip: true, she: true },
        { value: 'minor', label: '未成年子女', pip: true, she: true },
        { value: 'parent', label: '父母（直系）', pip: false, she: true },
        { value: 'child', label: '成年子女（直系）', pip: false, she: true },
        { value: 'grandparent', label: '祖父母（直系）', pip: false, she: true },
        { value: 'grandchild', label: '孫子女（直系）', pip: false, she: true },
        { value: 'other', label: '其他（不納入試算）', pip: false, she: false },
    ];

    function isPipCountedRelation(relation) {
        const r = MEMBER_RELATIONS.find((x) => x.value === relation);
        return Boolean(r && r.pip);
    }

    function isSheCountedRelation(relation) {
        const r = MEMBER_RELATIONS.find((x) => x.value === relation);
        return Boolean(r && r.she);
    }

    function relationLabel(relation) {
        return MEMBER_RELATIONS.find((x) => x.value === relation)?.label || relation;
    }

    function monthlyFromRow(row) {
        const monthly = parseNum(row.monthly);
        if (monthly != null) return monthly;
        const annual = parseNum(row.annual);
        if (annual != null) return Math.round(annual / 12);
        return null;
    }

    /** @returns {{ relation: string, annual: string, monthly: string }[]} */
    function readMemberRowsFromDom() {
        const rows = document.querySelectorAll('#telig-member-incomes .telig-member-row');
        return Array.from(rows, (row, i) => ({
            relation: row.querySelector('.telig-member-relation')?.value || (i === 0 ? 'self' : ''),
            annual: row.querySelector('.telig-member-annual')?.value ?? '',
            monthly: row.querySelector('.telig-member-income')?.value ?? '',
        }));
    }

    function renderMemberIncomeFields() {
        const container = document.getElementById('telig-member-incomes');
        if (!container) return;

        const prev = readMemberRowsFromDom();
        const countRaw = parseNum(document.getElementById('telig-members')?.value);
        const count = countRaw != null ? Math.min(Math.max(1, Math.floor(countRaw)), MAX_MEMBERS) : null;

        if (count == null) {
            container.innerHTML = '<p class="text-xs text-slate-500">請先填寫家庭成員人數</p>';
            return;
        }

        const frag = document.createDocumentFragment();
        for (let i = 0; i < count; i += 1) {
            const row = document.createElement('div');
            row.className = 'telig-member-row';

            const relWrap = document.createElement('div');
            const relLabel = document.createElement('div');
            relLabel.className = 'telig-member-row-label';
            relLabel.textContent = i === 0 ? '成員 1（申請人）' : `成員 ${i + 1}`;
            const relSel = document.createElement('select');
            relSel.className =
                'telig-member-relation w-full px-2 py-2.5 border-2 border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200';
            relSel.innerHTML =
                '<option value="">請選擇稱謂</option>' +
                MEMBER_RELATIONS.map((r) => `<option value="${r.value}">${r.label}</option>`).join('');
            const prevRel = prev[i]?.relation || (i === 0 ? 'self' : '');
            relSel.value = prevRel;
            relWrap.append(relLabel, relSel);

            const annualWrap = document.createElement('div');
            const annualLabel = document.createElement('div');
            annualLabel.className = 'telig-member-row-label';
            annualLabel.textContent = '年所得';
            const annualInp = document.createElement('input');
            annualInp.type = 'number';
            annualInp.inputMode = 'numeric';
            annualInp.min = '0';
            annualInp.step = '1';
            annualInp.placeholder = '選填';
            annualInp.className =
                'telig-member-annual w-full px-3 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200';
            if (prev[i]?.annual) annualInp.value = prev[i].annual;
            annualWrap.append(annualLabel, annualInp);

            const monthWrap = document.createElement('div');
            const monthLabel = document.createElement('div');
            monthLabel.className = 'telig-member-row-label';
            monthLabel.textContent = '月所得';
            const monthInp = document.createElement('input');
            monthInp.type = 'number';
            monthInp.inputMode = 'numeric';
            monthInp.min = '0';
            monthInp.step = '1';
            monthInp.placeholder = '可填 0';
            monthInp.className =
                'telig-member-income w-full px-3 py-2.5 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200';
            if (prev[i]?.monthly) monthInp.value = prev[i].monthly;
            monthWrap.append(monthLabel, monthInp);

            const tags = document.createElement('div');
            tags.className = 'telig-member-tags sm:col-span-3';
            tags.style.gridColumn = '1 / -1';
            tags.innerHTML =
                '<span class="telig-tag-pip">租補</span><span class="telig-member-tag-pip">—</span> ' +
                '<span class="telig-tag-she">社宅</span><span class="telig-member-tag-she">—</span>';
            row.append(relWrap, annualWrap, monthWrap, tags);
            frag.appendChild(row);
        }
        container.innerHTML = '';
        container.appendChild(frag);
        updateMemberRowTags();
    }

    function updateMemberRowTags() {
        document.querySelectorAll('#telig-member-incomes .telig-member-row').forEach((row) => {
            const rel = row.querySelector('.telig-member-relation')?.value || '';
            const pipEl = row.querySelector('.telig-member-tag-pip');
            const sheEl = row.querySelector('.telig-member-tag-she');
            if (pipEl) pipEl.textContent = isPipCountedRelation(rel) ? '納入' : '不納入';
            if (sheEl) sheEl.textContent = isSheCountedRelation(rel) ? '納入' : '不納入';
        });
    }

    function applyAnnualToMonthly(annualInput) {
        const row = annualInput.closest('.telig-member-row');
        const monthlyInput = row?.querySelector('.telig-member-income');
        if (!monthlyInput) return;
        const annual = parseNum(annualInput.value);
        if (annual != null) {
            monthlyInput.value = String(Math.round(annual / 12));
        }
    }

    /**
     * @param {{ relation: string, annual: string, monthly: string }[]} memberRows
     * @param {number|null} avgDirect
     */
    function computeProgramIncome(memberRows, avgDirect, program) {
        const isPip = program === 'pip';
        const scopeLabel = isPip ? '配偶及未成年子女' : '直系親屬';
        const counted = memberRows.filter((r) =>
            isPip ? isPipCountedRelation(r.relation) : isSheCountedRelation(r.relation)
        );

        if (avgDirect != null) {
            return {
                avg: avgDirect,
                mode: 'direct',
                scopeLabel,
                counted,
                sum: null,
                count: counted.length,
            };
        }

        if (!counted.length) {
            return { avg: null, mode: 'no-members', scopeLabel, counted, sum: null, count: 0 };
        }

        if (counted.some((r) => !r.relation)) {
            return { avg: null, mode: 'missing-relation', scopeLabel, counted, sum: null, count: counted.length };
        }

        const withMonthly = counted.map((r) => ({ ...r, monthly: monthlyFromRow(r) }));
        if (withMonthly.every((r) => r.monthly != null)) {
            const sum = withMonthly.reduce((a, b) => a + (b.monthly || 0), 0);
            return {
                avg: sum / counted.length,
                mode: 'members',
                scopeLabel,
                counted: withMonthly,
                sum,
                count: counted.length,
            };
        }

        if (withMonthly.some((r) => r.monthly != null)) {
            return { avg: null, mode: 'partial', scopeLabel, counted: withMonthly, sum: null, count: counted.length };
        }

        return { avg: null, mode: 'empty', scopeLabel, counted, sum: null, count: counted.length };
    }

    function updateMemberIncomeTotal() {
        const totalEl = document.getElementById('telig-member-income-total');
        if (!totalEl) return;
        const memberRows = readMemberRowsFromDom();
        const pip = computeProgramIncome(memberRows, null, 'pip');
        const she = computeProgramIncome(memberRows, null, 'she');

        const line = (label, ctx) => {
            if (ctx.mode === 'missing-relation') {
                return `${label}：請為每位納入成員選擇稱謂`;
            }
            if (ctx.mode === 'no-members') {
                return `${label}：尚無納入成員（請選擇稱謂）`;
            }
            if (ctx.avg == null) {
                return `${label}（${ctx.scopeLabel}，${ctx.count} 人）：請填寫所得`;
            }
            const sumText = ctx.sum != null ? `，月合計 ${fmtMoney(ctx.sum)} 元` : '';
            return `${label}（${ctx.scopeLabel}，${ctx.count} 人${sumText}）平均每人每月 ${fmtMoney(ctx.avg)} 元`;
        };

        totalEl.innerHTML = [line('租補納入', pip), line('社宅納入', she)].join('<br/>');
    }

    function readForm() {
        const cityKey = document.getElementById('telig-city')?.value || '';
        const members = parseNum(document.getElementById('telig-members')?.value);
        const memberRows = readMemberRowsFromDom();
        const avgIncomeDirect = parseNum(document.getElementById('telig-avg-income')?.value);
        const immovableWan = parseNum(document.getElementById('telig-immovable')?.value);
        const movableWan = parseNum(document.getElementById('telig-movable')?.value);
        const pipNewFamily = document.getElementById('telig-pip-new-family')?.checked === true;
        const hasPropertyKey = readHasPropertyKey();
        const pipHousingKey = readPipHousingKey();
        const regionalIn = readRegionalInKey();
        const regionalOther = readRegionalOtherKey();

        const pipIncome = computeProgramIncome(memberRows, avgIncomeDirect, 'pip');
        const sheIncome = computeProgramIncome(memberRows, avgIncomeDirect, 'she');

        return {
            cityKey,
            city: cityKey ? BY_CITY[cityKey] || BY_CITY.other : null,
            members,
            memberRows,
            pipIncome,
            sheIncome,
            avgIncomeDirect,
            immovableWan,
            movableWan,
            pipNewFamily,
            hasPropertyKey,
            pipHousingKey,
            regionalIn,
            regionalOther,
        };
    }

    function verdictShort(pass) {
        if (pass === true) return '符合';
        if (pass === false) return '不符合';
        return '待確認';
    }

    function renderReviewSummary(regionalItem, propertyItem, pipPass, shePass, pipItems, sheItems) {
        const verdictEl = document.getElementById('telig-review-verdict');
        const listEl = document.getElementById('telig-review-items');
        if (!verdictEl || !listEl) return;

        const housingItem = pipItems.find((i) => i.detail.startsWith('房屋')) || null;

        listEl.innerHTML = [
            {
                pass: regionalItem.pass,
                detail: `【區域房產】${regionalItem.detail.replace(/^區域房產：/, '')}`,
            },
            {
                pass: propertyItem.pass,
                detail: `【有無房產】${propertyItem.detail.replace(/^房產：/, '')}`,
            },
            housingItem
                ? {
                      pass: housingItem.pass,
                      detail: `【房屋】${housingItem.detail.replace(/^房屋：/, '')}`,
                  }
                : null,
            {
                pass: pipPass,
                detail: `【租補 300 億】${verdictShort(pipPass)}`,
            },
            {
                pass: shePass,
                detail: `【社宅】${verdictShort(shePass)}`,
            },
            sheItems.find((i) => i.detail.startsWith('不動產')) || null,
            sheItems.find((i) => i.detail.startsWith('動產')) || null,
        ]
            .filter(Boolean)
            .map(itemHtml)
            .join('');

        const anyFail = pipPass === false || shePass === false || propertyItem.pass === false;
        const anyPending =
            pipPass == null || shePass == null || propertyItem.pass == null || pipItems.some((i) => i.pass === null);

        if (anyFail) {
            renderVerdictText('telig-review-verdict', '審查摘要：部分項目不符合', 'fail');
            const allFails = uniqueLegal([...pipItems, ...sheItems]);
            appendVerdictLegal('telig-review-verdict', allFails);
        } else if (anyPending) {
            renderVerdictText('telig-review-verdict', '審查摘要：尚有項目待填寫或確認', 'pending');
            clearVerdictLegal('telig-review-verdict');
        } else {
            renderVerdictText('telig-review-verdict', '審查摘要：各項均已填寫（請依實際送件再確認）', 'pass');
            clearVerdictLegal('telig-review-verdict');
        }
    }

    /**
     * @param {{ pass: boolean|null, detail: string, legal?: string }} item
     */
    function itemHtml(item) {
        const legalHtml =
            item.pass === false && item.legal
                ? `<span class="telig-legal">📜 依據：${item.legal}</span>`
                : '';
        if (item.pass === null) {
            return `<li class="text-slate-500">${item.detail}${legalHtml ? legalHtml : ''}</li>`;
        }
        const icon = item.pass ? '✅' : '❌';
        const tone = item.pass ? 'text-emerald-800' : 'text-rose-800';
        return `<li class="${tone}"><span class="mr-1">${icon}</span>${item.detail}${legalHtml}</li>`;
    }

    function uniqueLegal(items) {
        const set = new Set();
        items.forEach((i) => {
            if (i.pass === false && i.legal) set.add(i.legal);
        });
        return Array.from(set);
    }

    function judgeIncome(ctx, limit, program) {
        const basisKey = program === 'pip' ? 'income_over_pip' : 'income_over_she';
        const progLabel = program === 'pip' ? '租補' : '社宅';
        const prefix = `${progLabel}所得`;

        if (ctx.mode === 'missing-relation') {
            return ri(null, `${prefix}：請為每位成員選擇稱謂`, { basisKey, program });
        }
        if (ctx.mode === 'no-members') {
            return ri(null, `${prefix}：尚無納入成員（${ctx.scopeLabel}）`, { basisKey, program });
        }
        if (ctx.mode === 'partial' || ctx.mode === 'empty') {
            return ri(null, `${prefix}：請填寫各成員月／年所得`, { basisKey, program });
        }
        if (ctx.avg == null || limit == null) {
            return ri(null, `${prefix}：請填寫所得資料`, { basisKey, program });
        }

        const avgMonth = ctx.avg;
        const pass = avgMonth <= limit;
        const diff = limit - avgMonth;
        const scopeNote = `（納入 ${ctx.count} 人：${ctx.scopeLabel}）`;
        const modeNote = ctx.mode === 'direct' ? '；採直接填寫之平均所得' : '';
        return ri(
            pass,
            pass
                ? `${prefix}${scopeNote}：平均每人每月 ${fmtMoney(avgMonth)} 元 ≤ 上限 ${fmtMoney(limit)} 元（尚餘 ${fmtMoney(diff)} 元）${modeNote}`
                : `${prefix}${scopeNote}：平均每人每月 ${fmtMoney(avgMonth)} 元 ＞ 上限 ${fmtMoney(limit)} 元（超出 ${fmtMoney(-diff)} 元）${modeNote}`,
            pass ? {} : { basisKey, program }
        );
    }

    function judgeProperty(actualWan, limitWan, label, program) {
        const basisKey = label === '動產' ? 'movable_over' : 'immovable_over';
        if (actualWan == null) {
            return ri(null, `${label}：未填寫（社宅試算需填）`, { basisKey, program: program || 'she' });
        }
        const pass = actualWan <= limitWan;
        const diff = limitWan - actualWan;
        return ri(
            pass,
            pass
                ? `${label}：合計 ${fmtWan(actualWan)} 萬 ≤ 上限 ${fmtWan(limitWan)} 萬（尚餘 ${fmtWan(diff)} 萬）`
                : `${label}：合計 ${fmtWan(actualWan)} 萬 ＞ 上限 ${fmtWan(limitWan)} 萬（超出 ${fmtWan(-diff)} 萬）`,
            pass ? {} : { basisKey, program: program || 'she' }
        );
    }

    function overallPass(items) {
        const decided = items.filter((i) => i.pass !== null);
        if (!decided.length) return null;
        return decided.every((i) => i.pass === true);
    }

    function renderVerdict(elId, pass, opts) {
        const kind = opts && opts.kind;
        const failedItems = (opts && opts.failedItems) || [];
        const legalList = uniqueLegal(failedItems);

        if (pass === true) {
            clearVerdictLegal(elId);
            if (kind === 'pip') {
                renderVerdictText(elId, '初步判斷：符合（房產／房屋＋所得門檻）', 'pass');
            } else if (kind === 'she') {
                renderVerdictText(elId, '初步判斷：符合（房產／房屋＋所得／財產門檻）', 'pass');
            } else {
                renderVerdictText(elId, '初步判斷：符合（所得／財產門檻）', 'pass');
            }
        } else if (pass === false) {
            let msg;
            if (kind === 'pip') {
                msg = '初步判斷：不符合（房產、房屋或所得未達門檻）';
            } else if (kind === 'she') {
                msg = '初步判斷：不符合（房產、房屋、所得或財產未達門檻）';
            } else {
                msg = '初步判斷：不符合（所得或財產超過門檻）';
            }
            renderVerdictText(elId, msg, 'fail');
            appendVerdictLegal(elId, legalList);
        } else if (kind === 'pip') {
            renderVerdictText(elId, '請選擇有無房產、房屋認定並輸入所得後試算', 'pending');
            clearVerdictLegal(elId);
        } else if (kind === 'she') {
            renderVerdictText(elId, '請選擇有無房產、房屋認定並填寫所得／財產後試算', 'pending');
            clearVerdictLegal(elId);
        } else {
            renderVerdictText(elId, '請輸入金額後試算', 'pending');
            clearVerdictLegal(elId);
        }
    }

    function appendVerdictLegal(elId, legalList) {
        const el = document.getElementById(elId);
        if (!el || !legalList.length) return;
        let sub = el.parentElement && el.parentElement.querySelector(`[data-telig-legal-for="${elId}"]`);
        if (!sub) {
            sub = document.createElement('div');
            sub.setAttribute('data-telig-legal-for', elId);
            sub.className = 'telig-verdict-legal text-xs text-rose-900/90 leading-relaxed mt-2 px-1';
            el.insertAdjacentElement('afterend', sub);
        }
        sub.innerHTML = `<span class="font-bold">不符合依據：</span>${legalList.map((l) => `<div class="mt-1 pl-2 border-l-2 border-rose-300">${l}</div>`).join('')}`;
    }

    function clearVerdictLegal(elId) {
        const sub = document.querySelector(`[data-telig-legal-for="${elId}"]`);
        if (sub) sub.remove();
    }

    function renderVerdictText(elId, text, tone) {
        const el = document.getElementById(elId);
        if (!el) return;
        el.classList.remove('telig-pass', 'telig-fail', 'telig-pending');
        el.textContent = text;
        el.classList.add(tone === 'pass' ? 'telig-pass' : tone === 'fail' ? 'telig-fail' : 'telig-pending');
    }

    function runCalc() {
        const f = readForm();
        syncFormVisibility();

        if (!f.cityKey || !f.city) {
            renderVerdictText('telig-pip-verdict', '請先選擇租賃縣市', 'pending');
            renderVerdictText('telig-she-verdict', '請先選擇租賃縣市', 'pending');
            renderVerdictText('telig-review-verdict', '請先選擇租賃縣市', 'pending');
            clearVerdictLegal('telig-pip-verdict');
            clearVerdictLegal('telig-she-verdict');
            clearVerdictLegal('telig-review-verdict');
            const pipList = document.getElementById('telig-pip-items');
            const sheList = document.getElementById('telig-she-items');
            const reviewList = document.getElementById('telig-review-items');
            if (pipList) pipList.innerHTML = '';
            if (sheList) sheList.innerHTML = '';
            if (reviewList) reviewList.innerHTML = '';
            updateMemberIncomeTotal();
            return;
        }

        const { city, pipNewFamily } = f;
        const pipLimit = pipNewFamily ? city.pip.incomeMonthNewFamily : city.pip.incomeMonth;

        const regionalItem = judgeRegionalProperty(f);
        const propertyItem = judgeHasProperty(f.hasPropertyKey, f.immovableWan);
        const housingItem = judgeHousingWithConsistency(f.hasPropertyKey, f.pipHousingKey, regionalItem);
        const pipIncomeItem = judgeIncome(f.pipIncome, pipLimit, 'pip');
        const sheIncomeItem = judgeIncome(f.sheIncome, city.she.incomeMonth, 'she');
        const pipItems = [regionalItem, propertyItem, housingItem, pipIncomeItem];
        const pipPass = overallPass(pipItems);

        const sheItems = [
            regionalItem,
            propertyItem,
            housingItem,
            sheIncomeItem,
            judgeSheImmovable(f.immovableWan, city.she.immovableWan, f.hasPropertyKey, f.regionalIn, f.regionalOther),
            judgeProperty(f.movableWan, city.she.movableWan, '動產', 'she'),
        ];
        let shePass = overallPass(sheItems);
        const sheNeedProperty = f.immovableWan == null || f.movableWan == null;
        if (shePass === true && sheNeedProperty) shePass = null;

        const pipList = document.getElementById('telig-pip-items');
        const sheList = document.getElementById('telig-she-items');
        if (pipList) pipList.innerHTML = pipItems.map(itemHtml).join('');
        if (sheList) sheList.innerHTML = sheItems.map(itemHtml).join('');

        const pipMeta = document.getElementById('telig-pip-meta');
        if (pipMeta) {
            pipMeta.textContent = `適用門檻：${city.label}｜${
                pipNewFamily ? '2 年內新婚／育有未成年子女家庭' : '一般家庭'
            }｜每人每月所得上限 ${fmtMoney(pipLimit)} 元`;
        }

        const sheMeta = document.getElementById('telig-she-meta');
        if (sheMeta) {
            sheMeta.textContent = `適用門檻：${city.label}｜所得 ${fmtMoney(city.she.incomeMonth)} 元／月·人｜不動產 ${fmtWan(
                city.she.immovableWan
            )} 萬｜動產 ${fmtWan(city.she.movableWan)} 萬`;
        }

        const avgHint = document.getElementById('telig-avg-hint');
        if (avgHint) {
            if (f.avgIncomeDirect != null) {
                avgHint.textContent = `試算採用：直接填寫平均所得 ${fmtMoney(f.avgIncomeDirect)} 元（租補、社宅相同）`;
            } else if (f.pipIncome.avg != null || f.sheIncome.avg != null) {
                const parts = [];
                if (f.pipIncome.avg != null) {
                    parts.push(`租補 ${fmtMoney(f.pipIncome.avg)} 元／月·人（${f.pipIncome.count} 人）`);
                }
                if (f.sheIncome.avg != null) {
                    parts.push(`社宅 ${fmtMoney(f.sheIncome.avg)} 元／月·人（${f.sheIncome.count} 人）`);
                }
                avgHint.textContent = `試算採用：${parts.join('；')}`;
            } else {
                avgHint.textContent = '請填寫成員稱謂與所得，或直接填平均所得';
            }
        }

        updateMemberIncomeTotal();

        renderVerdict('telig-pip-verdict', pipPass, { kind: 'pip', failedItems: pipItems });
        if (shePass === null && sheNeedProperty && f.sheIncome.avg != null) {
            renderVerdictText('telig-she-verdict', '請填寫不動產與動產金額（萬元）後再判斷社宅資格', 'pending');
            clearVerdictLegal('telig-she-verdict');
        } else {
            renderVerdict('telig-she-verdict', shePass, { kind: 'she', failedItems: sheItems });
        }

        renderReviewSummary(regionalItem, propertyItem, pipPass, shePass, pipItems, sheItems);
    }

    function bind() {
        const ids = [
            'telig-city',
            'telig-members',
            'telig-avg-income',
            'telig-immovable',
            'telig-movable',
            'telig-pip-new-family',
        ];
        ids.forEach((id) => {
            const el = document.getElementById(id);
            if (!el) return;
            const evt = el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input';
            el.addEventListener(evt, () => {
                if (id === 'telig-members') {
                    renderMemberIncomeFields();
                    updateMemberIncomeTotal();
                }
                runCalc();
            });
        });

        const memberContainer = document.getElementById('telig-member-incomes');
        if (memberContainer) {
            memberContainer.addEventListener('input', (e) => {
                const t = e.target;
                if (!t || !t.classList) return;
                if (t.classList.contains('telig-member-annual')) {
                    applyAnnualToMonthly(t);
                }
                if (
                    t.classList.contains('telig-member-income') ||
                    t.classList.contains('telig-member-annual')
                ) {
                    updateMemberIncomeTotal();
                    runCalc();
                }
            });
            memberContainer.addEventListener('change', (e) => {
                if (e.target && e.target.classList && e.target.classList.contains('telig-member-relation')) {
                    updateMemberRowTags();
                    updateMemberIncomeTotal();
                    runCalc();
                }
            });
        }

        document.querySelectorAll('input[name="telig-pip-housing"]').forEach((el) => {
            el.addEventListener('change', runCalc);
        });

        document.querySelectorAll('input[name="telig-has-property"]').forEach((el) => {
            el.addEventListener('change', runCalc);
        });

        document.querySelectorAll('input[name="telig-regional-in"], input[name="telig-regional-other"]').forEach((el) => {
            el.addEventListener('change', runCalc);
        });

        const btn = document.getElementById('telig-calc-btn');
        if (btn) btn.addEventListener('click', runCalc);

        renderMemberIncomeFields();
        syncFormVisibility();
        runCalc();
    }

    window.tenantEligibilityRunCalc = runCalc;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bind);
    } else {
        bind();
    }
})();
