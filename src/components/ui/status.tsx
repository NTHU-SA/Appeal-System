import * as React from "react"

import type { StatusTone } from "@/lib/case-display"
import { cn } from "@/lib/utils"

const dotTone: Record<StatusTone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  neutral: "bg-text-muted",
}

const textTone: Record<StatusTone, string> = {
  success: "text-success-text",
  warning: "text-warning-text",
  danger: "text-danger-text",
  info: "text-info-text",
  neutral: "text-text-tertiary",
}

// 8px dot in the status base colour.
function StatusDot({
  tone,
  className,
  ...props
}: React.ComponentProps<"span"> & { tone: StatusTone }) {
  return (
    <span
      aria-hidden="true"
      data-slot="status-dot"
      className={cn("inline-block size-2 shrink-0 rounded-full", dotTone[tone], className)}
      {...props}
    />
  )
}

// Inline status for tables, cards and lists: dot, a short 500-weight label
// in the status text step, then an optional tabular count.
function InlineStatus({
  tone,
  label,
  count,
  className,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & {
  tone: StatusTone
  label: React.ReactNode
  count?: React.ReactNode
}) {
  return (
    <span
      data-slot="inline-status"
      className={cn("inline-flex items-center gap-2 text-body-sm whitespace-nowrap", className)}
      {...props}
    >
      <StatusDot tone={tone} />
      <span className={cn("font-medium", textTone[tone])}>{label}</span>
      {count !== undefined ? (
        <span className="ml-1 text-text-tertiary tabular-nums">{count}</span>
      ) : null}
    </span>
  )
}

// System status row: only the dot carries colour, the text stays neutral.
function StatusLine({
  tone,
  className,
  children,
  ...props
}: React.ComponentProps<"li"> & { tone: StatusTone }) {
  return (
    <li
      data-slot="status-line"
      className={cn("flex items-center gap-2 text-body-sm text-text-secondary", className)}
      {...props}
    >
      <StatusDot tone={tone} />
      {children}
    </li>
  )
}

export { InlineStatus, StatusDot, StatusLine, textTone as statusTextTone }
