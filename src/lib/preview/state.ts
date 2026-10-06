import { cookies } from "next/headers";

import {
  PREVIEW_COOKIE,
  parsePreviewState,
  previewAvailable,
  type PreviewState,
} from "@/lib/preview/config";

// Null outside development, without the cookie, or outside a request.
export async function getPreviewState(): Promise<PreviewState | null> {
  if (!previewAvailable()) return null;
  try {
    const store = await cookies();
    return parsePreviewState(store.get(PREVIEW_COOKIE)?.value);
  } catch {
    return null;
  }
}

export const previewEmails = {
  minister: "minister@example.edu.tw",
  member: "member@example.edu.tw",
  outsider: "visitor@example.com",
} as const;
