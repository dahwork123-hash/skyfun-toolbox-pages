場勘照拍攝範例圖 — 資料夾說明
================================

把範例照片依「區域 + 項目」放進對應資料夾，再執行：

  node scripts/generate-photo-guide-data.mjs

就會更新 js/photo-guide-data.js，網站「範本」按鈕即可預覽（Netlify 靜態部署可用）。

資料夾結構
----------
assets/photo-guides/
  shuangbei/          ← 雙北
    door-plate/       ← 對應勾選項目（見下方 ID 表）
      01.jpg
      02.png
    bath-toilet/
      01.jpg
  taichung/           ← 台中
    door-plate/
      01.jpg
  taoyuan/            ← 桃園（範例圖來自 物件照範本-桃園，執行 scripts/import-taoyuan-photo-samples.mjs）
    door-plate/
      01.jpg
    heater-indoor-unit/
      01.jpg
  tainan/             ← 台南（範例圖來自桌面「範例照片_安檢_台南」，執行 scripts/import-tainan-photo-samples.mjs）
    door-plate/
      01.jpg
    heater-outdoor-unit/
      01.jpg

檔名任意，副檔名支援：jpg jpeg png webp gif
同一資料夾可放多張，會依檔名排序顯示。

項目 ID（資料夾名稱請用英文 ID）
------------------------------
door-plate        門牌
door-entrance     大門出入口（桃園：家門外往內）
door-mailbox      信箱（桃園：門牌遠照）
bath-toilet       馬桶
bath-sink         洗手台
bath-shower       蓮蓬頭
exit-in           大門外往內（桃園：家門外往內；與 door-entrance／door-mailbox 共用範例圖）
exit-out          大門內往外
stairs-down       逃生梯向下
stairs-up         逃生梯向上
fire-blank        滅火器空白照
fire-cert         滅火器認證標章
fire-far          滅火器遠照
fire-expiry       滅火器有效期限
fire-serial       滅火器鋼瓶編號
alarm-blank       住警器空白照
alarm-far         住警器遠照
alarm-close       住警器近照
heater-unit       熱水器機器照（雙北／台中）
heater-vent       熱水器排氣管
heater-env        熱水器環境照
heater-indoor-unit    桃園·室內強排機器照
heater-indoor-vent    桃園·室內強排排氣管
heater-indoor-env     桃園·室內強排環境照
heater-outdoor-unit   桃園·室外／陽台機器照
heater-outdoor-vent   桃園·室外／陽台排氣管
heater-outdoor-env    桃園·室外／陽台環境照
indoor-equip      室內設備
room-panorama     全室範圍照

若某項目資料夾是空的，系統會依 docs/photo-guides/manifest.json 的
photoPreviewMap（slide + indices）只帶出該項對應的範例圖，不會整頁簡報混在一起。
你放上自己的照片後重新產生 data.js，就會改吃 assets 內的圖。

完整 PPT 仍放在：docs/photo-guides/*.pptx
