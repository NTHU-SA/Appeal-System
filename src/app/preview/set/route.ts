import { NextResponse, type NextRequest } from "next/server";

import {
  PREVIEW_COOKIE,
  parsePreviewState,
  previewAvailable,
  serializePreviewState,
} from "@/lib/preview/config";

// /preview/set?persona=member&data=empty&next=/dashboard
// Updates the preview cookie and opens `next`. ?off=1 leaves preview mode.
export async function GET(request: NextRequest) {
  if (!previewAvailable()) return new NextResponse(null, { status: 404 });

  const params = request.nextUrl.searchParams;
  const next = params.get("next") || "/preview";
  const destination = new URL(next.startsWith("/") ? next : "/preview", request.url);
  const response = NextResponse.redirect(destination);

  if (params.get("off")) {
    response.cookies.delete(PREVIEW_COOKIE);
    return response;
  }

  const current = parsePreviewState(request.cookies.get(PREVIEW_COOKIE)?.value) ?? {
    persona: "minister",
    data: "full",
  };
  const state = parsePreviewState(
    `${params.get("persona") || current.persona}.${params.get("data") || current.data}`,
  ) ?? current;
  response.cookies.set(PREVIEW_COOKIE, serializePreviewState(state), { path: "/", sameSite: "lax" });
  return response;
}
