export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export function getCaseFormUrl() {
  return (
    process.env.NEXT_PUBLIC_CASE_FORM_URL ||
    process.env.GOOGLE_APPS_SCRIPT_WEB_APP_URL ||
    ""
  );
}

