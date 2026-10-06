import { AppNav, type AppNavItem } from "@/components/layout/app-nav";
import { Wordmark } from "@/components/layout/wordmark";

// Navigation bar: wordmark on the left; nav items, theme and the primary
// action on the right. 12px padding and a 1px bottom border; sticky, and
// its height is --header-height.
export function SiteHeader({
  home = "/",
  items,
  cta,
  account,
  menuFooter,
}: {
  home?: string;
  items: AppNavItem[];
  cta?: React.ReactNode;
  account?: React.ReactNode;
  menuFooter?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-900 shrink-0 border-b bg-surface">
      <div className="flex items-center justify-between gap-4 px-6 py-3 lg:px-10">
        <Wordmark href={home} />
        <div className="flex min-w-0 items-center">
          <AppNav items={items} cta={cta} account={account} menuFooter={menuFooter} />
        </div>
      </div>
    </header>
  );
}
