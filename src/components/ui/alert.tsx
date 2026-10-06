import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Bordered note on the page surface. Status colour is limited to the icon and
// title; there is no tinted background.
const alertVariants = cva(
  "group/alert relative grid w-full gap-1 rounded-lg border bg-surface p-3 text-left text-body-md has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "*:[svg]:text-text-tertiary",
        success: "*:[svg]:text-success",
        destructive:
          "*:[svg]:text-danger-text *:data-[slot=alert-title]:text-danger-text",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "text-label-md text-text-primary group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-body-md text-text-secondary group-has-[>svg]/alert:col-start-2 [&_a]:text-primary-text [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-2",
        className
      )}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-2 right-2", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
