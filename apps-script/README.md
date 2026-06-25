# CampusVoice Apps Script

This folder is the source for the Google Apps Script backend.

## First Setup

1. Copy `.clasp.json.example` to `.clasp.json` and replace `YOUR_SCRIPT_ID`.
2. Push the source:

```bash
pnpm gas:push
```

3. In Apps Script, set script property `APP_URL` to the deployed Next.js URL.
4. Run `setupCampusVoice()` once and authorize the script.
5. Deploy as a web app and copy the `/exec` URL into `NEXT_PUBLIC_CASE_FORM_URL`.
6. Copy the logged `SHARED_SECRET` into `GOOGLE_APPS_SCRIPT_SHARED_SECRET`.
7. Copy the same `/exec` URL into `GOOGLE_APPS_SCRIPT_WEB_APP_URL`.

## Public Form

The public form is served from `Index.html` by `doGet()`. Submissions call `submitPublicCase()` with `google.script.run`, write rows to Sheets, upload files to Drive, and send MailApp notifications.
