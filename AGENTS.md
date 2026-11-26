<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Instructions

- 除非使用者明確要求，或是真的有需要，coding 修改完成後平常不用開 browser 做 e2e 測試。
- 除非使用者明確指示，使用 pnpm，不使用 npm。
- 公開送件由 Next.js 首頁提供表單，Cloudflare Worker 透過 `/api/appeals` 將資料交給 Apps Script。Apps Script 變更使用 `apps-script/` 原始碼與 clasp 管理。
