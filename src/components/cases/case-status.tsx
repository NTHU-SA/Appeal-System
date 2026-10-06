import { caseStatusTone, categoryTone } from "@/lib/case-display";
import { statusLabels, type CaseStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { InlineStatus } from "@/components/ui/status";

// Case status as an inline status (dot + label), never a badge.
export function CaseStatusIndicator({
  status,
  count,
  className,
}: {
  status: CaseStatus;
  count?: React.ReactNode;
  className?: string;
}) {
  return (
    <InlineStatus
      tone={caseStatusTone[status]}
      label={statusLabels[status]}
      count={count}
      className={className}
    />
  );
}

// Complaint category as a categorical badge (data-1 → data-8).
export function CategoryBadge({ category, className }: { category: string; className?: string }) {
  return (
    <Badge tone={categoryTone(category)} className={className}>
      {category || "未分類"}
    </Badge>
  );
}
