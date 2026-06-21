import { redirect } from "next/navigation";

import { getMinisterEmails, isConfiguredMinister } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/types";

export type StaffSession = {
  id: string;
  email: string;
  role: UserRole;
};

export async function getCurrentStaff(): Promise<StaffSession | null> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;

  const subject = claims?.sub;
  const email = String(claims?.email || "").toLowerCase();
  if (!subject || !email) return null;

  const admin = getSupabaseAdmin();

  if (isConfiguredMinister(email)) {
    const { data } = await admin
      .from("profiles")
      .upsert({ email, role: "minister" }, { onConflict: "email" })
      .select("id, role")
      .single();
    return { id: data?.id || subject, email, role: "minister" };
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("id, role")
    .eq("email", email)
    .maybeSingle();

  if (profile?.role === "minister" || profile?.role === "member") {
    return { id: profile.id, email, role: profile.role };
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
  const emails = [...getMinisterEmails()];
  return emails.length
    ? `已設定部長白名單：${emails.join(", ")}`
    : "請在 Vercel 或 .env.local 設定 MINISTER_EMAILS。";
}
