"use server";

import { revalidatePath } from "next/cache";

import { signIn, signOut as authSignOut } from "@/auth";
import { getCurrentStaff, requireMinister, requireStaff } from "@/lib/auth";
import { callGas } from "@/lib/gas";
import {
  draftReplySchema,
  memberSchema,
  studentMessageSchema,
  submitReviewSchema,
} from "@/lib/validation";
import { sanitizeReplyHtml } from "@/lib/sanitize";

export type ActionState = {
  ok: boolean;
  message: string;
  token?: string;
  caseId?: string;
};

function formString(formData: FormData, key: string) {
  return String(formData.get(key) || "");
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
    await callGas("addStudentMessage", parsed);

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
  await callGas("saveDraftReply", { ...parsed, staff });
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
  await callGas("submitReview", { ...parsed, staff });

  revalidatePath(`/cases/${parsed.caseId}`);
}

export async function approveReview(formData: FormData) {
  const staff = await requireMinister();
  const reviewId = formString(formData, "reviewId");
  const html = sanitizeReplyHtml(formString(formData, "html"));
  const result = await callGas<{ caseId: string }>("approveReview", {
    reviewId,
    html,
    staff,
  });

  revalidatePath(`/cases/${result.caseId}`);
  revalidatePath("/dashboard");
}

export async function upsertMember(formData: FormData) {
  await requireMinister();
  const parsed = memberSchema.parse({
    email: formString(formData, "email"),
    role: formString(formData, "role") || "member",
  });
  await callGas("upsertMember", parsed);
  revalidatePath("/admin/members");
}

export async function removeMember(formData: FormData) {
  await requireMinister();
  const id = formString(formData, "id");
  await callGas("removeMember", { id });
  revalidatePath("/admin/members");
}

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function signOut() {
  await authSignOut({ redirectTo: "/" });
}

export async function getStaffOrSetup() {
  try {
    return await getCurrentStaff();
  } catch {
    return null;
  }
}
