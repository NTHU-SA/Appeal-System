"use client"

import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-react"

// 16×16, radius sm. Unchecked: 2px text-tertiary outline. Checked: primary
// fill with a white tick. The pseudo-element widens the touch target.
function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-sm border-2 border-text-tertiary transition-colors after:absolute after:-inset-2 pointer-coarse:after:-inset-3.5 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger data-checked:border-primary data-checked:bg-primary data-checked:text-on-primary",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current [&>svg]:size-3"
      >
        <CheckIcon strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
