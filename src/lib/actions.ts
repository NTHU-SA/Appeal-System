"use server";

import { revalidatePath } from "next/cache";

import { signIn, signOut as authSignOut } from "@/auth";
import { getCurrentStaff, requireMinister, requireStaff } from "@/lib/auth";
import { invalidateCaseByToken } from "@/lib/case-cache";
import { callGas } from "@/lib/gas";

import {
  draftReplySchema,
  memberSchema,
  studentMessageSchema,
  submitReviewSchema,
  validateUpload,
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
    const token = formString(formData, "token");
    const body = formString(formData, "body");
    const rawFiles = formData.getAll("files");

    const files: Array<{ name: string; mimeType: string; data: string }> = [];

    for (const item of rawFiles) {
      if (
        typeof item === "object" &&
        item !== null &&
        "size" in item &&
        "arrayBuffer" in item
      ) {
        const file = item as File;
        if (file.size > 0 && file.name) {
          const err = validateUpload(file);
          if (err) {
            return { ok: false, message: err };
          }
          const buffer = Buffer.from(await file.arrayBuffer());
          files.push({
            name: file.name,
            mimeType: file.type || "application/octet-stream",
            data: buffer.toString("base64"),
          });
        }
      }
    }

    const parsed = studentMessageSchema.parse({
      token,
      requestId: formString(formData, "requestId") || undefined,
      body,
      files,
    });

    await callGas("addStudentMessage", parsed);
    await invalidateCaseByToken(token);

    return { ok: true, message: "補充內容與檔案已成功送出。" };

  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "補充失敗，請稍後再試。",
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

export async function signOut(formData?: FormData) {
  const redirectTo =
    formData && typeof formData.get === "function" && formData.get("redirectTo")
      ? String(formData.get("redirectTo"))
      : "/";
  await authSignOut({ redirectTo });
}

export async function getStaffOrSetup() {
  try {
    return await getCurrentStaff();
  } catch {
    return null;
  }
}
