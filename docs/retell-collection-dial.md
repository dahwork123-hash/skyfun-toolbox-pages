# Retell.ai 催收撥號設定

## 架構

```
RPA → Google 試算表「RPA催收清單」
         ↑ 讀寫
工具箱 API ←→ 催收試算表 GAS
         ↓
    Retell.ai 撥號 → Webhook 回寫試算表
```

## 1. Retell 後台

1. 註冊 [retellai.com](https://www.retellai.com)
2. 購買或匯入發話號碼（E.164，例 `+886912345678`）
3. 建立 Outbound Agent（催收話術），記下 `agent_id`
4. Settings → API Keys → 建立金鑰
5. Webhook URL：

```
https://你的API隧道網址/api/retell/webhook?token=管理員金鑰
```

## 2. server/config.json

填 `retellApiKey`、`retellFromNumber`、`retellAgentId`（試算表 GAS 網址已預填）

## 3. GAS 重新部署

需含 `listCollection`、`updateCallStatus`（若尚未部署，工具箱會改以 `listCallable` 讀取待撥名單；撥號後回寫狀態仍須部署 `updateCallStatus`）

## 4. 工具箱使用

催收解約專區 → **AI 催收撥號** → 📞 撥號
