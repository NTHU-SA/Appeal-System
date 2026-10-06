import * as React from "react"
import { CircleX } from "lucide-react"

import { cn } from "@/lib/utils"

// Label, control and one line of help or error text, 8px apart.
function Field({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field"
      className={cn("flex min-w-0 flex-col gap-2", className)}
      {...props}
    />
  )
}

function FieldHint({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-hint"
      className={cn("text-caption text-text-tertiary", className)}
      {...props}
    />
  )
}

// Validation message: 12px in the danger text step with a 16px ✕ icon.
// Say what is wrong and how to fix it.
function FieldError({ className, children, ...props }: React.ComponentProps<"p">) {
  if (!children) return null
  return (
    <p
      data-slot="field-error"
      role="alert"
      className={cn("flex items-start gap-1 text-caption text-danger-text", className)}
      {...props}
    >
      <CircleX aria-hidden="true" className="size-4 shrink-0" />
      <span className="pt-px">{children}</span>
    </p>
  )
}

export { Field, FieldError, FieldHint }
