import { cache } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { callGas } from "@/lib/gas";
import { getPreviewState, previewEmails } from "@/lib/preview/state";
import type { UserRole } from "@/lib/types";
import { staffRoleFromMemberRole } from "@/lib/workflow";

export type StaffSession = {
  id: string;
  email: string;
  role: UserRole;
};

// Deduplicated per request: the staff layout and its page both ask.
export const getCurrentStaff = cache(async (): Promise<StaffSession | null> => {
  const preview = await getPreviewState();
  if (preview) {
    if (preview.persona !== "minister" && preview.persona !== "member") return null;
    const email = previewEmails[preview.persona];
    return { id: email, email, role: preview.persona };
  }

  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email) return null;

  const cachedRole = staffRoleFromMemberRole(session?.user?.role);
  if (cachedRole) {
    return { id: email, email, role: cachedRole };
  }

  try {
    const data = await callGas<{ role: UserRole | null }>("getMemberRole", {
      email,
    });
    const role = staffRoleFromMemberRole(data.role);
    if (role) {
      return { id: email, email, role };
    }
  } catch (error) {
    console.error("getCurrentStaff error:", error);
  }

  return null;
});

// The signed-in Google account, staff or not.
export async function getSignedInEmail(): Promise<string | null> {
  const preview = await getPreviewState();
  if (preview) return preview.persona === "guest" ? null : previewEmails[preview.persona];
  const session = await auth();
  return session?.user?.email ?? null;
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
