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
5. Copy the logged `FORM_URL` into `NEXT_PUBLIC_GOOGLE_FORM_URL`.
6. Copy the logged `SHARED_SECRET` into `GOOGLE_APPS_SCRIPT_SHARED_SECRET`.
7. Deploy as a web app and copy the `/exec` URL into `GOOGLE_APPS_SCRIPT_WEB_APP_URL`.

## Manual Google Form Step

Apps Script cannot reliably create the Google Forms file-upload question. Open the generated form and manually add a required file-upload item for attachments. Google will require respondents to sign in before uploading files.
