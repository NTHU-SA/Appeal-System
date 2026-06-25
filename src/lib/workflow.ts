import type { CaseStatus, ReviewDecision, UserRole } from "@/lib/types";

export function canManageMembers(role: UserRole | null) {
  return role === "minister";
}

export function canReview(role: UserRole | null) {
  return role === "minister";
}

export function canWorkCase(role: UserRole | null) {
  return role === "minister" || role === "member";
}

export function staffRoleFromMemberRole(role: UserRole | null | undefined) {
  return role === "minister" || role === "member" ? role : null;
}

export function nextStatusForReview(decision: ReviewDecision): CaseStatus {
  return decision === "accepted" ? "in_progress" : "rejected";
}

type AutoCloseInput = {
  status: CaseStatus;
  lastStaffMessageAt: Date | null;
  lastStudentMessageAt: Date | null;
  now: Date;
  staleDays?: number;
};

export function shouldAutoCloseCase({
  status,
  lastStaffMessageAt,
  lastStudentMessageAt,
  now,
  staleDays = 14,
}: AutoCloseInput) {
  if (status !== "in_progress" || !lastStaffMessageAt) return false;
  if (lastStudentMessageAt && lastStudentMessageAt > lastStaffMessageAt) {
    return false;
  }

  const staleMs = staleDays * 24 * 60 * 60 * 1000;
  return now.getTime() - lastStaffMessageAt.getTime() >= staleMs;
}

export function emailIdempotencyKey(event: string, id: string) {
  return `campusvoice:${event}:${id}`;
}
