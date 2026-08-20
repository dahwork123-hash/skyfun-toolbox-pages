/**
 * 任務板／業務問答／照會 API 位址
 *
 * 本機或公司主機同網域：維持 ''（與網頁同源自動連 API）。
 *
 * Netlify（三選一，建議 1）：
 *   1) Netlify 環境變數 NB_TRACKER_API_URL（建置時寫入 api-base.json，見 netlify.toml）
 *   2) 複製 api-base.json.example → api-base.json，填 "base": "https://你的隧道…"
 *   3) 直接改下面 NB_TRACKER_API（需重新部署才會上線）
 *
 * 公司主機請一併設定 server/config.json 的 corsOrigins 含 Netlify 網址。
 */
window.NB_TRACKER_API = '';

/**
 * 業務問答 AI 與任務板共用 API。管理者於 server/config.json 設定 openaiApiKey
 * 或環境變數 OPENAI_API_KEY 即可啟用。
 */
