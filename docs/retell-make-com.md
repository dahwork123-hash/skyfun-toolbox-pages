# Retell 催收 × Make.com 撈資料

## API 端點

| 方法 | 路徑 | 用途 |
|------|------|------|
| GET | `/api/retell/calls` | 列出通話紀錄（Make.com 主要用這個） |
| GET | `/api/retell/calls/:id` | 單筆詳情 |
| POST | `/api/retell/outbound-call` | 工具箱發起撥號 |
| POST | `/api/retell/webhook` | Retell 回傳通話事件 |

## 驗證

Header 擇一：

```
X-API-Key: （server/config.json 的 makeApiKey）
```

或

```
X-Admin-Key: （adminKey）
```

## 催收自動化（案件狀態）

```
GET https://你的主機/api/collection/cases?since=2026-05-19T00:00:00Z&status=escalated_14
Header: X-API-Key: makeApiKey
```

定時觸發一輪（同步欠租＋撥號＋升級）：

```
POST https://你的主機/api/collection/run
Header: X-API-Key: makeApiKey
```

詳見 `docs/催收自動化藍圖.md`。

---

## Make.com 設定範例

1. 新增模組：**HTTP → Make a request**
2. URL：`https://你的公司主機/api/retell/calls`
3. Method：`GET`
4. Headers：
   - `X-API-Key` = 你的 makeApiKey
5. Query（選填）：
   - `since` = `{{上次執行時間 ISO}}`（只撈新資料）
   - `status` = `analyzed`（只要分析完成的）
   - `limit` = `50`

## 回傳 JSON 範例

```json
{
  "count": 1,
  "calls": [
    {
      "id": "uuid",
      "retell_call_id": "retell_xxx",
      "case_id": "A12345",
      "tenant_name": "王小明",
      "tenant_phone": "+886912345678",
      "property_address": "台北市…",
      "rent_amount": "15000",
      "overdue_days": "7",
      "pay_deadline": "5月25日",
      "rent_month": "114年5月",
      "status": "analyzed",
      "disconnection_reason": "user_hangup",
      "call_summary": "房客表示下週五匯款",
      "promise_pay_date": "",
      "transcript": "…",
      "recording_url": "https://…",
      "created_at": "2026-05-19T10:00:00.000Z",
      "ended_at": "2026-05-19T10:05:00.000Z",
      "analyzed_at": "2026-05-19T10:05:30.000Z"
    }
  ]
}
```

## 建議排程

- 每 **15～30 分鐘** 執行一次 HTTP 模組
- 用 `since` 過濾避免重複（Make 可用 Data store 記上次時間）
- `call_analyzed` 事件後欄位最完整，可篩 `status=analyzed`

## Retell Webhook（公司主機）

Retell Dashboard → Agent → Webhook URL：

```
https://你的公司主機/api/retell/webhook?token=config裡的retellWebhookToken
```

事件建議勾選：`call_ended`、`call_analyzed`

## 首次設定 checklist

1. 複製 `server/config.example.json` → `server/config.json`
2. 填入 `retellApiKey`、`retellAgentId`、`retellFromNumber`
3. `cd server && npm install && npm start`
4. 工具箱開啟租管師專區 → **AI 電話催收**
5. Make.com 用 `X-API-Key` 測試 GET `/api/retell/calls`
