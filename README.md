# 清華大學學生申訴協力系統

Next.js + Google Apps Script Web App + Google Sheets/Drive/Gmail 的學生申訴送件與學權組織協作系統。

## Stack

- Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui
- Auth.js Google OAuth for staff login
- Cloudflare Worker for public intake and Apps Script for case processing
- Google Sheets for case data, members, drafts, reviews, and audit logs
- Google Drive for uploaded attachments
- Gmail/MailApp from Google Apps Script for notifications
- Tiptap rich-text editor

## Development

```bash
pnpm install
pnpm dev
```

## Environment

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_APP_URL`
- `GOOGLE_APPS_SCRIPT_WEB_APP_URL`
- `GOOGLE_APPS_SCRIPT_SHARED_SECRET`
- `AUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`

## Google Apps Script Setup

The Apps Script source lives in `apps-script/` and is managed with clasp.

完整部署操作請看 [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)。

1. Create or clone an Apps Script project.
2. Copy `apps-script/.clasp.json.example` to `apps-script/.clasp.json` and set `scriptId`.
3. Push the Apps Script source:

```bash
pnpm gas:push
```

4. In Apps Script, set script property `APP_URL` to the deployed Next.js URL.
5. Run `setupCampusVoice()` once and authorize the script.
6. Deploy the script as a web app.
7. Copy the `/exec` URL to `GOOGLE_APPS_SCRIPT_WEB_APP_URL`.
8. Copy the logged `SHARED_SECRET` to `GOOGLE_APPS_SCRIPT_SHARED_SECRET`.

### Public Form

The public form lives at `https://appeal.nthusa.tw/`. The Cloudflare Worker forwards up to 10 PDF, Word, PNG, or JPG attachments of 8 MB each and the appeal details to Apps Script. Deploy the Apps Script update before the Worker. See the [deployment guide](docs/DEPLOYMENT.md) for the rollout and checks.

## Staff Access

Staff authorization is controlled by the `Members` tab in the generated Google Sheet.

- `minister` can manage members and approve reviews.
- `member` can work cases and submit reviews.

The email used for Google OAuth must match an email in `Members`.

## Checks

```bash
pnpm lint
pnpm test
pnpm build
```
