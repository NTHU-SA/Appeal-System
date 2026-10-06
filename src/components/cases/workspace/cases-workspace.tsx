import Link from "next/link";
import { Inbox, User } from "lucide-react";

import { categoryTone } from "@/lib/case-display";
import { caseFiltersQuery, parseCaseFilters, type CaseSearchParams } from "@/lib/case-filters";
import { getCaseList } from "@/lib/data";
import type { CaseRecord } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import { CaseStatusIndicator } from "@/components/cases/case-status";
import { CaseFilters } from "@/components/cases/workspace/case-filters";
import { CaseListColumn } from "@/components/cases/workspace/case-list-column";
import { EmptyState } from "@/components/ui/empty-state";

const squareFill: Record<string, string> = {
  "data-1": "bg-data-1",
  "data-2": "bg-data-2",
  "data-3": "bg-data-3",
  "data-4": "bg-data-4",
  "data-5": "bg-data-5",
  "data-6": "bg-data-6",
  "data-7": "bg-data-7",
  "data-8": "bg-data-8",
  neutral: "bg-text-muted",
};

// List card: title-sm subject with the status on the right; one line of
// description; a meta row 12px below. Selected cards take a primary outline.
function CaseCard({ item, href, selected }: { item: CaseRecord; href: string; selected: boolean }) {
  return (
    <Link
      href={href}
      aria-current={selected ? "page" : undefined}
      className="flex flex-col gap-1 rounded-lg border bg-surface p-4 transition-colors hover:bg-surface-hover aria-[current=page]:border-primary"
    >
      <span className="flex items-start justify-between gap-3">
        <span className="title-features min-w-0 truncate py-0.5 text-title-sm text-text-primary" title={item.subject}>
          {item.subject}
        </span>
        <CaseStatusIndicator status={item.status} className="shrink-0" />
      </span>
      <span className="truncate text-body-sm text-text-secondary">{item.desired_outcome}</span>
      <span className="mt-2 flex items-center gap-3 text-caption text-text-tertiary">
        <span className="shrink-0 tabular-nums">{item.public_id}</span>
        <span className="flex min-w-0 items-center gap-1.5">
          <span aria-hidden="true" className={cn("size-2.5 shrink-0 rounded-[2px]", squareFill[categoryTone(item.category)])} />
          <span className="truncate">{item.category}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1">
          <User aria-hidden="true" className="size-3.5" />
          {item.student_name}
        </span>
        <span className="ml-auto shrink-0 tabular-nums">
          {formatDate(item.created_at, { month: "numeric", day: "numeric" })}
        </span>
      </span>
    </Link>
  );
}

// Master–detail tool page: filter column (360px, ≥ 1280px; a drawer below),
// list column (384px) and the adaptive detail area. Each column scrolls on
// its own. At ≤ 768px only the list or the detail is shown.
export async function CasesWorkspace({
  params,
  selectedId,
  children,
}: {
  params: CaseSearchParams;
  selectedId?: string;
  children: React.ReactNode;
}) {
  const filters = parseCaseFilters(params);
  const list = await getCaseList(filters);
  const query = caseFiltersQuery(params);
  const activeFilters = filters.statuses.length + filters.categories.length;

  const filterPanel = (
    <CaseFilters
      days={filters.days}
      statuses={filters.statuses}
      categories={filters.categories}
      byStatus={list.byStatus}
      byCategory={list.byCategory}
    />
  );

  return (
    <div className="flex min-h-0 flex-1">
      <aside aria-label="篩選" className="hidden w-90 shrink-0 overflow-y-auto border-r p-6 xl:block">
        {filterPanel}
      </aside>

      <CaseListColumn
        count={list.cases.length}
        activeFilters={activeFilters}
        filters={filterPanel}
        hiddenOnMobile={Boolean(selectedId)}
      >
        {list.cases.length ? (
          <ul className="flex flex-col gap-2">
            {list.cases.map((item) => (
              <li key={item.id}>
                <CaseCard item={item} href={`/cases/${item.id}${query}`} selected={item.id === selectedId} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={Inbox}
            title="沒有符合條件的案件"
            description="調整期間、狀態或關鍵字後再試一次。"
          />
        )}
      </CaseListColumn>

      <section
        aria-label="案件內容"
        className={cn("min-w-0 flex-1 flex-col md:flex", selectedId ? "flex" : "hidden")}
      >
        {children}
      </section>
    </div>
  );
}
