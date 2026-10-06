import { signOut } from "@/lib/actions";
import type { StaffSession } from "@/lib/auth";
import { AccountMenu } from "@/components/layout/account-menu";
import type { AppNavItem } from "@/components/layout/app-nav";
import { SiteHeader } from "@/components/layout/site-header";

// Staff tool pages behave like a desktop app: the page itself never
// scrolls; each column inside <main> scrolls on its own.
export function AppShell({
  staff,
  children,
}: {
  staff: StaffSession;
  children: React.ReactNode;
}) {
  const items: AppNavItem[] = [
    { href: "/dashboard", label: "儀表板", match: "/dashboard" },
    { href: "/cases", label: "案件", match: "/cases" },
    ...(staff.role === "minister"
      ? [{ href: "/admin/members", label: "成員", match: "/admin/members" }]
      : []),
  ];

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <SiteHeader
        home="/dashboard"
        items={items}
        account={<AccountMenu staff={staff} signOutAction={signOut} />}
      />
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
