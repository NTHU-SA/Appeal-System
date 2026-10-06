import { caseStatusOrder } from "@/lib/case-display";
import { parsePeriod, type CaseListFilters } from "@/lib/data";
import type { CaseStatus } from "@/lib/types";

export type CaseSearchParams = {
  days?: string;
  q?: string;
  status?: string;
  category?: string;
};

function list(value: string | undefined) {
  return value ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];
}

export function parseCaseFilters(params: CaseSearchParams): CaseListFilters {
  return {
    days: parsePeriod(params.days),
    query: params.q?.trim() || "",
    statuses: list(params.status).filter((status): status is CaseStatus =>
      caseStatusOrder.includes(status as CaseStatus),
    ),
    categories: list(params.category),
  };
}

// Query string that keeps the current filters on links into a case.
export function caseFiltersQuery(params: CaseSearchParams) {
  const search = new URLSearchParams();
  for (const key of ["days", "q", "status", "category"] as const) {
    if (params[key]) search.set(key, params[key]);
  }
  const value = search.toString();
  return value ? `?${value}` : "";
}
