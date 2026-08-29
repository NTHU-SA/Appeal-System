import Link from "next/link";
import { FileText, LayoutDashboard, LogOut, Users } from "lucide-react";

import { signOut } from "@/lib/actions";
import type { StaffSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function AppShell({
  staff,
  children,
}: {
  staff: StaffSession;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/dashboard" className="min-w-0">
            <p className="truncate text-sm text-muted-foreground">清華大學</p>
            <h1 className="truncate text-base font-semibold">
              學生申訴協力系統
            </h1>
          </Link>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">儀表板</span>
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">案件</span>
              </Link>
            </Button>
            {staff.role === "minister" ? (
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/members">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">成員</span>
                </Link>
              </Button>
            ) : null}
            <Separator orientation="vertical" className="hidden h-6 sm:block" />
            <form action={signOut}>
              <Button variant="ghost" size="icon" aria-label="登出">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
