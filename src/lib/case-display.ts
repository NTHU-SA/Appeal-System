import type { CaseStatus, ReviewRequest, StaffMember } from "@/lib/types";

// Status tones map to DESIGN.md status colours. They always travel with a
// text label; colour alone never carries the meaning.
export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

export const caseStatusOrder: CaseStatus[] = ["pending", "in_progress", "closed", "rejected"];

export const caseStatusTone: Record<CaseStatus, StatusTone> = {
  pending: "warning",
  in_progress: "info",
  closed: "success",
  rejected: "danger",
};

export const reviewStatusLabels: Record<ReviewRequest["status"], string> = {
  pending: "待審核",
  approved: "已核准",
  rejected: "已退回",
};

export const reviewStatusTone: Record<ReviewRequest["status"], StatusTone> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

export const reviewDecisionLabels: Record<ReviewRequest["decision"], string> = {
  accepted: "受理",
  rejected: "不受理",
};

// Categorical colours are handed out in order (data-1 → data-8). The intake
// form's catch-all "其他" stays neutral, like the ninth-and-later rule.
export type DataTone = "data-1" | "data-2" | "data-3" | "data-4" | "data-5" | "data-6" | "data-7" | "data-8" | "neutral";

export const caseCategories = ["課務與教學", "宿舍與生活", "行政程序", "校園安全", "其他"] as const;

const dataTones: DataTone[] = ["data-1", "data-2", "data-3", "data-4", "data-5", "data-6", "data-7", "data-8"];

export function categoryTone(category: string): DataTone {
  if (category === "其他") return "neutral";
  const index = caseCategories.indexOf(category as (typeof caseCategories)[number]);
  return index >= 0 ? dataTones[index] : "neutral";
}

export const roleTone: Record<StaffMember["role"], DataTone> = {
  minister: "data-1",
  member: "data-2",
};
