import { requireStaff } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";

// Staff tool pages: navigation bar plus a fixed-height work area.
export default async function StaffLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const staff = await requireStaff();
  return <AppShell staff={staff}>{children}</AppShell>;
}
