# 部署操作手冊

這個專案分成兩個部署：

- **前端與後台**：Next.js 部署到 Vercel。
- **資料、表單、附件、寄信、自動結案**：Google Apps Script Web App，搭配 Google Sheets、Drive、Gmail。

目前公開送件表單由 Apps Script Web App 提供；Vercel 首頁只是放一顆按鈕連到那個表單。

## 1. 先準備

需要：

- 一個 Google 帳號，建議使用學權組織共用或職務帳號。
- 一個 Vercel 帳號與專案。
- Node/pnpm 已可在本機執行。

本機先確認：

```bash
pnpm install
pnpm lint
pnpm test
pnpm build
```

## 2. 部署前端到 Vercel

在 Vercel 建立專案，連到這個 Git repo。

建議設定：

- Framework Preset：Next.js
- Install Command：`pnpm install`
- Build Command：`pnpm build`
- Output Directory：不用填，讓 Vercel 自動偵測

第一次部署可以先讓它失敗或先不登入後台，因為 OAuth 和 GAS URL 還沒設定完。等下面步驟完成後，再回 Vercel 補環境變數並 Redeploy。

Vercel 環境變數在：

`Project Settings` -> `Environment Variables`

要設定：

```txt
NEXT_PUBLIC_APP_URL=https://你的-vercel-domain
NEXT_PUBLIC_CASE_FORM_URL=https://script.google.com/macros/s/.../exec
GOOGLE_APPS_SCRIPT_WEB_APP_URL=https://script.google.com/macros/s/.../exec
GOOGLE_APPS_SCRIPT_SHARED_SECRET=setupCampusVoice 產生的 SHARED_SECRET
AUTH_SECRET=一段隨機長字串
AUTH_GOOGLE_ID=Google OAuth Client ID
AUTH_GOOGLE_SECRET=Google OAuth Client Secret
```

`AUTH_SECRET` 可以用這個產生：

```bash
openssl rand -base64 32
```

`NEXT_PUBLIC_` 開頭的變數會進到瀏覽器端，所以只放公開 URL。`GOOGLE_APPS_SCRIPT_SHARED_SECRET`、`AUTH_SECRET`、`AUTH_GOOGLE_SECRET` 不要加 `NEXT_PUBLIC_`。

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
APP_URL=https://你的-vercel-domain
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

把這個 `/exec` URL 同時填到 Vercel：

```txt
NEXT_PUBLIC_CASE_FORM_URL=同一個 /exec URL
GOOGLE_APPS_SCRIPT_WEB_APP_URL=同一個 /exec URL
```

再把 `setupCampusVoice()` log 裡的 secret 填到：

```txt
GOOGLE_APPS_SCRIPT_SHARED_SECRET=...
```

設定完 Vercel env 後，重新部署 Vercel。

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

正式站：

```txt
https://你的-vercel-domain/api/auth/callback/google
```

本機開發：

```txt
http://localhost:3000/api/auth/callback/google
```

建立後，把值填到 Vercel：

```txt
AUTH_GOOGLE_ID=Client ID
AUTH_GOOGLE_SECRET=Client secret
```

如果登入時出現 `redirect_uri_mismatch`，通常就是 Google Cloud Console 的 Authorized redirect URI 跟實際 Vercel domain 不完全一致。

## 6. 自動寄信怎麼運作

目前寄信不是 Vercel 寄，也不是 Resend 寄，而是 Apps Script 用 `MailApp.sendEmail()` 透過部署者的 Google/Gmail 身分寄。

會寄信的情境：

- 學生送出申訴：寄案件編號與查詢連結給學生，並通知 Members 裡的 staff。
- 學生補充文字：寄通知給 Members 裡的 staff。
- Minister 核准回覆：寄回覆給學生。
- 自動結案：寄結案通知給學生。

注意：

- 第一次執行 `setupCampusVoice()` 或第一次送件時，Google 會要求授權。
- 寄信會吃 Google 帳號每日 quota。
- 建議用組織共用帳號部署 Apps Script，避免人員離職後權限失效。

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

## 8. 日後更新程式

### 更新 Next/Vercel

照一般 Git/Vercel 流程：

```bash
git push
```

Vercel 會自動重新部署。

### 更新 Apps Script

修改 `apps-script/` 後：

```bash
pnpm gas:push
```

如果你部署的是 Apps Script「測試部署」或 head deployment，push 後通常能直接測。

正式使用建議在 Apps Script UI：

1. `Deploy`
2. `Manage deployments`
3. Edit 目前 Web app deployment
4. Version 選 `New version`
5. Deploy

這樣使用者吃到的是固定版本，比較不會因為半成品 push 影響線上。

## 9. 為什麼送件表單由 Apps Script Web App 提供？不能直接用 Vercel 嗎？

可以直接用 Vercel，技術上沒有問題。現在放在 Apps Script 的原因是為了讓 Google Workspace 串接最少設定、最少密鑰：

- Apps Script 表單可以直接用部署者身分寫 Google Sheets、存 Drive、用 Gmail/MailApp 寄信。
- 前端送件和 Google 檔案操作都在同一個 Google runtime 內，不需要在 Vercel 設 Google service account、Drive API、Sheets API、Gmail API 或 domain-wide delegation。
- 附件可以直接從 Apps Script Web App 寫入 Drive folder，流程比較短。
- 學權組織若主要用 Google Workspace，管理資料與排錯都會集中在 Google 端。

如果改成「表單直接在 Vercel」，也可以，而且 UX 會更一致。代價是要多做一層 Google API server integration：

- Next.js route/server action 接表單與附件。
- Vercel server 端用 Google API 寫 Sheets、Drive、Gmail。
- 需要 service account 或 OAuth token 管理。
- Gmail 用個人帳號寄信時會牽涉 refresh token；用 service account 寄 Gmail 通常需要 Google Workspace 管理員設定 domain-wide delegation。
- 要自己處理附件大小、Vercel function body limit、timeout、重試與錯誤補償。

所以目前選 Apps Script Web App 是「Google 串接方便優先」。如果未來想讓表單完全融合在 Vercel 站內，建議把寄信改用 Resend 或 Google Workspace service account，再把 `apps-script/Index.html` 的 UI 搬回 Next.js。

## 10. 快速檢查清單

- Vercel 已設定全部 env。
- Apps Script 已部署 Web app，access 是 `Anyone`。
- `NEXT_PUBLIC_CASE_FORM_URL` 能開出表單。
- `GOOGLE_APPS_SCRIPT_WEB_APP_URL` 是同一個 `/exec` URL。
- `GOOGLE_APPS_SCRIPT_SHARED_SECRET` 跟 Apps Script script property 裡的 `SHARED_SECRET` 一致。
- Google OAuth redirect URI 是 `https://你的-domain/api/auth/callback/google`。
- `Members` tab 至少有一個 `minister`。
- 用表單送件後，Sheet 有新增案件、Drive 有附件、學生信箱有收到信。

## 參考文件

- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Vercel Managing Environment Variables](https://vercel.com/docs/environment-variables/managing-environment-variables)
- [Apps Script Web Apps](https://developers.google.com/apps-script/guides/web)
- [Apps Script Deployments](https://developers.google.com/apps-script/concepts/deployments)
- [Apps Script Properties Service](https://developers.google.com/apps-script/guides/properties)
- [Auth.js Google Provider](https://authjs.dev/reference/core/providers/google)
