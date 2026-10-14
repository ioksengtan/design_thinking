# 設計思考方法卡

介紹設計思考六個階段的方法：研究、定義、發想、收斂、原型、測試。網頁從 `data/cards.json` 讀取二十七張方法卡，依情況、階段與關鍵字篩選。

預期網址：https://ioksengtan.github.io/design_thinking/

## 本機預覽

在儲存庫根目錄執行：

```bash
python3 -m http.server
```

然後用瀏覽器打開 http://127.0.0.1:8000/

請用本機伺服器開啟，不要直接點開 `index.html`。瀏覽器以檔案方式開啟時，無法讀取 `data/cards.json`。

插圖是這個儲存庫裡的原創向量圖，放在 `illustrations/`。每張方法卡、每個階段和首屏各有一張。

## GitHub Pages

網站用 GitHub Pages 的「Deploy from a branch」發布。來源是 `main` 分支的根目錄。

到 **Settings → Pages**，Source 選 **Deploy from a branch**，Branch 選 `main`，資料夾選 `/ (root)`。

推送到 `main` 之後，網站會出現在：

https://ioksengtan.github.io/design_thinking/
