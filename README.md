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

## GitHub Pages

這個儲存庫用 GitHub Actions 部署。推送到 `main` 時，工作流程會以 `actions/upload-pages-artifact` 上傳網站檔案，再用 `actions/deploy-pages` 發布。其他分支的推送不會部署。

第一次啟用時，請到儲存庫的 **Settings → Pages**，把來源（Source）設為 **GitHub Actions**。

合併到 `main` 並且部署完成後，網站會出現在：

https://ioksengtan.github.io/design_thinking/
