import { z } from "zod";

export const caseSubmissionSchema = z.object({
  email: z.string().trim().email("請輸入有效的電子郵件"),
  department: z.string().trim().min(1, "請選擇年級").max(120),
  name: z.string().trim().min(1, "請填寫姓名").max(80),
  category: z.string().trim().min(1, "請選擇申訴種類").max(120),
  subject: z.string().trim().min(8, "請至少描述 8 個字").max(8000),
  desiredOutcome: z.string().trim().min(1, "請填寫希望得到的處理方式").max(4000),
});

export const studentFilePayloadSchema = z.object({
  name: z.string().min(1),
  mimeType: z.string(),
  data: z.string().min(1),
});

export const studentMessageSchema = z
  .object({
    token: z.string().min(32),
    requestId: z.string().uuid().optional(),
    body: z.string().trim().max(8000).optional().default(""),
    files: z.array(studentFilePayloadSchema).max(3, "每次最多上傳 3 個檔案。").optional().default([]),
  })
  .refine(
    (data) => data.body.trim().length > 0 || (data.files && data.files.length > 0),
    {
      message: "請填寫補充說明或選取欲上傳的佐證檔案。",
    }
  );

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

export const maxUploadBytes = 8 * 1024 * 1024; // 8MB

export function validateUpload(file: File) {
  if (file.size > maxUploadBytes) {
    return `${file.name} 超過 8MB 限制`;
  }

  if (file.type && !allowedUploadTypes.has(file.type)) {
    return `${file.name} 檔案格式不支援（僅支援 PDF、Word、PNG、JPG）`;
  }

  return null;
}
