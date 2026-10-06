import * as React from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// Centred icon, one-line title, tertiary description and an optional action;
// text is capped at 448px.
function EmptyState({
  icon: Icon,
  title,
  titleAs: Title = "p",
  description,
  action,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & {
  icon?: LucideIcon
  title: React.ReactNode
  titleAs?: "p" | "h1" | "h2" | "h3"
  description?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "mx-auto flex max-w-md flex-col items-center gap-2 px-4 py-8 text-center",
        className
      )}
      {...props}
    >
      {Icon ? <Icon aria-hidden="true" className="mb-1 size-6 text-text-tertiary" /> : null}
      <Title className="title-features text-title-sm text-text-primary">{title}</Title>
      {description ? (
        <p className="text-body-md text-text-tertiary">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}

export { EmptyState }
