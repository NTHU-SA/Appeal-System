import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

// One style only: the colour's tint step as the background and its text
// step as the label, no outline. For user tags, categories and filters;
// statuses use InlineStatus instead.
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1 rounded-sm px-2 py-0.5 text-body-sm whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3.5",
  {
    variants: {
      tone: {
        neutral: "bg-surface-sunken text-text-secondary",
        "data-1": "bg-data-1-tint text-data-1-text",
        "data-2": "bg-data-2-tint text-data-2-text",
        "data-3": "bg-data-3-tint text-data-3-text",
        "data-4": "bg-data-4-tint text-data-4-text",
        "data-5": "bg-data-5-tint text-data-5-text",
        "data-6": "bg-data-6-tint text-data-6-text",
        "data-7": "bg-data-7-tint text-data-7-text",
        "data-8": "bg-data-8-tint text-data-8-text",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  }
)

function Badge({
  className,
  tone,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ tone }), className)}
      {...props}
    />
  )
}

// "NEW" pill: the only use of the highlight colour.
function NewBadge({ className, children = "NEW", ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="new-badge"
      className={cn(
        "inline-flex h-4 items-center rounded-full bg-highlight-tint px-1.5 text-overline text-highlight-text uppercase",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export { Badge, NewBadge, badgeVariants }
