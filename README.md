# 清華大學學生申訴協力系統

Next.js + Google Apps Script + Google Forms/Sheets/Drive/Gmail 的學生申訴送件與學權組織協作系統。

## Stack

- Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui
- Auth.js Google OAuth for staff login
- Google Forms for public case intake
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
- `NEXT_PUBLIC_GOOGLE_FORM_URL`
- `GOOGLE_APPS_SCRIPT_WEB_APP_URL`
- `GOOGLE_APPS_SCRIPT_SHARED_SECRET`
- `AUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`

## Google Apps Script Setup

The Apps Script source lives in `apps-script/` and is managed with clasp.

1. Create or clone an Apps Script project.
2. Copy `apps-script/.clasp.json.example` to `apps-script/.clasp.json` and set `scriptId`.
3. Push the Apps Script source:

```bash
pnpm gas:push
```

4. In Apps Script, set script property `APP_URL` to the deployed Next.js URL.
5. Run `setupCampusVoice()` once and authorize the script.
6. Copy the logged `FORM_URL` to `NEXT_PUBLIC_GOOGLE_FORM_URL`.
7. Copy the logged `SHARED_SECRET` to `GOOGLE_APPS_SCRIPT_SHARED_SECRET`.
8. Deploy the script as a web app and copy the `/exec` URL to `GOOGLE_APPS_SCRIPT_WEB_APP_URL`.

### Google Form Attachment Setup

`setupCampusVoice()` creates the base form, Sheet tabs, Drive folder, form submit trigger, and daily auto-close trigger.

Google Forms file-upload items must be added manually in the form editor. Add a required file-upload question for attachments. Respondents must sign in to Google to upload files.

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
