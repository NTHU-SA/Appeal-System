import { Heart } from "lucide-react";

import { ThemeSwitcher } from "@/components/theme/theme-switcher";

// Footer bottom row: copyright on the left, attribution and theme on the right.
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 text-center text-body-md text-text-tertiary sm:flex-row sm:text-left lg:px-10">
        <p>© 2026 35th 國立清華大學學生會 版權所有</p>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <p className="flex items-center gap-1">
            <span>Made with</span>
            <Heart aria-hidden="true" className="size-3.5 fill-current" />
            <span>by</span>
            <a
              href="https://github.com/nthu-sa"
              target="_blank"
              rel="noreferrer"
              className="rounded-sm font-medium underline-offset-4 transition-colors hover:text-text-primary hover:underline"
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
