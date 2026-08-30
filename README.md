# 星鴻工具箱 · GitHub Pages 靜態版

**Supabase 帳密登入**（與 Render 相同登入 UI），資料存 Supabase。  
**不含 Express API**：任務板、AI、催收已隱藏。

| 版本 | 網址 |
|------|------|
| **正式 GitHub Pages** | https://thinklover.github.io/skyfun-toolbox-pages/ |
| Render 完整版 | https://skyfun-toolbox-api.onrender.com |

> 舊網址 `dahwork123-hash.github.io/skyfun-toolbox-pages/` 已停用，不會隨 push 更新。

## 更新並部署

```powershell
# 1. 複製 webhook 設定（只需第一次）
copy scripts\deploy-webhook.url.example scripts\deploy-webhook.url
# 編輯 deploy-webhook.url 填入 Cloud Build webhook 完整 URL

# 2. 推送 + 觸發 Cloud Build（約 4 分鐘內收 Email）
powershell -ExecutionPolicy Bypass -File .\scripts\deploy-publish.ps1
```

若只改靜態檔、已 push 過，也可手動 POST webhook（`Content-Type: application/json`、body `{}`）。

## 帳號流程

1. 使用者註冊帳密 → 待核准  
2. 管理員 `admin.html` → 輸入 Supabase 後台密碼核准  
3. 核准後可登入使用試算／文件

## 與 Render 差異

- 登入頁、註冊流程：**相同**（Supabase）  
- 任務板／AI／催收：**GitHub Pages 不提供**  
- 帳號資料：**同一套 Supabase**（與 Render 可共用帳號）
