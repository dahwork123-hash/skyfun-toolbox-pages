/**
 * 承租資格試算 — 法源依據（第三至五期執行要點、住宅法、300億作業規定）
 * 住都字第1140030759號；住宅法；台內國字第1140808903號、115.1.9國署住字第1151002186號
 */
(function (global) {
    'use strict';

    const DOC = {
        exec: '《社會住宅包租代管第三至五期計畫執行要點》',
        execNo: '住都字第1140030759號',
        housingAct: '《住宅法》',
        pipOps: '《三百億元中央擴大租金補貼專案計畫作業規定》',
        propertyStd: '《住宅補貼對象一定所得及財產標準》',
        propertyStdOrder: '115.1.9國署住字第1151002186號（115/1/1生效）',
    };

    /** @type {Record<string, { she?: string, pip?: string, both?: string }>} */
    const BASIS = {
        property_missing: {
            both: `${DOC.exec}第21點（應備齊家庭成員資料後審查）`,
        },
        property_no_immovable_conflict: {
            both: `${DOC.exec}第21點第(二)款（均無自有住宅）；${DOC.exec}第17點（自有住宅認定）`,
        },
        housing_not_ok: {
            she: `${DOC.exec}第21點第(二)款；${DOC.exec}第17點第(二)款（視為有自有住宅）`,
            pip: `${DOC.pipOps}（房屋資格）；${DOC.exec}第17點第(二)款`,
            both: `${DOC.housingAct}第25條第1項（限無自有住宅或符合例外者）`,
        },
        housing_inconsistent: {
            both: `${DOC.exec}第17點、第21點第(二)款（自有住宅認定與申報不一致）`,
        },
        housing_has_but_no_owned: {
            both: `${DOC.exec}第21點第(二)款；${DOC.exec}第17點第(二)款第1目`,
        },
        housing_coowned_ok: {
            both: `${DOC.exec}第17點第(一)款第1目（持分未滿40㎡之共有住宅，視為無自有住宅）`,
        },
        housing_no_owned_ok: {
            both: `${DOC.exec}第21點第(二)款`,
        },
        housing_demolish_ok: {
            both: `${DOC.exec}第17點第(一)款第4目`,
        },
        housing_damaged_ok: {
            both: `${DOC.exec}第17點第(一)款第3目`,
        },
        income_over_she: {
            she: `${DOC.exec}第21點第(三)款；${DOC.propertyStd}附表一（${DOC.propertyStdOrder}）`,
        },
        income_over_pip: {
            pip: `${DOC.pipOps}；${DOC.propertyStd}附表一（${DOC.propertyStdOrder}）`,
        },
        immovable_over: {
            she: `${DOC.exec}第21點第(三)款；${DOC.propertyStd}附表一不動產限額；${DOC.housingAct}第25條第1項`,
        },
        movable_over: {
            she: `${DOC.exec}第21點第(三)款；${DOC.propertyStd}附表一動產限額；${DOC.housingAct}第25條第1項`,
        },
        immovable_coowned_note: {
            she: `${DOC.exec}第17點第(一)款第1目（持分40㎡以下不列入）；第21點第(三)款`,
        },
        regional_missing: {
            both: `${DOC.exec}第21點（承租資格審查應備文件）；社宅資格「區域內不得有房產」`,
        },
        regional_restricted_has: {
            both: `社宅資格審查「區域內不得有房產」；${DOC.exec}第21點第(二)款；${DOC.exec}第17點第(二)款（視為有自有住宅）`,
        },
        regional_other_over40: {
            both: `${DOC.exec}第17點第(一)款第1目（個別持分未滿40㎡視為無自有住宅）；區域外持分不得逾40㎡`,
        },
        weak_identity: {
            she: `${DOC.exec}第22點；${DOC.housingAct}第4條第2項（弱勢戶身分）`,
        },
    };

    /**
     * @param {'she'|'pip'|'both'} program
     * @param {keyof typeof BASIS} key
     */
    function cite(program, key) {
        const row = BASIS[key];
        if (!row) return '';
        if (row.both) return row.both;
        if (program === 'she' && row.she) return row.she;
        if (program === 'pip' && row.pip) return row.pip;
        return row.she || row.pip || row.both || '';
    }

    /**
     * @param {boolean|null} pass
     * @param {string} detail
     * @param {{ program?: 'she'|'pip'|'both', basisKey?: keyof typeof BASIS, legal?: string }} [opts]
     */
    function item(pass, detail, opts) {
        const o = opts || {};
        let legal;
        if (pass === false) {
            if (o.legal) legal = o.legal;
            else if (o.basisKey) legal = cite(o.program || 'both', o.basisKey);
        }
        if (pass === true && o.basisKey && o.showPassBasis) {
            legal = cite(o.program || 'both', o.basisKey);
        }
        return { pass, detail, legal };
    }

    function pending(detail, basisKey) {
        return item(null, detail, basisKey ? { basisKey, program: 'both' } : {});
    }

    global.TenantEligibilityLegal = {
        DOC,
        BASIS,
        cite,
        item,
        pending,
    };
})(typeof window !== 'undefined' ? window : globalThis);
