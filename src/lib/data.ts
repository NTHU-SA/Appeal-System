import { cache } from "react";

import { callGas } from "@/lib/gas";
import type {
  CaseAttachment,
  CaseMessage,
  CaseRecord,
  DraftReply,
  ReviewRequest,
  StaffMember,
} from "@/lib/types";

export const getCaseByToken = cache(async (token: string) => {
  return callGas<{
    case: CaseRecord;
    messages: CaseMessage[];
    attachments: CaseAttachment[];
  } | null>("getCaseByToken", { token });
});

export async function getAdminCase(caseId: string) {
  return callGas<{
    case: CaseRecord;
    messages: CaseMessage[];
    attachments: CaseAttachment[];
    drafts: DraftReply[];
    reviews: ReviewRequest[];
  }>("getAdminCase", { caseId });
}

export async function getDashboardData(days = 30, query = "") {
  const data = await callGas<{ cases: CaseRecord[]; total: number }>("listCases", {
    days,
    query,
  });
  const cases = data.cases;
  const byStatus = cases.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  return {
    cases,
    total: data.total,
    pending: cases.filter((item) => item.status === "pending").length,
    byStatus,
  };
}

export async function getMembers() {
  return callGas<StaffMember[]>("listMembers");
}
