import { statusLabels, type CaseStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

// Status colours are on hold (DESIGN.md), so statuses are told apart with the
// accent and neutral tones plus the outlined appearance; the label carries
// the meaning.
const statusStyles: Record<
  CaseStatus,
  { tone: "primary" | "neutral"; appearance: "filled" | "border" }
> = {
  pending: { tone: "primary", appearance: "filled" },
  in_progress: { tone: "primary", appearance: "border" },
  closed: { tone: "neutral", appearance: "filled" },
  rejected: { tone: "neutral", appearance: "border" },
};

export function CaseStatusBadge({ status }: { status: CaseStatus }) {
  return <Badge {...statusStyles[status]}>{statusLabels[status]}</Badge>;
}
