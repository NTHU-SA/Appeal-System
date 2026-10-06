import * as React from "react"

import { cn } from "@/lib/utils"

// Focus only recolours the border (no glow). Touch devices get 16px text so
// iOS does not zoom on focus.
const inputClassName =
  "h-(--control-height) w-full min-w-0 rounded-sm border bg-surface px-3 text-body-md text-text-primary transition-colors outline-none placeholder:text-text-muted file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-control file:text-text-primary focus-visible:border-primary disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger-text pointer-coarse:text-body-lg"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputClassName, className)}
      {...props}
    />
  )
}

export { Input, inputClassName }
