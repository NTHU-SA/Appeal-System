export type UserRole = "minister" | "member" | "user";

export type CaseStatus = "pending" | "in_progress" | "closed" | "rejected";

export type ReviewDecision = "accepted" | "rejected";

export type MessageAuthorType = "student" | "member" | "minister" | "system";

export type CaseRecord = {
  id: string;
  public_id: string;
  status: CaseStatus;
  student_email: string;
  student_department: string;
  student_name: string;
  category: string;
  subject: string;
  desired_outcome: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  last_student_message_at: string | null;
  last_staff_message_at: string | null;
  closed_at: string | null;
};

export const statusLabels: Record<CaseStatus, string> = {
  pending: "待處理",
  in_progress: "處理中",
  closed: "已結案",
  rejected: "已拒絕",
};

export const roleLabels: Record<UserRole, string> = {
  minister: "部長",
  member: "部員",
  user: "普通用戶",
};
