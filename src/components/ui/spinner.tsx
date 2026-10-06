import { cn } from "@/lib/utils"

// A 2px ring with one open quarter, one turn per second. 16px or 32px.
function Spinner({
  className,
  size = "sm",
  ...props
}: React.ComponentProps<"span"> & { size?: "sm" | "lg" }) {
  return (
    <span
      data-slot="spinner"
      aria-hidden="true"
      className={cn(
        "inline-block shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent",
        size === "lg" ? "size-8" : "size-4",
        className
      )}
      {...props}
    />
  )
}

export { Spinner }
