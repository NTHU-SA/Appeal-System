import { cn } from "@/lib/utils"

// Border-coloured block that breathes (opacity 1 → 0.6 → 1, every 2s).
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-breathe rounded-sm bg-border", className)}
      {...props}
    />
  )
}

export { Skeleton }
