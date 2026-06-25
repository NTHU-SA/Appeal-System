export function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.replace(/^/, "https://") ||
    "http://localhost:3000"
  );
}

export function getGoogleFormUrl() {
  return process.env.NEXT_PUBLIC_GOOGLE_FORM_URL || "";
}
