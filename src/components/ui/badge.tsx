import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

// Tinted label: solid-colour text on the same colour at 20% opacity. The
// `border` appearance adds a 1px outline in the same colour.
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1 rounded-sm border border-transparent px-2 py-1 text-body-md whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3.5",
  {
    variants: {
      tone: {
        primary: "bg-primary/20 text-primary-text-strong",
        neutral: "bg-text-tertiary/20 text-text-secondary",
        danger: "bg-danger/20 text-danger-text",
      },
      appearance: {
        filled: "",
        border: "",
      },
    },
    compoundVariants: [
      { tone: "primary", appearance: "border", className: "border-primary-text-strong/40" },
      { tone: "neutral", appearance: "border", className: "border-text-tertiary/40" },
      { tone: "danger", appearance: "border", className: "border-danger-text/40" },
    ],
    defaultVariants: {
      tone: "neutral",
      appearance: "filled",
    },
  }
)

function Badge({
  className,
  tone,
  appearance,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ tone, appearance }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
