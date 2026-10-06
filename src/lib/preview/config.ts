// UI preview mode: development only. A cookie picks a persona and a data
// set; the auth and data layers then answer from fixtures instead of
// Auth.js and Apps Script, so every page can be opened without accounts.
// This module stays free of next/headers so the proxy can import it.

export const PREVIEW_COOKIE = "ui-preview";

export const previewPersonas = ["minister", "member", "outsider", "guest"] as const;
export type PreviewPersona = (typeof previewPersonas)[number];

export const previewDataSets = ["full", "empty"] as const;
export type PreviewDataSet = (typeof previewDataSets)[number];

export type PreviewState = { persona: PreviewPersona; data: PreviewDataSet };

export const previewPersonaLabels: Record<PreviewPersona, string> = {
  minister: "部長",
  member: "部員",
  outsider: "未授權帳號",
  guest: "未登入",
};

export const previewDataLabels: Record<PreviewDataSet, string> = {
  full: "範例資料",
  empty: "空資料",
};

export function previewAvailable() {
  return process.env.NODE_ENV === "development";
}

export function parsePreviewState(value: string | undefined): PreviewState | null {
  if (!value) return null;
  const [persona, data] = value.split(".");
  if (!previewPersonas.includes(persona as PreviewPersona)) return null;
  return {
    persona: persona as PreviewPersona,
    data: previewDataSets.includes(data as PreviewDataSet) ? (data as PreviewDataSet) : "full",
  };
}

export function serializePreviewState(state: PreviewState) {
  return `${state.persona}.${state.data}`;
}

// Link that switches the preview state and then opens `next`.
export function previewHref(next: string, state?: Partial<PreviewState>) {
  const params = new URLSearchParams({ next });
  if (state?.persona) params.set("persona", state.persona);
  if (state?.data) params.set("data", state.data);
  return `/preview/set?${params}`;
}

// Fixture ids and student tokens have to pass the real validation schemas
// (UUID case ids, tokens of 32+ characters).
export function previewCaseId(index: number) {
  return `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`;
}

export function previewToken(name: string) {
  return `${name}-preview-token-0000000000000000`;
}

export function previewTokenName(token: string) {
  return token.split("-preview-token-")[0];
}
