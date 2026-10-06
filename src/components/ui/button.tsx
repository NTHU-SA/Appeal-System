import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

// Every button is one control height (32px, 44px on touch), 12px side
// padding, radius sm and the `control` type token.
const buttonVariants = cva(
  "group/button inline-flex h-(--control-height) shrink-0 items-center justify-center gap-2 rounded-sm border border-transparent px-3 text-control whitespace-nowrap transition-colors select-none disabled:pointer-events-none disabled:opacity-50 aria-pressed:bg-surface-active aria-pressed:text-text-primary [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-active",
        secondary:
          "border-border bg-transparent text-text-tertiary hover:bg-surface-hover hover:text-text-primary active:bg-surface-active active:text-text-primary aria-expanded:bg-surface-hover aria-expanded:text-text-primary disabled:bg-surface-hover disabled:text-text-muted disabled:opacity-100",
        tertiary:
          "border-border bg-transparent text-primary-text hover:bg-surface-hover active:bg-surface-active active:text-primary-text-strong disabled:bg-surface-hover disabled:text-text-muted disabled:opacity-100",
        ghost:
          "bg-transparent text-text-tertiary hover:bg-surface-hover hover:text-text-primary active:bg-surface-active active:text-text-primary aria-expanded:bg-surface-hover aria-expanded:text-text-primary",
        // Coral with white text is only 2.9:1, so the fill is the danger
        // text step in both themes.
        danger:
          "bg-danger-solid text-on-primary hover:bg-danger-solid-hover active:bg-danger-solid-hover",
        "danger-secondary":
          "border-border bg-transparent text-danger-text hover:bg-surface-hover active:bg-surface-active disabled:bg-surface-hover disabled:text-text-muted disabled:opacity-100",
        link: "h-auto rounded-none px-0 text-primary-text underline-offset-4 hover:underline",
      },
      size: {
        default: "",
        icon: "w-(--control-height) px-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "primary",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
