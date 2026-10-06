import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

import { previewAvailable } from "@/lib/preview/config";

// Stands in for google.script.run: submissions succeed after 1.5s.
const mockScript = `
<script>
  window.google = {
    script: {
      get run() {
        const handlers = {};
        const runner = {
          withSuccessHandler(fn) { handlers.success = fn; return runner; },
          withFailureHandler(fn) { handlers.failure = fn; return runner; },
          submitPublicCase() {
            setTimeout(() => handlers.success && handlers.success({ publicId: "CV-2026-0143" }), 1500);
          },
        };
        return runner;
      },
    },
  };
  (function () {
    const state = new URLSearchParams(location.search).get("state");
    if (state === "loading") showLoading(true);
    if (state === "success") openSuccessModal("CV-2026-0143", "s112062143@example.edu.tw");
    if (state === "error") {
      document.querySelector("#email").value = "student@gapp";
      document.querySelector("#subject").value = "成績很晚";
      validateForm();
      setFieldError("attachments", "「期末報告掃描檔.pdf」超過 8MB，請壓縮或分割後再上傳。");
      setNotice("案件服務暫時無法回應，請稍後再送出一次。");
    }
  })();
</script>`;

// Serves apps-script/Index.html for the UI preview (development only).
// The home page embeds this URL in preview mode.
export async function GET() {
  if (!previewAvailable()) return new NextResponse(null, { status: 404 });
  const html = await readFile(path.join(process.cwd(), "apps-script", "Index.html"), "utf8");
  return new NextResponse(html.replace("</body>", `${mockScript}</body>`), {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
