import Link from "next/link";
import { Heart } from "lucide-react";

import { Wordmark } from "@/components/layout/wordmark";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";

const columns: { title: string; links: { href: string; label: string; external?: boolean }[] }[] = [
  {
    title: "申訴服務",
    links: [
      { href: "/#case-form", label: "送出申訴" },
      { href: "/#process", label: "處理流程" },
      { href: "/#faq", label: "常見問題" },
    ],
  },
  {
    title: "學權幹部",
    links: [{ href: "/login", label: "幹部登入" }],
  },
  {
    title: "關於",
    links: [{ href: "https://github.com/nthu-sa", label: "NTHUSA IT Team", external: true }],
  },
];

const linkClass =
  "rounded-sm text-body-md text-text-tertiary transition-colors hover:text-text-primary";

// Marketing and content pages only. Brand on the left, link columns on the
// right, copyright row at the bottom.
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t">
      <div className="flex flex-col gap-12 px-6 py-16 md:flex-row md:justify-between md:gap-16 lg:px-10">
        <div className="flex max-w-sm flex-col gap-4">
          <Wordmark />
          <p className="text-body-md text-text-tertiary">
            國立清華大學學生會的學生申訴送件與追蹤平台。案件由學權幹部處理，回覆會寄到你的 email。
          </p>
        </div>

        <div className="grid grid-cols-2 gap-12 sm:grid-cols-3 md:gap-16">
          {columns.map((column) => (
            <div key={column.title} className="flex flex-col gap-3">
              <h2 className="text-label-md text-text-primary">{column.title}</h2>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a href={link.href} target="_blank" rel="noreferrer" className={linkClass}>
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className={linkClass}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-start justify-between gap-4 border-t px-6 py-6 text-body-sm text-text-tertiary sm:flex-row sm:items-center lg:px-10">
        <p>© 2026 35th 國立清華大學學生會 版權所有</p>
        <div className="flex items-center gap-4">
          <p className="flex items-center gap-1">
            <span>Made with</span>
            <Heart aria-hidden="true" className="size-3.5 fill-current" />
            <span>by</span>
            <a
              href="https://github.com/nthu-sa"
              target="_blank"
              rel="noreferrer"
              className="rounded-sm font-medium transition-colors hover:text-text-primary"
            >
              NTHUSA IT Team
            </a>
          </p>
          <ThemeSwitcher />
        </div>
      </div>
    </footer>
  );
}
