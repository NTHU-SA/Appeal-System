import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-sm border bg-surface px-3 py-2 text-body-md text-text-primary transition-colors outline-none placeholder:text-text-muted focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger-text pointer-coarse:text-body-lg",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
