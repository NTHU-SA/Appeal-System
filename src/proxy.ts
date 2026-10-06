import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

import { auth } from "@/auth";
import { PREVIEW_COOKIE, previewAvailable } from "@/lib/preview/config";

const authProxy = auth as unknown as (
  request: NextRequest,
  event: NextFetchEvent,
) => Promise<Response | undefined>;

export function proxy(request: NextRequest, event: NextFetchEvent) {
  // UI preview (development only) never touches Auth.js.
  if (previewAvailable() && request.cookies.has(PREVIEW_COOKIE)) {
    return NextResponse.next();
  }
  return authProxy(request, event);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
