import { cache } from "react";

import { getCachedCaseData } from "@/lib/case-cache";
import { callGas } from "@/lib/gas";
import { getPreviewState } from "@/lib/preview/state";
import type {
  CaseAttachment,
  CaseMessage,
  CaseRecord,
  CaseStatus,
  DraftReply,
  ReviewRequest,
  StaffMember,
} from "@/lib/types";

type CaseByToken = {
  case: CaseRecord;
  messages: CaseMessage[];
  attachments: CaseAttachment[];
} | null;

export const getCaseByToken = cache(async (token: string) => {
  const fetchCase = () => callGas<CaseByToken>("getCaseByToken", { token });
  // Preview fixtures must never land in the shared case cache.
  if (await getPreviewState()) return fetchCase();
  return getCachedCaseData(`token:${token}`, fetchCase);
});


export async function getAdminCase(caseId: string) {
  return callGas<{
    case: CaseRecord;
    messages: CaseMessage[];
    attachments: CaseAttachment[];
    drafts: DraftReply[];
    reviews: ReviewRequest[];
  } | null>("getAdminCase", { caseId });
}

export const periodOptions = [7, 14, 30, 90] as const;

export function parsePeriod(value: string | undefined) {
  const days = Number(value);
  return periodOptions.includes(days as (typeof periodOptions)[number]) ? days : 30;
}

function countBy<T extends string>(cases: CaseRecord[], key: (item: CaseRecord) => T) {
  return cases.reduce<Partial<Record<T, number>>>((acc, item) => {
    const value = key(item);
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

// New cases per day (per week for 90 days), oldest first.
function trendOf(cases: CaseRecord[], days: number) {
  const bucketDays = days > 30 ? 7 : 1;
  const buckets = Math.ceil(days / bucketDays);
  const dayMs = 24 * 60 * 60 * 1000;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const points = Array.from({ length: buckets }, (_, index) => {
    const end = today.getTime() - (buckets - 1 - index) * bucketDays * dayMs;
    return { date: new Date(end - (bucketDays - 1) * dayMs).toISOString(), value: 0, end };
  });
  for (const item of cases) {
    const time = new Date(item.created_at).getTime();
    const point = points.find((candidate) => time <= candidate.end && time > candidate.end - bucketDays * dayMs);
    if (point) point.value += 1;
  }
  return points.map(({ date, value }) => ({ date, value }));
}

export async function getDashboardData(days = 30) {
  const data = await callGas<{ cases: CaseRecord[]; total: number }>("listCases", {
    days,
    query: "",
  });
  const cases = data.cases;

  return {
    cases,
    total: data.total,
    byStatus: countBy<CaseStatus>(cases, (item) => item.status),
    byCategory: countBy(cases, (item) => item.category),
    trend: trendOf(cases, days),
    bucketDays: days > 30 ? 7 : 1,
  };
}

export type CaseListFilters = {
  days: number;
  query: string;
  statuses: CaseStatus[];
  categories: string[];
};

// Period and keyword are applied by Apps Script; status and category here,
// so the filter counts can show what each choice would add.
export async function getCaseList(filters: CaseListFilters) {
  const data = await callGas<{ cases: CaseRecord[]; total: number }>("listCases", {
    days: filters.days,
    query: filters.query,
  });
  const cases = data.cases.filter(
    (item) =>
      (!filters.statuses.length || filters.statuses.includes(item.status)) &&
      (!filters.categories.length || filters.categories.includes(item.category)),
  );
  cases.sort((a, b) => b.created_at.localeCompare(a.created_at));

  return {
    cases,
    byStatus: countBy<CaseStatus>(data.cases, (item) => item.status),
    byCategory: countBy(data.cases, (item) => item.category),
  };
}

export async function getMembers() {
  return callGas<StaffMember[]>("listMembers");
}
