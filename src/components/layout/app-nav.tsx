"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeMenu } from "@/components/theme/theme-menu";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";

export type AppNavItem = {
  href: string;
  label: string;
  // Path prefix that marks the item as the current page; omit for anchors.
  match?: string;
};

function isCurrent(pathname: string, match?: string) {
  if (!match) return false;
  return match === "/" ? pathname === "/" : pathname.startsWith(match);
}

// Right side of the navigation bar: nav items, theme button, then the
// primary action. At ≤ 992px the items move into a full-screen menu.
export function AppNav({
  items,
  cta,
  account,
  menuFooter,
}: {
  items: AppNavItem[];
  // Primary action, hidden on phones and repeated in the menu instead.
  cta?: React.ReactNode;
  // Always visible (e.g. the account menu).
  account?: React.ReactNode;
  // Extra content at the bottom of the full-screen menu.
  menuFooter?: React.ReactNode;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // While the full-screen menu is open: lock page scroll, close on Escape and
  // when the viewport grows past the tablet breakpoint.
  useEffect(() => {
    if (!menuOpen) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    const desktop = window.matchMedia("(min-width: 993px)");
    const close = () => setMenuOpen(false);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", close);
    return () => {
      root.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", close);
    };
  }, [menuOpen]);

  return (
    <>
      <nav aria-label="主要導覽" className="hidden items-center gap-1 lg:flex">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isCurrent(pathname, item.match) ? "page" : undefined}
            className={cn(
              "relative isolate inline-flex h-(--control-height) items-center rounded-sm px-3 text-control text-text-tertiary transition-colors hover:text-text-primary aria-[current=page]:text-text-primary",
              // Hover tint fades in on a pseudo-element, so layout never moves.
              "before:absolute before:inset-0 before:-z-1 before:rounded-sm before:bg-surface-hover before:opacity-0 before:transition-opacity hover:before:opacity-100",
              // Selection line: 2px, overlapping the bar's bottom border
              // (12px bar padding + 1px border below the item).
              "after:absolute after:inset-x-0 after:-bottom-[13px] after:h-0.5 after:rounded-full after:bg-primary-text after:opacity-0 aria-[current=page]:after:opacity-100",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex shrink-0 items-center gap-1">
        <Separator orientation="vertical" className="mx-2 hidden h-4 lg:block" />
        {/* Phones get the theme switcher inside the menu instead. */}
        <div className="hidden sm:block">
          <ThemeMenu />
        </div>
        {cta ? <div className="ml-1 hidden sm:block">{cta}</div> : null}
        {account ? <div className="ml-1">{account}</div> : null}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-expanded={menuOpen}
          aria-controls="app-menu"
          aria-label={menuOpen ? "關閉選單" : "開啟選單"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {menuOpen ? (
        <div
          id="app-menu"
          className="fixed inset-x-0 top-(--header-height) bottom-0 z-800 overflow-y-auto bg-surface px-6 py-6 duration-150 animate-in fade-in-0 lg:hidden"
        >
          <nav aria-label="主要導覽">
            <ul className="flex flex-col gap-2">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isCurrent(pathname, item.match) ? "page" : undefined}
                    onClick={() => setMenuOpen(false)}
                    className="title-features block rounded-sm py-2 text-headline-md font-medium text-text-tertiary transition-colors hover:text-text-primary aria-[current=page]:text-text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-8 flex flex-col items-start gap-4 border-t pt-6">
            {cta ? (
              <div className="sm:hidden" onClick={() => setMenuOpen(false)}>
                {cta}
              </div>
            ) : null}
            {menuFooter}
            <div className="flex w-full items-center justify-between gap-4 sm:hidden">
              <span className="text-label-md text-text-primary">主題</span>
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
