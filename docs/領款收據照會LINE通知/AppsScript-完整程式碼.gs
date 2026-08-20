/**
 * 領款收據 · 主管照會 LINE 通知（方案 A · 照會群優先）
 *
 * 業務送件 → LINE Notify 發到「照會群」
 * 主管照會完畢 → 發到照會群（＋可選：再發給該業務個人 Token）
 *
 * Token 設定（擇一或並用）：
 * 1) Apps Script 專案設定 NOTIFY_GROUP_TOKEN（最簡單）
 * 2) 試算表「設定」角色＝照會群
 * 3) 試算表「設定」角色＝主管（舊版個人 token，仍支援）
 */

const SHEET_SETTINGS = '設定';
const SHEET_SUBMIT = '送件';
const SHEET_DONE = '完畢';

const COL_ROLE = '角色';
const COL_NAME = '姓名';
const COL_TOKEN = 'LINE_NOTIFY_TOKEN';

const ROLE_GROUP = '照會群';
const ROLE_SUPERVISOR = '主管';
const ROLE_BUSINESS = '業務';

const PROP_GROUP_TOKEN = 'NOTIFY_GROUP_TOKEN';
const PROP_ENDORSEMENT_URL = 'ENDORSEMENT_FORM_URL';
const PROP_FALLBACK_BIZ = 'FALLBACK_BUSINESS_NOTIFY_TOKEN';
/** 完畢時是否同時發照會群（true/false，預設 true） */
const PROP_DONE_TO_GROUP = 'DONE_NOTIFY_TO_GROUP';

const DEFAULT_ENDORSEMENT_URL = 'https://reurl.cc/0aEyZ9';

function onReceiptSubmitForm(e) {
  handleSubmitResponse_(e, SHEET_SUBMIT);
}

function onReceiptDoneForm(e) {
  handleDoneResponse_(e, SHEET_DONE);
}

function testNotifyGroup() {
  const tokens = getGroupNotifyTokens_();
  if (!tokens.length) {
    throw new Error('請設定 NOTIFY_GROUP_TOKEN 或試算表「照會群」列');
  }
  lineNotify_(tokens[0], '【測試】領款收據照會\n照會群通知測試成功 ✓');
}

function testNotifySupervisor() {
  testNotifyGroup();
}

function testNotifyBusiness() {
  const map = getNotifyMapByRole_(ROLE_BUSINESS);
  const firstBiz = Object.keys(map).find((k) => k && map[k]);
  if (!firstBiz) throw new Error('設定表無「業務」個人 token（若只用照會群可略過）');
  lineNotify_(map[firstBiz], '【測試】領款收據照會\n業務個人通知測試 → ' + firstBiz);
}

function handleSubmitResponse_(e, sheetName) {
  const sheet = e.range.getSheet();
  if (sheet.getName() !== sheetName) return;

  const row = e.range.getRow();
  const data = rowToObject_(sheet, row);
  const caseId = pick_(data, ['案件編號', '案號', '系統案號', '案件編號/系統案號']);
  const bizName = pick_(data, ['業務姓名', '送件業務', '業務']);
  const region = pick_(data, ['區域', '縣市', '服務區域']);
  const landlord = pick_(data, ['房東姓名', '房東']);
  const deposit = pick_(data, ['押金金額', '押金', '押金（元）']);
  const note = pick_(data, ['備註', '說明', '補充說明']);

  if (!caseId) {
    Logger.log('送件列缺少案件編號，略過通知');
    return;
  }

  const endorsementUrl = getScriptProp_(PROP_ENDORSEMENT_URL) || DEFAULT_ENDORSEMENT_URL;
  const msg = [
    '【領款收據】待主管照會',
    '案件編號：' + caseId,
    bizName ? '送件業務：' + bizName : '',
    region ? '區域：' + region : '',
    landlord ? '房東：' + landlord : '',
    deposit ? '押金：' + deposit : '',
    note ? '備註：' + note : '',
    '',
    '請完成電話照會後填寫登記表：',
    endorsementUrl,
    '',
    '照會完畢後請填「主管照會完畢回報」表單（案號需相同）。'
  ].filter(Boolean).join('\n');

  notifyToGroupAndSupervisors_(msg);
}

function handleDoneResponse_(e, sheetName) {
  const sheet = e.range.getSheet();
  if (sheet.getName() !== sheetName) return;

  const row = e.range.getRow();
  const data = rowToObject_(sheet, row);
  const caseId = pick_(data, ['案件編號', '案號', '系統案號', '案件編號/系統案號']);
  const supervisor = pick_(data, ['照會主管', '主管姓名', '處長/主管']);
  const result = pick_(data, ['照會結果', '結果', '狀態']) || '照會完畢';
  const note = pick_(data, ['照會備註', '備註', '說明']);

  if (!caseId) {
    Logger.log('完畢列缺少案件編號，略過通知');
    return;
  }

  const submitInfo = findSubmitByCaseId_(caseId);
  const bizName = submitInfo
    ? pick_(submitInfo, ['業務姓名', '送件業務', '業務'])
    : pick_(data, ['業務姓名', '送件業務', '業務']);

  const msg = buildDoneMessage_(caseId, supervisor, result, note, bizName);

  if (doneNotifyToGroup_()) {
    notifyToGroupAndSupervisors_(msg);
  }

  const bizToken = bizName ? getTokenByNameAndRole_(bizName, ROLE_BUSINESS) : '';
  if (bizToken) {
    lineNotify_(bizToken, msg);
    return;
  }

  if (!doneNotifyToGroup_()) {
    const fallback = getScriptProp_(PROP_FALLBACK_BIZ);
    if (fallback) {
      lineNotify_(fallback, msg + '\n（⚠ 未對應業務個人 token）');
    } else {
      Logger.log('找不到業務 token 且未開啟照會群完畢通知');
    }
  } else {
    Logger.log('已發照會群；業務無個人 token：' + (bizName || '(未填)'));
  }
}

function buildDoneMessage_(caseId, supervisor, result, note, bizName) {
  return [
    '【領款收據】照會結果通知',
    bizName ? '送件業務：' + bizName : '',
    '案件編號：' + caseId,
    supervisor ? '照會主管：' + supervisor : '',
    '結果：' + result,
    note ? '備註：' + note : '',
    '',
    '可繼續後續領款收據／進件流程。'
  ].filter(Boolean).join('\n');
}

/** 送件／完畢：照會群 token + 舊版主管個人 token（去重） */
function notifyToGroupAndSupervisors_(message) {
  const tokens = uniqueTokens_(
    getGroupNotifyTokens_().concat(getTokensByRole_(ROLE_SUPERVISOR))
  );
  if (!tokens.length) {
    Logger.log('無任何 Notify token（照會群／主管）');
    return;
  }
  tokens.forEach((t) => lineNotify_(t, message));
}

function getGroupNotifyTokens_() {
  const fromProp = getScriptProp_(PROP_GROUP_TOKEN);
  const out = [];
  if (fromProp) out.push(fromProp.trim());
  getTokensByRole_(ROLE_GROUP).forEach((t) => out.push(t));
  return uniqueTokens_(out);
}

function doneNotifyToGroup_() {
  const v = getScriptProp_(PROP_DONE_TO_GROUP).trim().toLowerCase();
  if (v === 'false' || v === '0' || v === 'no') return false;
  return true;
}

function uniqueTokens_(arr) {
  const seen = {};
  const out = [];
  arr.forEach((t) => {
    const k = String(t || '').trim();
    if (!k || seen[k]) return;
    seen[k] = true;
    out.push(k);
  });
  return out;
}

function findSubmitByCaseId_(caseId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_SUBMIT);
  if (!sheet || sheet.getLastRow() < 2) return null;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const idCol = findHeaderIndex_(headers, ['案件編號', '案號', '系統案號', '案件編號/系統案號']);
  if (idCol < 0) return null;

  const lastRow = sheet.getLastRow();
  const ids = sheet.getRange(2, idCol + 1, lastRow - 1, 1).getValues();
  const target = String(caseId).trim();
  for (let i = ids.length - 1; i >= 0; i--) {
    if (String(ids[i][0] || '').trim() === target) {
      return rowToObject_(sheet, i + 2);
    }
  }
  return null;
}

function lineNotify_(token, message) {
  const t = String(token || '').trim();
  if (!t) return { ok: false, error: 'empty_token' };

  const res = UrlFetchApp.fetch('https://notify-api.line.me/api/notify', {
    method: 'post',
    headers: { Authorization: 'Bearer ' + t },
    payload: { message: String(message || '').slice(0, 950) },
    muteHttpExceptions: true
  });
  const code = res.getResponseCode();
  if (code >= 200 && code < 300) return { ok: true };
  Logger.log('LINE Notify failed ' + code + ' ' + res.getContentText());
  return { ok: false, error: 'http_' + code };
}

function getNotifyMapByRole_(role) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_SETTINGS);
  if (!sheet) return {};
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return {};

  const headers = values[0].map((h) => String(h || '').trim());
  const iRole = headers.indexOf(COL_ROLE);
  const iName = headers.indexOf(COL_NAME);
  const iToken = headers.indexOf(COL_TOKEN);
  if (iName < 0 || iToken < 0) return {};

  const want = String(role || '').trim();
  const map = {};
  for (let r = 1; r < values.length; r++) {
    if (iRole >= 0 && String(values[r][iRole] || '').trim() !== want) continue;
    const name = String(values[r][iName] || '').trim();
    const token = String(values[r][iToken] || '').trim();
    if (!name || !token) continue;
    map[name] = token;
  }
  return map;
}

function getTokenByNameAndRole_(name, role) {
  const n = String(name || '').trim();
  return getNotifyMapByRole_(role)[n] || '';
}

function getTokensByRole_(role) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_SETTINGS);
  if (!sheet) return [];
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map((h) => String(h || '').trim());
  const iRole = headers.indexOf(COL_ROLE);
  const iToken = headers.indexOf(COL_TOKEN);
  if (iRole < 0 || iToken < 0) return [];

  const want = String(role || '').trim();
  const out = [];
  for (let r = 1; r < values.length; r++) {
    if (String(values[r][iRole] || '').trim() !== want) continue;
    const token = String(values[r][iToken] || '').trim();
    if (token) out.push(token);
  }
  return out;
}

function rowToObject_(sheet, row) {
  const lastCol = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const values = sheet.getRange(row, 1, 1, lastCol).getValues()[0];
  const o = {};
  headers.forEach((h, i) => {
    const key = String(h || '').trim();
    if (key) o[key] = values[i];
  });
  return o;
}

function pick_(obj, keys) {
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    if (obj[k] != null && String(obj[k]).trim() !== '') return String(obj[k]).trim();
  }
  return '';
}

function findHeaderIndex_(headers, candidates) {
  const norm = headers.map((h) => String(h || '').trim());
  for (let c = 0; c < candidates.length; c++) {
    const idx = norm.indexOf(candidates[c]);
    if (idx >= 0) return idx;
  }
  return -1;
}

function getScriptProp_(key) {
  return PropertiesService.getScriptProperties().getProperty(key) || '';
}

function setupSpreadsheetHeaders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheetHeaders_(ss, SHEET_SETTINGS, ['角色', '姓名', 'LINE_NOTIFY_TOKEN', '備註']);
  ensureSheetHeaders_(ss, SHEET_SUBMIT, [
    '時間戳記', '案件編號', '業務姓名', '區域', '房東姓名', '押金金額', '備註'
  ]);
  ensureSheetHeaders_(ss, SHEET_DONE, [
    '時間戳記', '案件編號', '照會主管', '照會結果', '照會備註'
  ]);

  const settings = ss.getSheetByName(SHEET_SETTINGS);
  if (settings && settings.getLastRow() === 1) {
    settings.getRange(2, 1, 1, 4).setValues([
      [ROLE_GROUP, '領款收據照會群', '（貼群組 Notify Token）', '發行時選「透過群組接收」']
    ]);
  }
}

function ensureSheetHeaders_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
}
