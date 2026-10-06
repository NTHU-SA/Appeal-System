"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { caseCategories, caseStatusOrder, caseStatusTone, categoryTone } from "@/lib/case-display";
import { statusLabels, type CaseStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PeriodControl } from "@/components/dashboard/period-control";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusDot } from "@/components/ui/status";

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

function FilterRow({
  checked,
  onCheckedChange,
  marker,
  label,
  count,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  marker: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <label className="-mx-2 flex h-(--control-height) cursor-pointer items-center gap-3 rounded-sm px-2 text-body-md text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary">
      <Checkbox checked={checked} onCheckedChange={(value) => onCheckedChange(value === true)} />
      <span className="flex min-w-0 flex-1 items-center gap-2">
        {marker}
        <span className="truncate">{label}</span>
      </span>
      <span className="text-caption text-text-tertiary tabular-nums">{count}</span>
    </label>
  );
}

// Filter column: period, status and category. Every change rewrites the
// search params, so the list and the open case stay in sync.
export function CaseFilters({
  days,
  statuses,
  categories,
  byStatus,
  byCategory,
  className,
}: {
  days: number;
  statuses: CaseStatus[];
  categories: string[];
  byStatus: Partial<Record<CaseStatus, number>>;
  byCategory: Partial<Record<string, number>>;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const update = (key: "status" | "category", values: string[]) => {
    const params = new URLSearchParams(searchParams);
    if (values.length) params.set(key, values.join(","));
    else params.delete(key);
    startTransition(() => router.replace(`${pathname}?${params}`, { scroll: false }));
  };

  const toggle = (list: string[], value: string, on: boolean) =>
    on ? [...list, value] : list.filter((item) => item !== value);

  const clear = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("status");
    params.delete("category");
    params.delete("q");
    startTransition(() => router.replace(`${pathname}?${params}`, { scroll: false }));
  };

  const allCategories = [
    ...caseCategories,
    ...Object.keys(byCategory).filter((category) => !(caseCategories as readonly string[]).includes(category)),
  ];
  const active = statuses.length + categories.length + (searchParams.get("q") ? 1 : 0);

  return (
    <div
      data-pending={pending || undefined}
      className={cn("flex flex-col gap-6 transition-opacity data-pending:opacity-60", className)}
    >
      <div className="flex h-(--control-height) items-center justify-between gap-4">
        <h2 className="title-features text-title-sm text-text-primary">篩選</h2>
        {active ? (
          <Button variant="ghost" className="-mr-3" onClick={clear}>
            清除條件
          </Button>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-label-md text-text-primary">期間</span>
        <PeriodControl days={days} fullWidth />
      </div>

      <fieldset className="flex flex-col gap-1">
        <legend className="mb-2 text-label-md text-text-primary">處理狀態</legend>
        {caseStatusOrder.map((status) => (
          <FilterRow
            key={status}
            checked={statuses.includes(status)}
            onCheckedChange={(on) => update("status", toggle(statuses, status, on))}
            marker={<StatusDot tone={caseStatusTone[status]} />}
            label={statusLabels[status]}
            count={byStatus[status] || 0}
          />
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-1">
        <legend className="mb-2 text-label-md text-text-primary">申訴種類</legend>
        {allCategories.map((category) => (
          <FilterRow
            key={category}
            checked={categories.includes(category)}
            onCheckedChange={(on) => update("category", toggle(categories, category, on))}
            marker={<span aria-hidden="true" className={cn("size-2.5 shrink-0 rounded-[2px]", squareFill[categoryTone(category)])} />}
            label={category}
            count={byCategory[category] || 0}
          />
        ))}
      </fieldset>
    </div>
  );
}
