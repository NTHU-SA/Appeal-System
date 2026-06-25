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

export type StaffMember = {
  id: string;
  email: string;
  role: Extract<UserRole, "minister" | "member">;
  created_at: string;
  updated_at: string;
};

export type CaseMessage = {
  id: string;
  case_id: string;
  author_id: string | null;
  author_email?: string | null;
  author_type: MessageAuthorType;
  body_text: string | null;
  body_html: string | null;
  created_at: string;
};

export type CaseAttachment = {
  id: string;
  case_id: string;
  message_id: string | null;
  drive_file_id: string;
  drive_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  uploaded_by_type: MessageAuthorType;
  created_at: string;
};

export type DraftReply = {
  id: string;
  case_id: string;
  author_id: string;
  author_email: string;
  body_html: string;
  body_json: unknown;
  created_at: string;
  updated_at: string;
};

export type ReviewRequest = {
  id: string;
  case_id: string;
  requested_by: string;
  requested_by_email: string;
  reviewed_by: string | null;
  reviewed_by_email: string | null;
  decision: ReviewDecision;
  status: "pending" | "approved" | "rejected";
  body_html: string;
  body_json: unknown;
  created_at: string;
  reviewed_at: string | null;
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
