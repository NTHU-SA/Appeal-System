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

## Deploy Updates

Push the local Apps Script source, then update the existing production deployment:

```bash
pnpm gas:push
pnpm gas:deploy
```

`gas:deploy` uses the existing production deployment ID, so the public `/exec` URL stays the same.

## Public Form

The public form is served from `Index.html` by `doGet()`. Submissions call `submitPublicCase()` with `google.script.run`, write rows to Sheets, upload files to Drive, and send MailApp notifications.

## Student case links

Set `APP_URL` in Script Properties (or the `Settings` sheet) to the deployed
Next.js platform URL, without `/case/...`. New submissions validate this setting
before writing case data. `setupCampusVoice()` preserves existing properties.

Each new `Cases` row stores its own full `/case/<token>` URL in
`student_case_url`. Confirmation and subsequent reply emails reuse that URL.
The existing student page supports messages, attachment uploads, and published
staff replies. Treat the URL as private: anyone with it can access the case.

The new column is appended automatically without clearing existing rows. If
existing columns have been reordered or renamed, the script stops without
changing data so the column order can be corrected first.

### Existing cases without a stored link

After configuring `APP_URL` and deploying, run a temporary wrapper in the Apps
Script editor, replacing the case ID:

```javascript
function restoreOneCaseLink() {
  restoreStudentCaseLink("CV-20260910-C3FE3C2F");
}
```

Read the resulting URL from that case's `student_case_url` cell. This does not
send email. For a legacy case, the original token exists only as a hash, so
restoring the link replaces the old token and invalidates its previous URL.
Running this again preserves the stored link. Revoked links cannot be restored
with this function. Remove the temporary wrapper after use.
