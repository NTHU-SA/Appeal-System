import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { callGas } from "@/lib/gas";
import type { UserRole } from "@/lib/types";
import { staffRoleFromMemberRole } from "@/lib/workflow";

export type StaffSession = {
  id: string;
  email: string;
  role: UserRole;
};

export async function getCurrentStaff(): Promise<StaffSession | null> {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email) return null;

  const data = await callGas<{ role: UserRole | null }>("getMemberRole", {
    email,
  });
  const role = staffRoleFromMemberRole(data.role);
  if (role) {
    return { id: email, email, role };
  }

  return null;
}

export async function requireStaff() {
  const staff = await getCurrentStaff();
  if (!staff) redirect("/login");
  return staff;
}

export async function requireMinister() {
  const staff = await requireStaff();
  if (staff.role !== "minister") redirect("/dashboard");
  return staff;
}

export function ministerSetupHint() {
  return "請在 Google Sheet 的 Members 工作表加入 minister 角色。";
}
