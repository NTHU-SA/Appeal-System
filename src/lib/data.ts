import { cache } from "react";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { hashCaseToken } from "@/lib/token";
import type { CaseRecord } from "@/lib/types";

export const getCaseByToken = cache(async (token: string) => {
  const admin = getSupabaseAdmin();
  const tokenHash = hashCaseToken(token);

  const { data: tokenRow, error: tokenError } = await admin
    .from("case_tokens")
    .select("case_id, revoked_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (tokenError) throw tokenError;
  if (!tokenRow || tokenRow.revoked_at) return null;

  const { data: caseRow, error: caseError } = await admin
    .from("cases")
    .select("*")
    .eq("id", tokenRow.case_id)
    .single();
  if (caseError) throw caseError;

  const [{ data: messages }, { data: attachments }] = await Promise.all([
    admin
      .from("case_messages")
      .select("*")
      .eq("case_id", tokenRow.case_id)
      .order("created_at", { ascending: true }),
    admin
      .from("case_attachments")
      .select("*")
      .eq("case_id", tokenRow.case_id)
      .order("created_at", { ascending: true }),
  ]);

  return {
    case: caseRow as CaseRecord,
    messages: messages || [],
    attachments: await signAttachments(attachments || []),
  };
});

export async function getAdminCase(caseId: string) {
  const admin = getSupabaseAdmin();
  const { data: caseRow, error } = await admin
    .from("cases")
    .select("*")
    .eq("id", caseId)
    .single();

  if (error) throw error;

  const [{ data: messages }, { data: attachments }, { data: drafts }, { data: reviews }] =
    await Promise.all([
      admin
        .from("case_messages")
        .select("*, author:profiles(email, role)")
        .eq("case_id", caseId)
        .order("created_at", { ascending: true }),
      admin
        .from("case_attachments")
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: true }),
      admin
        .from("draft_replies")
        .select("*")
        .eq("case_id", caseId)
        .order("updated_at", { ascending: false }),
      admin
        .from("review_requests")
        .select("*, requested_by_profile:profiles!review_requests_requested_by_fkey(email), reviewed_by_profile:profiles!review_requests_reviewed_by_fkey(email)")
        .eq("case_id", caseId)
        .order("created_at", { ascending: false }),
    ]);

  return {
    case: caseRow as CaseRecord,
    messages: messages || [],
    attachments: await signAttachments(attachments || []),
    drafts: drafts || [],
    reviews: reviews || [],
  };
}

export async function getDashboardData(days = 30, query = "") {
  const admin = getSupabaseAdmin();
  const since = new Date();
  since.setDate(since.getDate() - days);

  let request = admin
    .from("cases")
    .select("*", { count: "exact" })
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false });

  if (query.trim()) {
    const q = `%${query.trim()}%`;
    request = request.or(
      `public_id.ilike.${q},student_email.ilike.${q},student_name.ilike.${q},student_department.ilike.${q},category.ilike.${q},subject.ilike.${q}`
    );
  }

  const { data, count, error } = await request.limit(100);
  if (error) throw error;

  const cases = (data || []) as CaseRecord[];
  const byStatus = cases.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  return {
    cases,
    total: count || 0,
    pending: cases.filter((item) => item.status === "pending").length,
    byStatus,
  };
}

export async function signAttachments<T extends { storage_path: string }>(
  attachments: T[]
) {
  const admin = getSupabaseAdmin();
  return Promise.all(
    attachments.map(async (attachment) => {
      const { data } = await admin.storage
        .from("case-attachments")
        .createSignedUrl(attachment.storage_path, 60 * 10);
      return { ...attachment, signedUrl: data?.signedUrl || null };
    })
  );
}
