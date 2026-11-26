import { z } from "zod";

import { caseSubmissionSchema, maxUploadBytes } from "@/lib/validation";

export const appealDepartments = ["大一", "大二", "大三", "大四", "碩士", "博士", "其他"] as const;
export const appealCategories = ["課務與教學", "宿舍與生活", "行政程序", "校園安全", "其他"] as const;
export const maxAppealFiles = 10;

const attachmentMimeTypes = new Map([
  ["pdf", "application/pdf"],
  ["doc", "application/msword"],
  ["docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  ["png", "image/png"],
  ["jpg", "image/jpeg"],
  ["jpeg", "image/jpeg"],
]);

export const appealFileAccept = [...attachmentMimeTypes.keys()].map((extension) => `.${extension}`).join(",");

export function validateAppealFile(file: File) {
  if (!file.size) return { error: `「${file.name}」沒有內容。` };
  if (file.size > maxUploadBytes) return { error: `「${file.name}」超過 8 MB 限制。` };

  const mimeType = attachmentMimeTypes.get(file.name.split(".").pop()?.toLowerCase() ?? "");
  // File pickers can omit MIME metadata for a supported extension.
  if (!mimeType || (file.type && file.type !== "application/octet-stream" && file.type !== mimeType)) {
    return { error: `「${file.name}」的格式不支援，請使用 PDF、Word、PNG 或 JPG。` };
  }
  return { mimeType };
}

const appealFields = caseSubmissionSchema.extend({
  department: z.enum(appealDepartments, { error: "請選擇年級。" }),
  departmentOther: z.string().trim().max(60, "年級／身分說明最多 60 字。").optional(),
  category: z.enum(appealCategories, { error: "請選擇申訴種類。" }),
});

const requireOtherDepartment = (data: z.infer<typeof appealFields>) =>
  data.department !== "其他" || Boolean(data.departmentOther);
const otherDepartmentError = { path: ["departmentOther"], message: "請填寫年級／身分說明。" };

export const publicAppealFormSchema = appealFields.refine(requireOtherDepartment, otherDepartmentError);

export const appealRequestId = z.uuid();
export const publicAppealSubmissionSchema = appealFields.extend({
  requestId: appealRequestId,
  fileIds: z.array(z.string().regex(/^[\w-]{1,128}$/)).max(maxAppealFiles),
}).refine(requireOtherDepartment, otherDepartmentError);

export type PublicAppealFields = z.infer<typeof publicAppealFormSchema>;

export type AppealResponse<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };
