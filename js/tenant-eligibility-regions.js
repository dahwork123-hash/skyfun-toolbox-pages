/**
 * 依租賃縣市 — 規定區域內不得有房產；其他縣市持分不得逾 40 ㎡
 * 對照星鴻社宅資格審查「區域內不得有房產(不動產)」表
 */
(function (global) {
    'use strict';

    const CITY_LABELS = {
        taipei: '台北市',
        newtaipei: '新北市',
        taoyuan: '桃園市',
        hsinchu: '新竹縣市',
        taichung: '台中市',
        changhua: '彰化縣',
        nantou: '南投縣',
        tainan: '台南市',
        kaohsiung: '高雄市',
        chiayi: '嘉義縣市',
        yilan: '宜蘭縣',
        keelung: '基隆市',
        offshore: '金門縣、連江縣',
        other: '其餘縣市',
    };

    /** 租賃縣市 → 規定區域內不得有房產之縣市 key 列表 */
    const RESTRICTED_BY_RENTAL = {
        taipei: ['taipei', 'newtaipei'],
        newtaipei: ['keelung', 'taoyuan'],
        taoyuan: ['taipei', 'newtaipei', 'keelung', 'taoyuan', 'hsinchu'],
        hsinchu: ['hsinchu'],
        taichung: ['taichung', 'changhua', 'nantou'],
        changhua: ['taichung', 'changhua', 'nantou'],
        nantou: ['taichung', 'changhua', 'nantou'],
        tainan: ['tainan'],
        kaohsiung: ['kaohsiung'],
        chiayi: ['chiayi'],
        yilan: ['taipei', 'newtaipei', 'keelung', 'yilan'],
        keelung: ['taipei', 'newtaipei', 'keelung', 'taoyuan'],
        offshore: [],
        other: [],
    };

    function getRestrictedKeys(rentalKey) {
        return RESTRICTED_BY_RENTAL[rentalKey] || [];
    }

    function getRestrictedLabels(rentalKey) {
        return getRestrictedKeys(rentalKey).map((k) => CITY_LABELS[k] || k);
    }

    function getRentalLabel(rentalKey) {
        return CITY_LABELS[rentalKey] || rentalKey;
    }

    /**
     * @param {object} input
     * @param {string} input.rentalKey
     * @param {string|null} input.hasPropertyKey - no | coowned_only | yes
     * @param {string|null} input.regionalIn - none | under40 | has
     * @param {string|null} input.regionalOther - none | under40 | over40
     * @param {(pass: boolean|null, detail: string, opts?: object) => object} input.resultItem
     */
    function judgeRegionalProperty(input) {
        const { rentalKey, hasPropertyKey, regionalIn, regionalOther, resultItem: ri } = input;
        const rentalLabel = getRentalLabel(rentalKey);
        const zoneLabels = getRestrictedLabels(rentalKey);
        const zoneText = zoneLabels.length ? zoneLabels.join('、') : '（本表未列，請依主管機關／執行要點審查）';

        if (hasPropertyKey === 'no') {
            return ri(
                true,
                `區域房產：租賃${rentalLabel}；規定區域（${zoneText}）及其他縣市均無房產`
            );
        }

        if (!zoneLabels.length && (rentalKey === 'other' || rentalKey === 'offshore')) {
            if (regionalOther === 'over40') {
                return ri(false, `區域房產：其他縣市持分達 40 ㎡ 以上，不符合`, {
                    basisKey: 'regional_other_over40',
                    program: 'both',
                });
            }
            if (regionalOther == null && regionalIn == null) {
                return ri(null, `區域房產：${rentalLabel}請填寫其他縣市房產狀況`, {
                    basisKey: 'regional_missing',
                    program: 'both',
                });
            }
            return ri(
                true,
                `區域房產：${rentalLabel}（表列區域外縣市）；其他縣市：${
                    regionalOther === 'under40' ? '持分均未滿 40 ㎡' : regionalOther === 'none' ? '無房產' : '已填寫'
                }`
            );
        }

        if (regionalIn == null || regionalOther == null) {
            return ri(null, `區域房產：請填寫「規定區域內」及「其他縣市」房產狀況（租賃縣市：${rentalLabel}）`, {
                basisKey: 'regional_missing',
                program: 'both',
            });
        }

        if (regionalIn === 'has') {
            return ri(
                false,
                `區域房產：規定區域（${zoneText}）內持有房產，不符合（40 ㎡ 以下持分且其他共有人非家庭成員者除外）`,
                { basisKey: 'regional_restricted_has', program: 'both' }
            );
        }

        if (regionalOther === 'over40') {
            return ri(false, `區域房產：其他縣市持分面積達 40 ㎡ 以上，不符合`, {
                basisKey: 'regional_other_over40',
                program: 'both',
            });
        }

        const inPart =
            regionalIn === 'under40'
                ? `規定區域（${zoneText}）內僅持分 40 ㎡ 以下（其他共有人非家庭成員）`
                : `規定區域（${zoneText}）內無房產`;
        const otherPart =
            regionalOther === 'under40' ? '其他縣市有房，持分均未滿 40 ㎡' : '其他縣市無房產';

        return ri(true, `區域房產：租賃${rentalLabel}；${inPart}；${otherPart}`);
    }

    global.TenantEligibilityRegions = {
        CITY_LABELS,
        RESTRICTED_BY_RENTAL,
        getRestrictedKeys,
        getRestrictedLabels,
        getRentalLabel,
        judgeRegionalProperty,
    };
})(typeof window !== 'undefined' ? window : globalThis);
