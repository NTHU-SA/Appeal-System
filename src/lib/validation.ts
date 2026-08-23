import { z } from "zod";

export const caseSubmissionSchema = z.object({
  email: z.string().trim().email("請輸入有效的電子郵件"),
  department: z.string().trim().min(1, "請選擇年級").max(120),
  name: z.string().trim().min(1, "請填寫姓名").max(80),
  category: z.string().trim().min(1, "請選擇申訴種類").max(120),
  subject: z.string().trim().min(8, "請至少描述 8 個字").max(8000),
  desiredOutcome: z.string().trim().min(1, "請填寫希望得到的處理方式").max(4000),
});

export const studentMessageSchema = z.object({
  token: z.string().min(32),
  body: z.string().trim().min(1, "請輸入補充內容").max(8000),
});

export const draftReplySchema = z.object({
  caseId: z.string().uuid(),
  html: z.string().max(20000),
  json: z.string().max(50000),
});

export const submitReviewSchema = draftReplySchema.extend({
  decision: z.enum(["accepted", "rejected"]),
});

export const memberSchema = z.object({
  email: z.string().trim().email("請輸入有效 email"),
  role: z.enum(["member", "minister"]).default("member"),
});

export const allowedUploadTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
]);

export const maxUploadBytes = 12 * 1024 * 1024;

export function validateUpload(file: File) {
  if (file.size > maxUploadBytes) {
    return `${file.name} 超過 12MB 限制`;
  }

  if (!allowedUploadTypes.has(file.type)) {
    return `${file.name} 檔案格式不支援`;
  }

  return null;
}
