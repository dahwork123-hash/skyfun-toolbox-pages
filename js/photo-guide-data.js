/**
 * 場勘照拍攝範例圖（靜態路徑，Netlify / 本機皆可用）
 * 新增圖片：放到 assets/photo-guides/{區域}/{項目id}/ 後執行
 *   node scripts/generate-photo-guide-data.mjs
 */
(function () {
    window.PHOTO_GUIDE_DATA = {
    "regions": {
        "shuangbei": {
            "label": "雙北",
            "ppt": "./docs/photo-guides/雙北屋況照片拍攝重點.pptx"
        },
        "taichung": {
            "label": "台中",
            "ppt": "./docs/photo-guides/台中_屋況照片拍攝重點.pptx"
        },
        "taoyuan": {
            "label": "桃園",
            "ppt": ""
        },
        "tainan": {
            "label": "台南",
            "ppt": "./docs/photo-guides/台南_拍攝必要項目.pptx"
        }
    },
    "previews": {
        "shuangbei": {
            "door-plate": [
                "./docs/photo-guides/slides/shuangbei/slide-01-02.png"
            ],
            "door-entrance": [
                "./docs/photo-guides/slides/shuangbei/slide-01-01.png"
            ],
            "door-mailbox": [
                "./docs/photo-guides/slides/shuangbei/slide-01-03.png"
            ],
            "bath-toilet": [
                "./docs/photo-guides/slides/shuangbei/slide-03-02.png"
            ],
            "bath-sink": [
                "./docs/photo-guides/slides/shuangbei/slide-03-01.png"
            ],
            "bath-shower": [
                "./docs/photo-guides/slides/shuangbei/slide-03-03.png"
            ],
            "exit-in": [
                "./docs/photo-guides/slides/shuangbei/slide-02-01.png"
            ],
            "exit-out": [
                "./docs/photo-guides/slides/shuangbei/slide-02-01.png"
            ],
            "stairs-down": [
                "./docs/photo-guides/slides/shuangbei/slide-02-02.png"
            ],
            "stairs-up": [
                "./docs/photo-guides/slides/shuangbei/slide-02-03.png"
            ],
            "fire-blank": [
                "./docs/photo-guides/slides/shuangbei/slide-05-01.jpg"
            ],
            "fire-cert": [
                "./docs/photo-guides/slides/shuangbei/slide-05-03.png"
            ],
            "fire-far": [
                "./docs/photo-guides/slides/shuangbei/slide-05-01.jpg"
            ],
            "fire-expiry": [
                "./docs/photo-guides/slides/shuangbei/slide-05-02.png"
            ],
            "fire-serial": [
                "./docs/photo-guides/slides/shuangbei/slide-05-02.png"
            ],
            "alarm-blank": [
                "./docs/photo-guides/slides/shuangbei/slide-04-01.jpg"
            ],
            "alarm-far": [
                "./docs/photo-guides/slides/shuangbei/slide-04-01.jpg"
            ],
            "alarm-close": [
                "./docs/photo-guides/slides/shuangbei/slide-04-02.png"
            ],
            "heater-unit": [
                "./docs/photo-guides/slides/shuangbei/slide-06-01.png"
            ],
            "heater-vent": [
                "./docs/photo-guides/slides/shuangbei/slide-07-01.png"
            ],
            "heater-env": [
                "./docs/photo-guides/slides/shuangbei/slide-08-01.png"
            ],
            "indoor-equip": [],
            "room-panorama": []
        },
        "taichung": {
            "door-plate": [
                "./docs/photo-guides/slides/taichung/slide-04-01.jpg",
                "./docs/photo-guides/slides/taichung/slide-04-03.jpg"
            ],
            "door-entrance": [
                "./docs/photo-guides/slides/taichung/slide-05-01.jpg",
                "./docs/photo-guides/slides/taichung/slide-05-02.png"
            ],
            "door-mailbox": [
                "./docs/photo-guides/slides/taichung/slide-04-04.jpg"
            ],
            "bath-toilet": [
                "./docs/photo-guides/slides/taichung/slide-03-02.jpg"
            ],
            "bath-sink": [
                "./docs/photo-guides/slides/taichung/slide-03-01.jpg"
            ],
            "bath-shower": [
                "./docs/photo-guides/slides/taichung/slide-03-03.jpg"
            ],
            "exit-in": [
                "./docs/photo-guides/slides/taichung/slide-04-02.jpg"
            ],
            "exit-out": [
                "./docs/photo-guides/slides/taichung/slide-04-02.jpg"
            ],
            "stairs-down": [
                "./docs/photo-guides/slides/taichung/slide-07-01.jpg"
            ],
            "stairs-up": [
                "./docs/photo-guides/slides/taichung/slide-07-02.jpg",
                "./docs/photo-guides/slides/taichung/slide-07-03.jpeg"
            ],
            "fire-blank": [
                "./docs/photo-guides/slides/taichung/slide-06-05.jpg"
            ],
            "fire-cert": [
                "./docs/photo-guides/slides/taichung/slide-06-01.jpg"
            ],
            "fire-far": [
                "./docs/photo-guides/slides/taichung/slide-06-06.jpg"
            ],
            "fire-expiry": [
                "./docs/photo-guides/slides/taichung/slide-06-04.jpg"
            ],
            "fire-serial": [
                "./docs/photo-guides/slides/taichung/slide-06-04.jpg"
            ],
            "alarm-blank": [
                "./docs/photo-guides/slides/taichung/slide-06-02.jpg"
            ],
            "alarm-far": [
                "./docs/photo-guides/slides/taichung/slide-06-02.jpg"
            ],
            "alarm-close": [
                "./docs/photo-guides/slides/taichung/slide-06-03.jpg"
            ],
            "heater-unit": [
                "./docs/photo-guides/slides/taichung/slide-01-01.jpg",
                "./docs/photo-guides/slides/taichung/slide-01-02.jpg",
                "./docs/photo-guides/slides/taichung/slide-01-03.jpg"
            ],
            "heater-vent": [
                "./docs/photo-guides/slides/taichung/slide-02-01.png",
                "./docs/photo-guides/slides/taichung/slide-02-02.png"
            ],
            "heater-env": [
                "./docs/photo-guides/slides/taichung/slide-02-03.png",
                "./docs/photo-guides/slides/taichung/slide-02-04.jpg"
            ],
            "indoor-equip": [],
            "room-panorama": []
        },
        "taoyuan": {
            "door-plate": [
                "./assets/photo-guides/taoyuan/door-plate/01.jpg"
            ],
            "door-entrance": [
                "./assets/photo-guides/taoyuan/door-entrance/01.jpg"
            ],
            "door-mailbox": [
                "./assets/photo-guides/taoyuan/door-mailbox/01.jpg"
            ],
            "bath-toilet": [
                "./assets/photo-guides/taoyuan/bath-toilet/01.jpg"
            ],
            "bath-sink": [
                "./assets/photo-guides/taoyuan/bath-sink/01.jpg"
            ],
            "bath-shower": [
                "./assets/photo-guides/taoyuan/bath-shower/01.jpg"
            ],
            "exit-in": [
                "./assets/photo-guides/taoyuan/exit-in/01.jpg"
            ],
            "stairs-down": [
                "./assets/photo-guides/taoyuan/stairs-down/01.jpg"
            ],
            "stairs-up": [
                "./assets/photo-guides/taoyuan/stairs-up/01.jpg"
            ],
            "fire-blank": [
                "./assets/photo-guides/taoyuan/fire-blank/01.jpg"
            ],
            "fire-cert": [
                "./assets/photo-guides/taoyuan/fire-cert/01.jpg"
            ],
            "fire-far": [
                "./assets/photo-guides/taoyuan/fire-far/01.jpg"
            ],
            "fire-expiry": [
                "./assets/photo-guides/taoyuan/fire-expiry/01.jpg"
            ],
            "fire-serial": [
                "./assets/photo-guides/taoyuan/fire-serial/01.jpg"
            ],
            "alarm-blank": [
                "./assets/photo-guides/taoyuan/alarm-blank/01.jpg"
            ],
            "alarm-far": [
                "./assets/photo-guides/taoyuan/alarm-far/01.jpg"
            ],
            "alarm-close": [
                "./assets/photo-guides/taoyuan/alarm-close/01.jpg"
            ],
            "heater-indoor-unit": [
                "./assets/photo-guides/taoyuan/heater-indoor-unit/01.jpg"
            ],
            "heater-indoor-vent": [
                "./assets/photo-guides/taoyuan/heater-indoor-vent/01.jpg"
            ],
            "heater-indoor-env": [
                "./assets/photo-guides/taoyuan/heater-indoor-env/01.jpg"
            ],
            "heater-outdoor-unit": [
                "./assets/photo-guides/taoyuan/heater-outdoor-unit/01.jpg"
            ],
            "heater-outdoor-vent": [
                "./assets/photo-guides/taoyuan/heater-outdoor-vent/01.jpg"
            ],
            "heater-outdoor-env": [
                "./assets/photo-guides/taoyuan/heater-outdoor-env/01.jpg"
            ],
            "indoor-equip": [
                "./assets/photo-guides/taoyuan/indoor-equip/01.jpg"
            ],
            "room-panorama": [
                "./assets/photo-guides/taoyuan/room-panorama/01.jpg"
            ]
        },
        "tainan": {
            "door-plate": [
                "./assets/photo-guides/tainan/door-plate/01.jpg",
                "./assets/photo-guides/tainan/door-plate/02.png"
            ],
            "door-entrance": [
                "./assets/photo-guides/tainan/door-entrance/01.jpg",
                "./assets/photo-guides/tainan/door-entrance/02.png"
            ],
            "door-mailbox": [
                "./assets/photo-guides/tainan/door-mailbox/01.jpg",
                "./assets/photo-guides/tainan/door-mailbox/02.png"
            ],
            "bath-toilet": [
                "./assets/photo-guides/tainan/bath-toilet/01.jpg",
                "./assets/photo-guides/tainan/bath-toilet/02.jpg"
            ],
            "bath-sink": [
                "./assets/photo-guides/tainan/bath-sink/01.jpg",
                "./assets/photo-guides/tainan/bath-sink/02.jpg"
            ],
            "bath-shower": [
                "./assets/photo-guides/tainan/bath-shower/01.jpg",
                "./assets/photo-guides/tainan/bath-shower/02.jpg"
            ],
            "exit-in": [
                "./assets/photo-guides/tainan/exit-in/01.jpg"
            ],
            "stairs-down": [
                "./assets/photo-guides/tainan/stairs-down/01.jpg"
            ],
            "stairs-up": [
                "./assets/photo-guides/tainan/stairs-up/01.jpg"
            ],
            "fire-cert": [
                "./assets/photo-guides/tainan/fire-cert/01.jpg"
            ],
            "fire-far": [
                "./assets/photo-guides/tainan/fire-far/01.jpg"
            ],
            "fire-expiry": [
                "./assets/photo-guides/tainan/fire-expiry/01.jpg"
            ],
            "fire-serial": [
                "./assets/photo-guides/tainan/fire-serial/01.jpg"
            ],
            "alarm-blank": [
                "./assets/photo-guides/tainan/alarm-blank/01.jpg",
                "./assets/photo-guides/tainan/alarm-blank/02.jpg"
            ],
            "alarm-far": [
                "./assets/photo-guides/tainan/alarm-far/01.jpg",
                "./assets/photo-guides/tainan/alarm-far/02.png",
                "./assets/photo-guides/tainan/alarm-far/03.png"
            ],
            "alarm-close": [
                "./assets/photo-guides/tainan/alarm-close/01.jpg",
                "./assets/photo-guides/tainan/alarm-close/02.jpg"
            ],
            "heater-indoor-unit": [
                "./assets/photo-guides/tainan/heater-indoor-unit/01.jpg"
            ],
            "heater-indoor-vent": [
                "./assets/photo-guides/tainan/heater-indoor-vent/01.jpg",
                "./assets/photo-guides/tainan/heater-indoor-vent/02.jpg"
            ],
            "heater-indoor-env": [
                "./assets/photo-guides/tainan/heater-indoor-env/01.jpg"
            ],
            "heater-indoor-spec": [
                "./assets/photo-guides/tainan/heater-indoor-spec/01.png"
            ],
            "heater-outdoor-unit": [
                "./assets/photo-guides/tainan/heater-outdoor-unit/01.jpg",
                "./assets/photo-guides/tainan/heater-outdoor-unit/02.jpg"
            ],
            "heater-outdoor-env": [
                "./assets/photo-guides/tainan/heater-outdoor-env/01.jpg",
                "./assets/photo-guides/tainan/heater-outdoor-env/02.jpg"
            ],
            "heater-outdoor-spec": [
                "./assets/photo-guides/tainan/heater-outdoor-spec/01.jpg"
            ],
            "heater-electric-unit": [
                "./assets/photo-guides/tainan/heater-electric-unit/01.jpg"
            ],
            "heater-electric-spec": [
                "./assets/photo-guides/tainan/heater-electric-spec/01.jpg"
            ],
            "heater-electric-env": [
                "./assets/photo-guides/tainan/heater-electric-env/01.jpg"
            ],
            "indoor-equip": [
                "./assets/photo-guides/tainan/indoor-equip/01.jpg",
                "./assets/photo-guides/tainan/indoor-equip/02.jpg",
                "./assets/photo-guides/tainan/indoor-equip/03.jpg",
                "./assets/photo-guides/tainan/indoor-equip/04.jpg"
            ]
        }
    },
    "hints": {
        "shuangbei": {
            "door-plate": "大門口與門牌拍攝規則",
            "door-entrance": "大門口與門牌拍攝規則",
            "door-mailbox": "大門口與門牌拍攝規則",
            "bath-toilet": "衛浴",
            "bath-sink": "衛浴",
            "bath-shower": "衛浴",
            "exit-in": "出入口及樓梯",
            "exit-out": "出入口及樓梯",
            "stairs-down": "出入口及樓梯",
            "stairs-up": "出入口及樓梯",
            "fire-blank": "滅火器",
            "fire-cert": "滅火器",
            "fire-far": "滅火器",
            "fire-expiry": "滅火器",
            "fire-serial": "滅火器",
            "alarm-blank": "偵煙器（住警器）拍攝規則",
            "alarm-far": "偵煙器（住警器）拍攝規則",
            "alarm-close": "偵煙器（住警器）拍攝規則",
            "heater-unit": "熱水器（電熱水器）",
            "heater-vent": "熱水器（室內強排）",
            "heater-env": "熱水器（室外）"
        },
        "taichung": {
            "door-plate": "住家門口拍攝規則（門牌／信箱）",
            "door-entrance": "社區入口拍攝規則",
            "door-mailbox": "住家門口拍攝規則（門牌／信箱）",
            "bath-toilet": "浴室拍攝規則（蓮蓬頭／洗手台／馬桶）",
            "bath-sink": "浴室拍攝規則（蓮蓬頭／洗手台／馬桶）",
            "bath-shower": "浴室拍攝規則（蓮蓬頭／洗手台／馬桶）",
            "exit-in": "住家門口拍攝規則（門牌／信箱）",
            "exit-out": "住家門口拍攝規則（門牌／信箱）",
            "stairs-down": "逃生梯拍攝規則",
            "stairs-up": "逃生梯拍攝規則",
            "fire-blank": "滅火器、偵煙器拍攝規則",
            "fire-cert": "滅火器、偵煙器拍攝規則",
            "fire-far": "滅火器、偵煙器拍攝規則",
            "fire-expiry": "滅火器、偵煙器拍攝規則",
            "fire-serial": "滅火器、偵煙器拍攝規則",
            "alarm-blank": "滅火器、偵煙器拍攝規則",
            "alarm-far": "滅火器、偵煙器拍攝規則",
            "alarm-close": "滅火器、偵煙器拍攝規則",
            "heater-unit": "熱水器拍攝規則（戶外）",
            "heater-vent": "熱水器拍攝規則（室內）",
            "heater-env": "熱水器拍攝規則（室內）"
        },
        "taoyuan": {
            "heater-indoor-unit": "桃園 · 室內／強排熱水器",
            "heater-indoor-vent": "桃園 · 室內／強排熱水器",
            "heater-indoor-env": "桃園 · 室內／強排熱水器",
            "heater-outdoor-unit": "桃園 · 室外／陽台熱水器",
            "heater-outdoor-vent": "桃園 · 室外／陽台熱水器",
            "heater-outdoor-env": "桃園 · 室外／陽台熱水器"
        },
        "tainan": {
            "door-plate": "戶政門牌照：門牌地址要非常清楚且清晰、無反光遮擋。",
            "door-entrance": "大門照由外往內：需拍到完整四個角，並預留門框上方及下方空間，請勿切齊門框；若門牌在大門旁請一併拍入（地板勿放置雜物，如地墊、拖鞋）。",
            "door-mailbox": "藝術／臨時門牌：藝術門牌拍攝清楚，門牌地址要非常清楚且清晰、無反光遮擋。",
            "bath-toilet": "衛浴三寶：拍攝到完整馬桶、洗手台、蓮蓬頭（蓮蓬頭需掛起，若未掛起需檢附原因；可個別拍或同畫面）。",
            "bath-sink": "衛浴三寶：拍攝到完整馬桶、洗手台、蓮蓬頭（蓮蓬頭需掛起，若未掛起需檢附原因；可個別拍或同畫面）。",
            "bath-shower": "衛浴三寶：拍攝到完整馬桶、洗手台、蓮蓬頭（蓮蓬頭需掛起，若未掛起需檢附原因；可個別拍或同畫面）。",
            "exit-in": "社區路口／大門照（勿有障礙物）。",
            "stairs-down": "樓梯間：清楚拍到平台與台階、牆面及地板且保持淨空；牆面若有寫物件樓層請核對；預留平台上方及下方空間，請勿切齊台階。",
            "stairs-up": "樓梯間：清楚拍到平台與台階、牆面及地板且保持淨空；牆面若有寫物件樓層請核對；預留平台上方及下方空間，請勿切齊台階。",
            "fire-cert": "滅火器：需拍攝清楚且放大的銀標。",
            "fire-far": "滅火器遠照：勿太近，需能清楚辨識在室內。",
            "fire-expiry": "清楚且放大的製造日期及有效日期照（勿裁切到製造日期及「有效年限3年」等字）。",
            "fire-serial": "滅火器手寫物件地址照：無需寫縣市；地址須寫在滅火器規格貼紙旁，足以辨識滅火器。",
            "alarm-blank": "偵煙近照：清楚銀標；需有完整偵煙器或火警警報器、勿裁切（銀標無反光模糊，可清楚看見「消」字）。",
            "alarm-far": "偵煙遠照：須把偵煙器或火警警報器用紅框框起；天花板上要拍到燈具或天花板與牆面的 Y 字牆角（若裝在牆面，請連天花板一併拍入）。後圖為獨立型偵煙器／火警警報器安裝規範。",
            "alarm-close": "偵煙近照：清楚銀標；需有完整偵煙器或火警警報器、勿裁切（銀標無反光模糊，可清楚看見「消」字）。",
            "heater-indoor-unit": "瓦斯熱水器（室內）：放置位置照。",
            "heater-indoor-vent": "瓦斯熱水器（室內）：拍攝到排氣管出口照。",
            "heater-indoor-env": "瓦斯熱水器（室內）：放置位置／環境照。",
            "heater-indoor-spec": "瓦斯熱水器（室內）規格表近照（模糊不清楚也需拍照證明檢附）。",
            "heater-outdoor-unit": "瓦斯熱水器（室外）：放置位置照。",
            "heater-outdoor-env": "證明為室外空間照：拍攝到天空，或用棍棒／掃把伸出證明熱水器為室外空間。",
            "heater-outdoor-spec": "瓦斯熱水器（室外）規格表近照（模糊不清楚也需拍照檢附證明）。",
            "heater-electric-unit": "電熱水器：放置位置／機器照。",
            "heater-electric-spec": "電熱水器規格表近照（規格表模糊或不清楚也需拍照檢附證明）。",
            "heater-electric-env": "電熱水器：放置位置照。",
            "indoor-equip": "室內設備照：安全檢核表上填寫的附屬設備（家俱、家電）都要拍到；若有多件以上，僅需檢附一張證明物件內有此物即可。"
        }
    }
};
})();
