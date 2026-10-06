import * as React from "react"
import {
  CircleAlert,
  CircleCheck,
  Info,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react"

import type { StatusTone } from "@/lib/case-display"
import { cn } from "@/lib/utils"
import { statusTextTone } from "@/components/ui/status"

const defaultIcons: Record<StatusTone, LucideIcon> = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleAlert,
  neutral: Info,
}

// Neutral notice: surface-sunken, no outline. Only the 16px icon takes the
// status colour; the text stays body-sm text-secondary. Never a tinted box
// with a matching outline.
function Notice({
  tone = "info",
  icon,
  title,
  action,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & {
  tone?: StatusTone
  icon?: LucideIcon
  title?: React.ReactNode
  action?: React.ReactNode
}) {
  const Icon = icon ?? defaultIcons[tone]
  return (
    <div
      data-slot="notice"
      className={cn(
        "flex items-start gap-2 rounded-lg bg-surface-sunken px-3 py-2.5 text-body-sm text-text-secondary",
        className
      )}
      {...props}
    >
      <Icon aria-hidden="true" className={cn("mt-0.5 size-4 shrink-0", statusTextTone[tone])} />
      <div className="flex min-w-0 flex-1 flex-col gap-1 [&_a]:text-primary-text [&_a]:underline [&_a]:underline-offset-3">
        {title ? <p className="font-medium text-text-primary">{title}</p> : null}
        {children}
      </div>
      {action ? <div className="-my-1 shrink-0">{action}</div> : null}
    </div>
  )
}

export { Notice }
