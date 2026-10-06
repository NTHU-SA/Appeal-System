"use client"

import * as React from "react"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// Pill on surface-hover with 3px padding; the chosen item lifts onto surface
// with the segmented-control shadow. `iconOnly` uses 28×28 items in a
// radius-lg frame.
function SegmentedControl({
  className,
  iconOnly = false,
  fullWidth = false,
  value,
  onValueChange,
  ...props
}: Omit<
  React.ComponentProps<typeof ToggleGroupPrimitive.Root>,
  "type" | "value" | "defaultValue" | "onValueChange"
> & {
  value: string
  onValueChange: (value: string) => void
  iconOnly?: boolean
  fullWidth?: boolean
}) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="segmented-control"
      data-icon-only={iconOnly || undefined}
      data-full-width={fullWidth || undefined}
      type="single"
      value={value}
      // A segmented control always has one selection.
      onValueChange={(next) => {
        if (next) onValueChange(next)
      }}
      className={cn(
        "group/segmented inline-flex items-center rounded-full bg-surface-hover p-[3px] data-full-width:flex data-full-width:w-full data-icon-only:rounded-lg",
        className
      )}
      {...props}
    />
  )
}

// Selection is read from aria-checked (single-select items are radios): a
// wrapping Tooltip trigger replaces data-state with its own open/closed value.
function SegmentedControlItem({
  className,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="segmented-control-item"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-2.5 py-1.5 text-label-md whitespace-nowrap text-text-tertiary transition-colors hover:text-text-primary disabled:pointer-events-none disabled:opacity-50 aria-checked:bg-surface aria-checked:text-text-primary aria-checked:shadow-segment group-data-full-width/segmented:flex-1 group-data-icon-only/segmented:size-7 group-data-icon-only/segmented:rounded-md group-data-icon-only/segmented:p-0 pointer-coarse:group-data-icon-only/segmented:size-11 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

export { SegmentedControl, SegmentedControlItem }
