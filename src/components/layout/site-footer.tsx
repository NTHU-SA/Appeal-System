import { Heart } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-card px-4 py-5 text-sm text-muted-foreground sm:text-base">
      <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
        <p>© 2026 35th 國立清華大學學生會 版權所有</p>
        <p className="flex items-center gap-2">
          <span>Made with</span>
          <Heart aria-hidden="true" className="size-5 fill-red-500 text-red-500" />
          <span>by</span>
          <a
            href="https://github.com/nthu-sa"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:underline focus-visible:outline-none"
          >
            NTHUSA IT Team
          </a>
        </p>
      </div>
    </footer>
  );
}
