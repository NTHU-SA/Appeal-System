import Link from "next/link";
import { LogOut } from "lucide-react";

import { signOut } from "@/lib/actions";
import type { StaffSession } from "@/lib/auth";
import { AppNav, type AppNavItem } from "@/components/layout/app-nav";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function AppShell({
  staff,
  children,
}: {
  staff: StaffSession;
  children: React.ReactNode;
}) {
  const items: AppNavItem[] = [
    { href: "/dashboard", label: "儀表板", match: "/dashboard" },
    { href: "/dashboard#cases", label: "案件", match: "/cases" },
    ...(staff.role === "minister"
      ? [{ href: "/admin/members", label: "成員", match: "/admin/members" }]
      : []),
  ];

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-900 border-b bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 lg:px-10">
          <Link
            href="/dashboard"
            className="title-features min-w-0 truncate rounded-sm text-wordmark text-text-primary"
          >
            學生申訴協力系統
          </Link>
          <div className="flex items-center">
            <AppNav
              items={items}
              signOut={
                <form action={signOut}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="登出">
                        <LogOut />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>登出</TooltipContent>
                  </Tooltip>
                </form>
              }
              signOutLarge={
                <form action={signOut}>
                  <Button variant="secondary">
                    <LogOut />
                    登出
                  </Button>
                </form>
              }
            />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-6 lg:px-10">{children}</main>
    </div>
  );
}
