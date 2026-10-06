import { cn } from "@/lib/utils";

export type ChartSegment = {
  key: string;
  label: string;
  value: number;
  // Fill class for the base colour, e.g. "bg-warning" or "bg-data-3".
  fill: string;
};

// Stacked progress bar: 10px tall, 2px gaps, 2px corners. Values live in
// the legend, never on the bar. An empty bar is surface-sunken.
export function StackedBar({ segments, className }: { segments: ChartSegment[]; className?: string }) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  return (
    <div
      role="img"
      aria-label={segments.map((segment) => `${segment.label} ${segment.value}`).join("，")}
      className={cn("flex h-2.5 w-full gap-0.5 overflow-hidden rounded-[2px]", className)}
    >
      {total === 0 ? (
        <span className="h-full flex-1 rounded-[2px] bg-surface-sunken" />
      ) : (
        segments
          .filter((segment) => segment.value > 0)
          .map((segment) => (
            <span
              key={segment.key}
              className={cn("h-full rounded-[2px]", segment.fill)}
              style={{ width: `${(segment.value / total) * 100}%` }}
            />
          ))
      )}
    </div>
  );
}

// Legend: 10px square, 12px label, tabular value on the right.
export function ChartLegend({
  segments,
  showShare = false,
  className,
}: {
  segments: ChartSegment[];
  showShare?: boolean;
  className?: string;
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  return (
    <ul className={cn("flex flex-col gap-2", className)}>
      {segments.map((segment) => (
        <li key={segment.key} className="flex items-center gap-2 text-caption">
          <span aria-hidden="true" className={cn("size-2.5 shrink-0 rounded-[2px]", segment.fill)} />
          <span className="min-w-0 flex-1 truncate text-text-secondary">{segment.label}</span>
          {showShare ? (
            <span className="w-10 text-right text-text-tertiary tabular-nums">
              {total ? `${Math.round((segment.value / total) * 100)}%` : "—"}
            </span>
          ) : null}
          <span className="w-8 text-right font-medium text-text-primary tabular-nums">{segment.value}</span>
        </li>
      ))}
    </ul>
  );
}

// One bar per item on a surface-sunken track, for comparing categories.
export function BarList({ segments, className }: { segments: ChartSegment[]; className?: string }) {
  const max = Math.max(1, ...segments.map((segment) => segment.value));
  return (
    <ul className={cn("flex flex-col gap-3", className)}>
      {segments.map((segment) => (
        <li key={segment.key} className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-caption">
            <span aria-hidden="true" className={cn("size-2.5 shrink-0 rounded-[2px]", segment.fill)} />
            <span className="min-w-0 flex-1 truncate text-text-secondary">{segment.label}</span>
            <span className="font-medium text-text-primary tabular-nums">{segment.value}</span>
          </div>
          <div className="h-2.5 w-full rounded-[2px] bg-surface-sunken">
            <div
              className={cn("h-full rounded-[2px]", segment.fill)}
              style={{ width: `${(segment.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
