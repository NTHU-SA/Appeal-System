"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control";

const periods = [7, 14, 30, 90];

// Period picker bound to ?days, keeping the other search params.
export function PeriodControl({
  days,
  fullWidth = false,
  className,
}: {
  days: number;
  fullWidth?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  return (
    <SegmentedControl
      aria-label="期間"
      fullWidth={fullWidth}
      value={String(days)}
      data-pending={pending || undefined}
      className={cn("transition-opacity data-pending:opacity-60", className)}
      onValueChange={(value) => {
        const params = new URLSearchParams(searchParams);
        params.set("days", value);
        startTransition(() => router.replace(`${pathname}?${params}`, { scroll: false }));
      }}
    >
      {periods.map((period) => (
        <SegmentedControlItem key={period} value={String(period)}>
          {period} 日
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  );
}
