# 星鴻工具箱 · GitHub Pages 靜態版

**Supabase 帳密登入**（與 Render 相同登入 UI），資料存 Supabase。  
**不含 Express API**：任務板、AI、催收已隱藏。

| 版本 | 網址 |
|------|------|
| GitHub Pages | https://dahwork123-hash.github.io/skyfun-toolbox-pages/ |
| Render 完整版 | https://skyfun-toolbox-api.onrender.com |

## 更新

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\prepare-pages.ps1
```

再推送到 `skyfun-toolbox-pages` 公開倉庫。

## 帳號流程

1. 使用者註冊帳密 → 待核准  
2. 管理員 `admin.html` → 輸入 Supabase 後台密碼核准  
3. 核准後可登入使用試算／文件

## 與 Render 差異

- 登入頁、註冊流程：**相同**（Supabase）  
- 任務板／AI／催收：**GitHub Pages 不提供**  
- 帳號資料：**同一套 Supabase**（與 Render 可共用帳號）
