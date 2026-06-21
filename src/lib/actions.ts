"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentStaff, requireMinister, requireStaff } from "@/lib/auth";
import { getAppUrl } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  caseSubmissionSchema,
  draftReplySchema,
  memberSchema,
  studentMessageSchema,
  submitReviewSchema,
  validateUpload,
} from "@/lib/validation";
import { notifyDiscord, sendCaseEmail } from "@/lib/notifications";
import { sanitizeReplyHtml } from "@/lib/sanitize";
import { createCaseToken, createPublicCaseId, hashCaseToken } from "@/lib/token";
import { nextStatusForReview } from "@/lib/workflow";

export type ActionState = {
  ok: boolean;
  message: string;
  token?: string;
  caseId?: string;
};

function formString(formData: FormData, key: string) {
  return String(formData.get(key) || "");
}

async function uploadFiles(caseId: string, files: File[]) {
  const admin = getSupabaseAdmin();
  const uploaded = [];

  for (const file of files) {
    if (!file.size) continue;

    const validationError = validateUpload(file);
    if (validationError) throw new Error(validationError);

    const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
    const path = `${caseId}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await admin.storage
      .from("case-attachments")
      .upload(path, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    uploaded.push({
      case_id: caseId,
      storage_path: path,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      uploaded_by_type: "student",
    });
  }

  if (uploaded.length) {
    const { error } = await admin.from("case_attachments").insert(uploaded);
    if (error) throw error;
  }
}

export async function submitCase(
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const parsed = caseSubmissionSchema.parse({
      email: formString(formData, "email"),
      department: formString(formData, "department"),
      name: formString(formData, "name"),
      category: formString(formData, "category"),
      subject: formString(formData, "subject"),
      desiredOutcome: formString(formData, "desiredOutcome"),
    });

    const admin = getSupabaseAdmin();
    const token = createCaseToken();
    const publicId = createPublicCaseId();

    const { data: caseRow, error: caseError } = await admin
      .from("cases")
      .insert({
        public_id: publicId,
        status: "pending",
        student_email: parsed.email,
        student_department: parsed.department,
        student_name: parsed.name,
        category: parsed.category,
        subject: parsed.subject,
        desired_outcome: parsed.desiredOutcome,
        last_student_message_at: new Date().toISOString(),
      })
      .select("id, public_id")
      .single();

    if (caseError) throw caseError;

    const [{ error: tokenError }, { error: messageError }] = await Promise.all([
      admin.from("case_tokens").insert({
        case_id: caseRow.id,
        token_hash: hashCaseToken(token),
      }),
      admin.from("case_messages").insert({
        case_id: caseRow.id,
        author_type: "student",
        body_text: parsed.subject,
      }),
    ]);

    if (tokenError) throw tokenError;
    if (messageError) throw messageError;

    const files = formData
      .getAll("attachments")
      .filter((value): value is File => value instanceof File);
    await uploadFiles(caseRow.id, files);

    await sendCaseEmail({
      to: parsed.email,
      subject: `已收到您的申訴案件 ${publicId}`,
      title: "我們已收到您的申訴",
      preview: `案件 ${publicId} 已建立`,
      body: `申訴種類：${parsed.category}\n申訴問題：${parsed.subject}\n希望得到的處理方式：${parsed.desiredOutcome}`,
      caseId: publicId,
      token,
      event: "case-created",
    });

    await notifyDiscord({
      kind: "reply",
      title: `新申訴案件 ${publicId}`,
      description: `${parsed.name}（${parsed.department}）送出 ${parsed.category}`,
      url: `${getAppUrl()}/cases/${caseRow.id}`,
    });

    revalidatePath("/dashboard");
    return {
      ok: true,
      message: "案件已送出，請查看電子郵件取得案件連結。",
      token,
      caseId: publicId,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "送件失敗，請稍後再試。",
    };
  }
}

export async function addStudentMessage(
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const parsed = studentMessageSchema.parse({
      token: formString(formData, "token"),
      body: formString(formData, "body"),
    });
    const admin = getSupabaseAdmin();
    const { data: tokenRow, error: tokenError } = await admin
      .from("case_tokens")
      .select("case_id, revoked_at")
      .eq("token_hash", hashCaseToken(parsed.token))
      .maybeSingle();

    if (tokenError) throw tokenError;
    if (!tokenRow || tokenRow.revoked_at) throw new Error("案件連結無效。");

    const now = new Date().toISOString();
    const [{ error: messageError }, { error: caseError }] = await Promise.all([
      admin.from("case_messages").insert({
        case_id: tokenRow.case_id,
        author_type: "student",
        body_text: parsed.body,
      }),
      admin
        .from("cases")
        .update({ last_student_message_at: now, updated_at: now })
        .eq("id", tokenRow.case_id),
    ]);

    if (messageError) throw messageError;
    if (caseError) throw caseError;

    const files = formData
      .getAll("attachments")
      .filter((value): value is File => value instanceof File);
    await uploadFiles(tokenRow.case_id, files);

    await notifyDiscord({
      kind: "reply",
      title: "學生新增案件回覆",
      description: parsed.body.slice(0, 180),
      url: `${getAppUrl()}/cases/${tokenRow.case_id}`,
    });

    revalidatePath(`/case/${parsed.token}`);
    return { ok: true, message: "補充內容已送出。" };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "補充失敗。",
    };
  }
}

export async function saveDraftReply(formData: FormData) {
  const staff = await requireStaff();
  const parsed = draftReplySchema.parse({
    caseId: formString(formData, "caseId"),
    html: sanitizeReplyHtml(formString(formData, "html")),
    json: formString(formData, "json"),
  });
  const admin = getSupabaseAdmin();

  await admin
    .from("cases")
    .update({ assigned_to: staff.id, updated_at: new Date().toISOString() })
    .eq("id", parsed.caseId)
    .is("assigned_to", null);

  const { error } = await admin.from("draft_replies").upsert(
    {
      case_id: parsed.caseId,
      author_id: staff.id,
      body_html: parsed.html,
      body_json: JSON.parse(parsed.json || "{}"),
    },
    { onConflict: "case_id,author_id" }
  );

  if (error) throw error;
  revalidatePath(`/cases/${parsed.caseId}`);
}

export async function submitReview(formData: FormData) {
  const staff = await requireStaff();
  const parsed = submitReviewSchema.parse({
    caseId: formString(formData, "caseId"),
    html: sanitizeReplyHtml(formString(formData, "html")),
    json: formString(formData, "json"),
    decision: formString(formData, "decision"),
  });
  const admin = getSupabaseAdmin();

  const { error } = await admin.from("review_requests").insert({
    case_id: parsed.caseId,
    requested_by: staff.id,
    decision: parsed.decision,
    body_html: parsed.html,
    body_json: JSON.parse(parsed.json || "{}"),
    status: "pending",
  });

  if (error) throw error;

  await notifyDiscord({
    kind: "review",
    title: "部員送出審核",
    description: `${staff.email} 送出 ${parsed.decision === "accepted" ? "受理" : "不受理"} 回覆審核`,
    url: `${getAppUrl()}/cases/${parsed.caseId}`,
  });

  revalidatePath(`/cases/${parsed.caseId}`);
}

export async function approveReview(formData: FormData) {
  const staff = await requireMinister();
  const reviewId = formString(formData, "reviewId");
  const html = sanitizeReplyHtml(formString(formData, "html"));
  const admin = getSupabaseAdmin();

  const { data: review, error: reviewError } = await admin
    .from("review_requests")
    .select("*, cases(public_id, student_email)")
    .eq("id", reviewId)
    .single();
  if (reviewError) throw reviewError;

  const status = nextStatusForReview(review.decision);
  const now = new Date().toISOString();

  const [{ error: updateReviewError }, { error: caseError }, { error: messageError }] =
    await Promise.all([
      admin
        .from("review_requests")
        .update({
          status: "approved",
          reviewed_by: staff.id,
          reviewed_at: now,
          body_html: html,
        })
        .eq("id", reviewId),
      admin
        .from("cases")
        .update({
          status,
          updated_at: now,
          last_staff_message_at: now,
          closed_at: status === "rejected" ? now : null,
        })
        .eq("id", review.case_id),
      admin.from("case_messages").insert({
        case_id: review.case_id,
        author_id: staff.id,
        author_type: "minister",
        body_html: html,
        body_text: html.replace(/<[^>]+>/g, " "),
      }),
    ]);

  if (updateReviewError) throw updateReviewError;
  if (caseError) throw caseError;
  if (messageError) throw messageError;

  await sendCaseEmail({
    to: review.cases.student_email,
    subject: `案件 ${review.cases.public_id} 有新的回覆`,
    title: status === "rejected" ? "您的申訴未受理" : "您的申訴已受理",
    preview: `案件 ${review.cases.public_id} 狀態已更新`,
    body: html.replace(/<[^>]+>/g, " "),
    caseId: review.cases.public_id,
    event: `review-approved-${reviewId}`,
  });

  revalidatePath(`/cases/${review.case_id}`);
  revalidatePath("/dashboard");
}

export async function upsertMember(formData: FormData) {
  await requireMinister();
  const parsed = memberSchema.parse({
    email: formString(formData, "email"),
    role: formString(formData, "role") || "member",
  });
  const admin = getSupabaseAdmin();
  const { error } = await admin.from("profiles").upsert(
    {
      email: parsed.email.toLowerCase(),
      role: parsed.role,
    },
    { onConflict: "email" }
  );
  if (error) throw error;
  revalidatePath("/admin/members");
}

export async function removeMember(formData: FormData) {
  await requireMinister();
  const id = formString(formData, "id");
  const admin = getSupabaseAdmin();
  const { error } = await admin
    .from("profiles")
    .update({ role: "user" })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/members");
}

export async function signInWithGoogle() {
  const supabase = await import("@/lib/supabase/server").then((m) =>
    m.createClient()
  );
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${getAppUrl()}/api/auth/callback`,
    },
  });
  if (error) throw error;
  if (data.url) redirect(data.url);
}

export async function signOut() {
  const supabase = await import("@/lib/supabase/server").then((m) =>
    m.createClient()
  );
  await supabase.auth.signOut();
  redirect("/");
}

export async function getStaffOrSetup() {
  try {
    return await getCurrentStaff();
  } catch {
    return null;
  }
}
