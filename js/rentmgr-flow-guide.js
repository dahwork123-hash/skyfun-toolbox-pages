/**
 * 租管師專區 — 新人範本 × 續約情境流程產生器
 */
(function () {
    'use strict';

    function $(id) {
        return document.getElementById(id);
    }

    const SCENARIOS = {
        newLease: {
            key: 'newLease',
            title: '新招租／委租新案（非續約）',
            badge: '招租',
            badgeClass: 'rmfg-badge--sky',
            summary: '從場勘招租到收資料送審的完整路線。',
            steps: [
                {
                    phase: '接洽',
                    title: '電話／到場前確認',
                    items: [
                        '房東：手機、存摺銀行、通訊地址、本人是否到場／代理人、115 年房屋稅單、媒合租金、是否不公證、家電家具修繕狀況',
                        '安檢：管理費、家電家具品項數量',
                        '房客（媒合後）：手機、緊急聯絡人、存摺、寵物、戶籍謄本／戶口名簿、特殊身分',
                        '必確認：偵煙器／滅火器是否合格、窗簾數量、財調是否齊全'
                    ],
                    ref: '《〈範例〉》電話/到場前確認清單'
                },
                {
                    phase: '場勘',
                    title: '場勘＋招租',
                    items: [
                        '確認是否簽委租、產權人／社宅資格／新青安／重構退稅',
                        '確認熱水器、偵煙器、滅火器（含銀標與效期）',
                        '蒐集 591 刊登資訊：樓層格局、設備、租金管理費、車位、開伙寵物祭祀入戶籍',
                        '帶看方式：鑰匙位置、時間限制、委託書、帶看費、管理室電話'
                    ],
                    ref: '《場勘+招租》',
                    doc: { label: '01.場勘+招租1160210.docx', href: './01.%E5%A0%B4%E5%8B%98%2B%E6%8B%9B%E7%A7%9F1160210.docx' }
                },
                {
                    phase: '媒合',
                    title: '房客媒合與信任租',
                    items: [
                        '房客確定後，執行信任租徵信並人工核對（BLL、監理站罰單、拒往被查、東吳評等）',
                        '不通過者不得進件；有疑慮請先與主管確認'
                    ],
                    link: { label: '→ 信任租不通過條件（專區第 2 項）', rentmgrItem: 2 }
                },
                {
                    phase: '收資料',
                    title: '收資料送審',
                    items: [
                        '排除條件：新青安、重構退稅、是否曾加入社宅',
                        '資料收齊前：委租日期、調謄本',
                        '房東／房客資料、物件資料、特殊身份文件',
                        '合約照片：門牌大門、衛浴、出入口、消防、熱水器、設備（依清單逐張拍）'
                    ],
                    ref: '《收資料用》',
                    doc: { label: '02.場勘+收資料1160303.docx', href: './02.%E5%A0%B4%E5%8B%98%2B%E6%94%B6%E8%B3%87%E6%96%991160303.docx' }
                },
                {
                    phase: '送審',
                    title: '送審與簽約',
                    items: [
                        '資料齊全後送審，追蹤補件',
                        '簽約當日確認印章、附約（寵物／車位）',
                        '新案完成進件後，依客服 SOP 建群與官方 LINE（非「續約客服退群」流程）'
                    ]
                }
            ]
        },
        renew_same_same: {
            key: 'renew_same_same',
            title: '續約 · 原房客 · 租金不變',
            badge: '續約',
            badgeClass: 'rmfg-badge--rose',
            summary: '最常見續約：同一位房客、租金不調整。',
            steps: [
                {
                    phase: '提前',
                    title: '到期前 2～3 個月：確認續約意願',
                    items: [
                        '官方 LINE 分別聯繫房東、房客確認是否續約',
                        '提醒房客：若要續約須提前處理，避免租補中斷',
                        '房東準備：身分證（一年內換證需新版）、最新課稅明細',
                        '可一併探詢是否願意改簽包租（見官方 LINE 範本）'
                    ],
                    link: { label: '→ 官方 LINE 續約＋轉包租範本', rentmgrItem: 6 }
                },
                {
                    phase: '資料',
                    title: '續約件資料確認（簡化版）',
                    items: [
                        '調謄本：□是',
                        '房東：身分證有效、新年度房屋稅單／課稅明細、代理人文件（如有）',
                        '房客：身分證有效；戶籍若無異動可提供截圖',
                        '信任租／財調：依系統或主管要求（同客續約通常可沿用，以當次規定為準）',
                        '消防：滅火器效期、偵煙器銀標'
                    ],
                    ref: '《續約件用》基本資料區',
                    doc: { label: '02-1.案件內容確認-續約件1150505.docx', href: './02-1.%E6%A1%88%E4%BB%B6%E5%85%A7%E5%AE%B9%E7%A2%BA%E8%AA%8D-%E7%BA%8C%E7%B4%84%E4%BB%B61150505.docx' }
                },
                {
                    phase: '照片',
                    title: '續約件合約照片',
                    items: [
                        '門牌＋大門（由外往內含門牌）',
                        '衛浴、出入口／樓梯、社區大門',
                        '消防：滅火器（銀標／效期／遠照／編號）、偵煙器',
                        '瓦斯／電熱水器；設備能拍就拍（五期需 6 張以上）'
                    ],
                    ref: '【合約照片相關】（續約件用）'
                },
                {
                    phase: '送審',
                    title: '送審簽約',
                    items: [
                        '確認合約類型（包租／代租）、是否公證',
                        '資料收齊後：代墊消防、寵物條款／車位附約、代刻印章',
                        '公司續約件：到期前 30 天完成續約'
                    ]
                },
                {
                    phase: '完成',
                    title: '續約完成 → 客服接手',
                    items: [
                        '確認 5 項：合約已交付、消防補助、官方 LINE、保險／公證補助（適用時）',
                        '群組發送交接範本後，租管師退出群組'
                    ],
                    link: { label: '→ 續約後客服接手群組服務（專區第 1 項）', rentmgrItem: 1 }
                }
            ]
        },
        renew_same_rent: {
            key: 'renew_same_rent',
            title: '續約 · 原房客 · 有漲租',
            badge: '續約＋漲租',
            badgeClass: 'rmfg-badge--amber',
            summary: '同一位房客續約，但租金調整，須完成租金評定與雙方確認。',
            extraNote: '除下列步驟外，請同步完成「租金評定」並更新媒合頁面／合約金額，房東房客均須確認新租金後再送審。',
            steps: [
                {
                    phase: '提前',
                    title: '到期前：續約意願＋新租金說明',
                    items: [
                        '官方 LINE 確認續約，並事先說明租金調整原因與金額',
                        '房客若有租補，提醒租金變動可能影響補助，請提早協調',
                        '取得房東、房客口頭同意後再製作合約'
                    ],
                    link: { label: '→ 官方 LINE 範本', rentmgrItem: 6 }
                },
                {
                    phase: '評定',
                    title: '租金評定（必做）',
                    items: [
                        '完成租金評定表／系統評定流程',
                        '確認純租金、押金、管理費、車位費是否一併調整',
                        '評定結果與房東預期一致後再請房客簽約'
                    ]
                },
                {
                    phase: '資料',
                    title: '續約件資料＋金額確認',
                    items: [
                        '調謄本、房東稅單、房客身分與戶籍（同「原房客續約」）',
                        '物件資料欄：更新租金、押金、管理費、車位費',
                        '消防設備檢查照舊'
                    ],
                    ref: '《續約件用》確認物件資料',
                    doc: { label: '02-1.案件內容確認-續約件.docx', href: './02-1.%E6%A1%88%E4%BB%B6%E5%85%A7%E5%AE%B9%E7%A2%BA%E8%AA%8D-%E7%BA%8C%E7%B4%84%E4%BB%B61150505.docx' }
                },
                {
                    phase: '照片',
                    title: '續約件合約照片',
                    items: ['同「原房客・租金不變」續約照片清單'],
                    ref: '【合約照片相關】（續約件用）'
                },
                {
                    phase: '送審',
                    title: '送審簽約',
                    items: ['資料與評定齊全後送審', '簽約時再次確認金額與附約', '到期前 30 天完成續約']
                },
                {
                    phase: '完成',
                    title: '續約完成 → 客服接手',
                    items: ['同「原房客續約」完成後 5 項確認與群組交接'],
                    link: { label: '→ 續約後客服接手', rentmgrItem: 1 }
                }
            ]
        },
        renew_new_same: {
            key: 'renew_new_same',
            title: '續約 · 換房客 · 租金不變',
            badge: '換房客',
            badgeClass: 'rmfg-badge--violet',
            summary: '房東續約但換新房客，須重跑信任租與完整收資料。',
            steps: [
                {
                    phase: '提前',
                    title: '房東續約＋新房客媒合',
                    items: [
                        '先與房東確認續約及是否同意更換房客',
                        '新房客須重新媒合、信任租徵信、財調',
                        '官方 LINE 可先用房東版確認續約，房客版待新房客確定後發送'
                    ],
                    link: { label: '→ 官方 LINE 範本', rentmgrItem: 6 }
                },
                {
                    phase: '徵信',
                    title: '信任租＋財調（必做）',
                    items: [
                        '新房客一律執行信任租，依 BLL／監理站罰單／拒往明細／東吳評等判斷',
                        '財調須通過方可進件',
                        '特殊身份、分戶配偶、代理人文件依「收資料用」準備'
                    ],
                    link: { label: '→ 信任租不通過條件', rentmgrItem: 2 }
                },
                {
                    phase: '換客',
                    title: '換房客專項確認',
                    items: [
                        '是否配偶（非同戶籍）及新戶籍謄本',
                        '分戶配偶、代理人身分證有效性',
                        '清點核對家具家電（釐清房東／房客責任）',
                        '約時間拍照或請房客拍照留證'
                    ],
                    ref: '《續約件用》若換房客或調整租金'
                },
                {
                    phase: '資料',
                    title: '續約件＋新房客收資料',
                    items: [
                        '調謄本、房東資料、物件資料（租金不變但仍須勾選確認）',
                        '房客欄位以新房客為主：身分證、戶籍謄本、健保卡、租補地址、信任租同意書',
                        '合約照片：依續約件清單完整拍攝（含設備現況）'
                    ],
                    ref: '《收資料用》房客資料 ＋ 《續約件用》',
                    doc: { label: '02-1.案件內容確認-續約件.docx', href: './02-1.%E6%A1%88%E4%BB%B6%E5%85%A7%E5%AE%B9%E7%A2%BA%E8%AA%8D-%E7%BA%8C%E7%B4%84%E4%BB%B61150505.docx' }
                },
                {
                    phase: '送審',
                    title: '送審簽約',
                    items: ['資料齊全後送審', '注意入戶籍、換鎖、寵物附約等勾選', '到期前 30 天完成']
                },
                {
                    phase: '完成',
                    title: '完成後客服接手',
                    items: ['簽約完成後執行續約客服 5 項確認與群組交接'],
                    link: { label: '→ 續約後客服接手', rentmgrItem: 1 }
                }
            ]
        },
        renew_new_rent: {
            key: 'renew_new_rent',
            title: '續約 · 換房客 · 有漲租',
            badge: '換客＋漲租',
            badgeClass: 'rmfg-badge--rose',
            summary: '最完整流程：新房客＋租金調整，請預留較多作業時間。',
            extraNote: '＝「換房客」全部步驟 ＋ 「有漲租」的租金評定與雙方確認。建議先完成評定與房東同意，再媒合房客。',
            steps: [
                {
                    phase: '提前',
                    title: '房東：續約＋漲租意願',
                    items: [
                        '確認房東同意續約、新租金及是否換房客',
                        '完成租金評定後再開始招租／媒合'
                    ],
                    link: { label: '→ 官方 LINE 房東版', rentmgrItem: 6 }
                },
                {
                    phase: '評定',
                    title: '租金評定（必做）',
                    items: [
                        '評定新純租金、押金、管理費',
                        '房東書面或 LINE 確認後，媒合頁面更新再帶看'
                    ]
                },
                {
                    phase: '徵信',
                    title: '新房客：信任租＋財調',
                    items: [
                        '信任租、財調、特殊身份文件',
                        '換房客家具家電清點與拍照'
                    ],
                    link: { label: '→ 信任租條件', rentmgrItem: 2 }
                },
                {
                    phase: '資料',
                    title: '收資料＋續約件合併辦理',
                    items: [
                        '以「收資料用」標準收齊新房客資料',
                        '「續約件用」調謄本、房東確認、換房客注意事項',
                        '物件租金欄位填寫評定後金額',
                        '續約件＋收資料用合約照片清單（擇嚴格者完整拍攝）'
                    ],
                    ref: '《收資料用》＋《續約件用》',
                    doc: { label: '02.場勘+收資料 + 02-1 續約件', href: './02.%E5%A0%B4%E5%8B%98%2B%E6%94%B6%E8%B3%87%E6%96%991160303.docx' }
                },
                {
                    phase: '送審',
                    title: '送審簽約',
                    items: ['評定、徵信、資料、照片均齊全再送審', '簽約當日核對金額與房客身分', '到期前 30 天完成']
                },
                {
                    phase: '完成',
                    title: '完成後客服接手',
                    items: ['5 項確認＋群組交接範本'],
                    link: { label: '→ 續約後客服接手', rentmgrItem: 1 }
                }
            ]
        }
    };

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    const answers = { renewal: null, tenant: null, rent: null };

    function getAnswers() {
        return { ...answers };
    }

    function isReadyToRender() {
        if (answers.renewal === 'no') return true;
        if (answers.renewal === 'yes') return answers.tenant !== null && answers.rent !== null;
        return false;
    }

    function resolveScenario() {
        if (answers.renewal === 'no') return SCENARIOS.newLease;
        if (answers.renewal !== 'yes') return null;

        const tenantChange = answers.tenant === 'yes';
        const rentUp = answers.rent === 'yes';
        if (tenantChange && rentUp) return SCENARIOS.renew_new_rent;
        if (tenantChange) return SCENARIOS.renew_new_same;
        if (rentUp) return SCENARIOS.renew_same_rent;
        return SCENARIOS.renew_same_same;
    }

    function answerLabels() {
        if (answers.renewal === 'no') return ['新招租／委租新案'];
        const chips = ['續約案件'];
        chips.push(answers.tenant === 'yes' ? '換新房客' : '原房客續約');
        chips.push(answers.rent === 'yes' ? '有漲租' : '租金不變');
        return chips;
    }

    function renderStep(step, index) {
        const items = (step.items || [])
            .map((t) => `<li>${escapeHtml(t)}</li>`)
            .join('');
        let meta = '';
        if (step.ref) {
            meta += `<p class="rmfg-step-ref">📎 對照下方範本：<strong>${escapeHtml(step.ref)}</strong></p>`;
        }
        if (step.doc) {
            meta += `<p class="rmfg-step-ref"><a href="${step.doc.href}" target="_blank" rel="noopener noreferrer" class="text-rose-700 underline font-semibold">📄 ${escapeHtml(step.doc.label)}</a></p>`;
        }
        if (step.link) {
            meta += `<p class="rmfg-step-ref"><button type="button" class="rmfg-link-btn" data-rentmgr-item="${step.link.rentmgrItem}">${escapeHtml(step.link.label)}</button></p>`;
        }
        return `<li class="rmfg-step">
            <div class="rmfg-step-head">
                <span class="rmfg-step-num">${index + 1}</span>
                <span class="rmfg-step-phase">${escapeHtml(step.phase)}</span>
            </div>
            <div class="rmfg-step-body">
                <div class="rmfg-step-title">${escapeHtml(step.title)}</div>
                <ul class="rmfg-step-items">${items}</ul>
                ${meta}
            </div>
        </li>`;
    }

    function renderFlow() {
        const out = $('rmfg-output');
        const resultWrap = $('rd-result-wrap');
        const copyBtn = $('rmfg-copy');
        if (!out) return;

        if (!isReadyToRender()) {
            resultWrap?.classList.add('is-hidden');
            copyBtn?.classList.add('hidden');
            out.innerHTML = '';
            return;
        }

        const scenario = resolveScenario();
        if (!scenario) return;

        const stepsHtml = scenario.steps.map((s, i) => renderStep(s, i)).join('');
        const chips = answerLabels()
            .map((t) => `<span class="rd-answer-chip">${escapeHtml(t)}</span>`)
            .join('');

        let extra = '';
        if (scenario.extraNote) {
            extra = `<div class="rmfg-extra-note">${escapeHtml(scenario.extraNote)}</div>`;
        }

        resultWrap?.classList.remove('is-hidden');
        copyBtn?.classList.remove('hidden');

        out.innerHTML = `
            <div class="rd-answers">${chips}</div>
            <div class="rmfg-result-head">
                <span class="rmfg-badge ${scenario.badgeClass}">${escapeHtml(scenario.badge)}</span>
                <h4 class="rmfg-result-title">${escapeHtml(scenario.title)}</h4>
                <p class="rmfg-result-summary">${escapeHtml(scenario.summary)}</p>
            </div>
            ${extra}
            <ol class="rmfg-steps">${stepsHtml}</ol>
            <p class="rmfg-footnote text-xs text-slate-500 mt-3">* 流程供內部 SOP 參考；細項欄位請展開下方對照範本，實際以公司最新規範與主管指示為準。</p>`;

        out.querySelectorAll('[data-rentmgr-item]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const n = parseInt(btn.getAttribute('data-rentmgr-item'), 10);
                if (typeof window.openRentmgrItem === 'function') window.openRentmgrItem(n);
                if (typeof window.showPage === 'function') window.showPage('rentmanager');
            });
        });
    }

    function syncChoiceButtons() {
        document.querySelectorAll('#rmfg-panel .rd-choice').forEach((btn) => {
            const key = btn.getAttribute('data-rd');
            const val = btn.getAttribute('data-value');
            btn.classList.toggle('is-selected', answers[key] === val);
        });
    }

    function onChoiceClick(btn) {
        const key = btn.getAttribute('data-rd');
        const val = btn.getAttribute('data-value');
        if (!key || !val) return;

        answers[key] = val;

        if (key === 'renewal') {
            const follow = $('rd-follow');
            if (val === 'yes') {
                follow?.classList.remove('hidden');
            } else {
                follow?.classList.add('hidden');
                answers.tenant = null;
                answers.rent = null;
            }
        }

        syncChoiceButtons();
        renderFlow();
    }

    function copyFlowSummary() {
        const scenario = resolveScenario();
        if (!scenario) return;
        const lines = [
            `【續約決策】${scenario.title}`,
            ...answerLabels().map((l) => `· ${l}`),
            scenario.summary,
            ''
        ];
        if (scenario.extraNote) lines.push(scenario.extraNote, '');
        scenario.steps.forEach((s, i) => {
            lines.push(`${i + 1}. [${s.phase}] ${s.title}`);
            (s.items || []).forEach((item) => lines.push(`   · ${item}`));
            if (s.ref) lines.push(`   （對照：${s.ref}）`);
            lines.push('');
        });
        const text = lines.join('\n').trim();
        navigator.clipboard?.writeText(text).then(() => {
            const btn = $('rmfg-copy');
            if (btn) {
                const orig = btn.textContent;
                btn.textContent = '已複製';
                setTimeout(() => { btn.textContent = orig; }, 1600);
            }
        });
    }

    function init() {
        const panel = $('rmfg-panel');
        if (!panel) return;

        panel.querySelectorAll('.rd-choice').forEach((btn) => {
            btn.addEventListener('click', () => onChoiceClick(btn));
        });
        $('rmfg-copy')?.addEventListener('click', copyFlowSummary);
        syncChoiceButtons();
        renderFlow();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.rentmgrFlowGuideRender = renderFlow;
})();
