export function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.replace(/^/, "https://") ||
    "http://localhost:3000"
  );
}

export function getCaseFormUrl() {
  return process.env.NEXT_PUBLIC_CASE_FORM_URL || "";
}
