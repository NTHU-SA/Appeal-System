# 部署操作手冊

這個專案分成兩個部署：

- **前端與後台**：Next.js 部署到 **Cloudflare Workers**（使用 OpenNext）。
- **資料、表單、附件、寄信、自動結案**：Google Apps Script Web App，搭配 Google Sheets、Drive、Gmail。

目前公開送件表單由 Apps Script Web App 提供；Cloudflare Worker 首頁放按鈕連到該表單。

---

## 1. 先準備

需要：

- 一個 Google 帳號，建議使用學權組織共用或職務帳號。
- 一個 Cloudflare 帳號（Workers 免費方案即可）。
- Node/pnpm 已可在本機執行。

本機先確認測試與檢查通過：

```bash
pnpm install
pnpm lint
pnpm test
```

---

## 2. 部署前端到 Cloudflare Workers

### A. 登入 Cloudflare

在終端機登入 Wrangler：

```bash
pnpm exec wrangler login
```

### B. 設定 Cloudflare Workers 敏感環境變數 (Secrets)

請將以下敏感金鑰透過 `wrangler secret put` 寫入 Worker（也可在 Cloudflare Dashboard > Workers & Pages > campusvoice > Settings > Variables 填入）：

```bash
# NextAuth Session 加密金鑰（產生隨機字串：openssl rand -base64 32）
pnpm exec wrangler secret put AUTH_SECRET

# Google OAuth 憑證（由 Google Cloud Console 取得）
pnpm exec wrangler secret put AUTH_GOOGLE_ID
pnpm exec wrangler secret put AUTH_GOOGLE_SECRET

# Google Apps Script 串接設定（由步驟 3、4 取得）
pnpm exec wrangler secret put GOOGLE_APPS_SCRIPT_WEB_APP_URL
pnpm exec wrangler secret put GOOGLE_APPS_SCRIPT_SHARED_SECRET
```

### C. 設定公開環境變數 (Vars)

在 `wrangler.jsonc` 的 `vars` 區塊設定（或在 Cloudflare Dashboard 設定）：

```jsonc
"vars": {
  "NEXT_PUBLIC_APP_URL": "https://campusvoice.<你的帳號>.workers.dev",
  "NEXT_PUBLIC_CASE_FORM_URL": "https://script.google.com/macros/s/.../exec"
}
```

> **注意**：`NEXT_PUBLIC_` 開頭的變數會進到瀏覽器端，所以只放公開 URL。機密金鑰請務必使用 `wrangler secret put`。

### D. 本機建置與預覽

```bash
pnpm build:worker
pnpm preview
```

### E. 正式部署

```bash
pnpm run deploy
```

---

## 3. 建立與部署 Apps Script

Apps Script 原始碼在 `apps-script/`，用 clasp 管理。

先登入 clasp：

```bash
pnpm exec clasp login
```

建立 Apps Script 專案可以二選一：

### 方法 A：用 Apps Script UI 建立

1. 到 [script.google.com](https://script.google.com/) 建立新專案。
2. 進入 `Project Settings`。
3. 複製 `Script ID`。
4. 在本機建立 `apps-script/.clasp.json`：

```json
{
  "scriptId": "貼上你的 Script ID",
  "rootDir": "."
}
```

### 方法 B：用 clasp 建立

```bash
pnpm exec clasp -P apps-script create-script --title "CampusVoice"
```

確認 `apps-script/.clasp.json` 已存在後，推送程式碼：

```bash
pnpm gas:push
```

接著打開 Apps Script：

```bash
pnpm gas:open
```

在 Apps Script 裡設定 Script property：

1. 左側齒輪 `Project Settings`
2. 找到 `Script Properties`
3. 加入：

```txt
APP_URL=https://你的-cloudflare-worker-網址
```

然後執行一次 `setupCampusVoice()`：

1. 在上方 function dropdown 選 `setupCampusVoice`
2. 按 `Run`
3. 依畫面授權 Google Drive、Sheets、寄信等權限
4. 看 execution log，記下：
   - Sheet URL
   - Drive folder URL
   - `SHARED_SECRET`

`setupCampusVoice()` 會建立：

- Google Sheet 和 tabs：`Cases`、`Messages`、`Attachments`、`DraftReplies`、`ReviewRequests`、`Members`、`AuditLogs`、`Settings`
- Drive folder，用來放案件附件
- 每天凌晨 2 點的自動結案 trigger
- 把執行 setup 的 Google 帳號加入 `Members`，角色是 `minister`

---

## 4. 發布 Apps Script Web App

在 Apps Script 編輯器：

1. 右上角 `Deploy`
2. `New deployment`
3. Type 選 `Web app`
4. 設定：
   - Execute as：`Me`
   - Who has access：`Anyone`
5. 按 `Deploy`
6. 複製 Web app URL，通常長得像：

```txt
https://script.google.com/macros/s/......../exec
```

把這個 `/exec` URL 設定到 Cloudflare Worker：

```bash
pnpm exec wrangler secret put GOOGLE_APPS_SCRIPT_WEB_APP_URL
# 輸入 /exec URL
```

同時將 `NEXT_PUBLIC_CASE_FORM_URL` 填入 `wrangler.jsonc`。

並把 `setupCampusVoice()` log 裡的 secret 填入：

```bash
pnpm exec wrangler secret put GOOGLE_APPS_SCRIPT_SHARED_SECRET
# 輸入 SHARED_SECRET
```

---

## 5. 設定 Google OAuth 登入

後台登入使用 Auth.js + Google OAuth。

到 [Google Cloud Console](https://console.cloud.google.com/)：

1. 建立或選擇一個 Google Cloud project。
2. 到 `APIs & Services` -> `OAuth consent screen`。
3. 設定 App name、support email、developer contact email。
4. 到 `APIs & Services` -> `Credentials`。
5. 建立 `OAuth client ID`。
6. Application type 選 `Web application`。
7. 加 Authorized redirect URIs：

正式站（Cloudflare Worker 網址）：

```txt
https://你的-worker-網址/api/auth/callback/google
```

本機開發：

```txt
http://localhost:3000/api/auth/callback/google
```

建立後，把值設定到 Cloudflare Worker：

```bash
pnpm exec wrangler secret put AUTH_GOOGLE_ID
pnpm exec wrangler secret put AUTH_GOOGLE_SECRET
```

如果登入時出現 `redirect_uri_mismatch`，通常就是 Google Cloud Console 的 Authorized redirect URI 跟實際 Cloudflare Worker 網址不完全一致。

---

## 6. 自動寄信怎麼運作

目前寄信不是 Cloudflare 寄，也不是 Resend 寄，而是 Apps Script 用 `MailApp.sendEmail()` 透過部署者的 Google/Gmail 身分寄。

會寄信的情境：

- 學生送出申訴：寄案件編號與查詢連結給學生，並通知 Members 裡的 staff。
- 學生補充文字：寄通知給 Members 裡的 staff。
- Minister 核准回覆：寄回覆給學生。
- 自動結案：寄結案通知給學生。

注意：

- 第一次執行 `setupCampusVoice()` 或第一次送件時，Google 會要求授權。
- 寄信會吃 Google 帳號每日 quota。
- 建議用組織共用帳號部署 Apps Script，避免人員離職後權限失效。

---

## 7. 賦予管理員與部員權限

權限在 Google Sheet 的 `Members` tab 控制。

欄位大致是：

```txt
id | email | role | created_at | updated_at
```

角色：

- `minister`：可管理成員、核准審核、寄正式回覆。
- `member`：可看案件、撰寫草稿、送審。

最簡單方式：

1. 打開 `setupCampusVoice()` log 裡的 Sheet URL。
2. 到 `Members` tab。
3. 新增一列：

```txt
id: 可留空或填任意唯一值
email: 管理員 Google 登入 email
role: minister 或 member
created_at: 可留空
updated_at: 可留空
```

更建議方式：

1. 先用 setup 時自動加入的 minister 帳號登入後台。
2. 到 `/admin/members`。
3. 用後台 UI 新增或移除成員。

後台登入 email 必須跟 `Members.email` 完全一致，大小寫不重要。

---

## 8. 日後更新程式

### 更新 Next.js / Cloudflare Worker

```bash
pnpm run deploy
```

或透過 GitHub Actions 自動部署：

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Workers

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"
      - run: pnpm install
      - run: pnpm build:worker
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

### 更新 Apps Script

修改 `apps-script/` 後：

```bash
pnpm gas:push
```

正式使用建議在 Apps Script UI：

1. `Deploy`
2. `Manage deployments`
3. Edit 目前 Web app deployment
4. Version 選 `New version`
5. Deploy

---

## 9. 快速檢查清單

- Cloudflare Worker 已設定全部 Secrets 與 Vars。
- Apps Script 已部署 Web app，access 是 `Anyone`。
- `NEXT_PUBLIC_CASE_FORM_URL` 能開出表單。
- `GOOGLE_APPS_SCRIPT_WEB_APP_URL` 是同一個 `/exec` URL。
- `GOOGLE_APPS_SCRIPT_SHARED_SECRET` 跟 Apps Script script property 裡的 `SHARED_SECRET` 一致。
- Google OAuth redirect URI 是 `https://你的-worker-網址/api/auth/callback/google`。
- `Members` tab 至少有一個 `minister`。
- 用表單送件後，Sheet 有新增案件、Drive 有附件、學生信箱有收到信。

---

## 參考文件

- [OpenNext for Cloudflare](https://opennext.js.org/cloudflare)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare Wrangler Configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [Apps Script Web Apps](https://developers.google.com/apps-script/guides/web)
- [Auth.js Google Provider](https://authjs.dev/reference/core/providers/google)
