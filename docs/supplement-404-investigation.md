# 補件 404 與載入延遲調查（2026-09-10）

## 觀察與原因

- 正式 Apps Script 部署存在且可正常回傳 JSON，並非永久失效的部署 URL。
- 直接診斷觀察到 `/exec` POST 回傳 302 後，`script.googleusercontent.com` 的結果讀取偶發 404；其他請求成功。Google ContentService 本來就會將結果轉至一次性網址：https://developers.google.com/apps-script/guides/content#redirects 。Google 端為何偶發回傳 404 無法從應用程式端確定。
- 舊版 `callGas` 將任何最終 HTTP 錯誤直接判為送出失敗；但 POST 可能已完成寫入。因此只重送 POST 也會有重複留言風險。
- 確認信連結實際可以開啟。案件查詢需讀五張 Sheet，每張都先查欄位並呼叫 `setFrozenRows`；學生頁不需要草稿與審核資料。實測舊查詢曾需 18 秒，無效 token 診斷也曾需 29 秒，顯示 Google 服務延遲亦有波動。
- 補件會先組合整份案件、寫入後再由 `revalidatePath` 等待一次案件重讀，延後成功結果。
- 選檔元件清空原生 input，只留下 React `files` 狀態，卻直接送出原生 FormData；檔案因此未包含在請求中。
- Next.js Server Actions 預設限制 1MB，與介面允許每檔 8MB 不一致。

## 修正

- 明確處理 ContentService 多層轉址，以不攜帶 shared secret 的 GET 取得結果，限制在兩個 Google Script 主機內、最多 5 次。正式 Worker 也捕捉到第二層 302。
- 部署驗證確認本專案的 Cloudflare runtime 不支援 `redirect: "error"`（Node.js 可接受），已統一使用 `manual` 並檢查狀態碼，加入回歸測試。
- 每次請求有 30 秒期限。唯讀操作與具有 requestId 的補件允許一次 transport retry；其他寫入不重試。
- 同一補件重試沿用 requestId，Apps Script 在鎖內查核已完成訊息並重用已寫入的附件。requestId 留在表單記憶體中，重整頁面後不保證沿用。
- Sheet 讀取不執行初始化或凍結列；學生頁只取案件、公開訊息與附件。補件只查案件列，不讀整個對話。
- 成功回應與畫面重新整理分開；顯示成功後背景更新紀錄。載入錯誤顯示可重試畫面，不偽裝成案件不存在。
- 送出前將 React 選檔狀態加入 FormData。每次最多 3 檔、每檔 8MB，Server Actions 上限 26MB。
- 信件主要按鈕移至摘要上方；案件頁置頂操作，精簡文字、加入載入畫面及鍵盤可操作的選檔按鈕。

## 驗證

- Vitest：31 tests passed；相關 ESLint、TypeScript、OpenNext production build 通過。
- Chrome：正式頁文字補件成功；新版載入畫面、置頂操作與精簡表單可見。
- 正式 Apps Script：上傳 1,229,883 bytes PNG 成功（約 9.7 秒）；相同 requestId 重送成功（約 4.9 秒），讀回確認只有 1 筆訊息與 1 筆附件，大小一致。更新後這次案件讀取約 4.0 秒。單次量測不代表延遲保證。
- 正式網站的 Next.js Server Action multipart 上傳：1,229,883 bytes PNG，HTTP 200、成功訊息，約 14.4 秒；Chrome 重新載入確認附件可見。
- Chrome 最終正式版本文字送出：成功提示可見，背景更新後新留言自動出現在對話紀錄；送出期間控制項停用。
- Chrome 擴充功能未允許本機 file URL，直接自動選檔受限；附件透過正式 API 與網站 Server Action 完成驗證。
- 新信件 HTML 已在 Chrome 預覽，案件按鈕位於摘要上方。
- Apps Script 更新至第 7 版；Cloudflare 前端最終版本 `a8902f8b-a2fb-419b-92dd-bc73ab027acd` 已部署，兩個既有自訂網域已納入 wrangler 設定。
- 所有人工測試訊息均標示「系統測試」。沒有建立 git commit。
