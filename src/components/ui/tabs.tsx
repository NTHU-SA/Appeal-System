"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        className
      )}
      {...props}
    />
  )
}

// `segmented`: segmented-control pill. `line`: nav-item tabs whose selected
// tab carries a 2px primary indicator line.
const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col",
  {
    variants: {
      variant: {
        segmented: "rounded-full bg-surface-hover p-[3px]",
        line: "gap-1 border-b group-data-vertical/tabs:border-r group-data-vertical/tabs:border-b-0",
      },
    },
    defaultVariants: {
      variant: "segmented",
    },
  }
)

function TabsList({
  className,
  variant = "segmented",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative isolate inline-flex items-center justify-center gap-2 whitespace-nowrap text-text-tertiary transition-colors hover:text-text-primary disabled:pointer-events-none disabled:opacity-50 data-active:text-text-primary group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // segmented
        "group-data-[variant=segmented]/tabs-list:rounded-full group-data-[variant=segmented]/tabs-list:px-2.5 group-data-[variant=segmented]/tabs-list:py-1.5 group-data-[variant=segmented]/tabs-list:text-label-md group-data-[variant=segmented]/tabs-list:data-active:bg-surface group-data-[variant=segmented]/tabs-list:data-active:shadow-segment",
        // line: hover tint fades in on a pseudo-element so layout never shifts
        "group-data-[variant=line]/tabs-list:h-(--control-height) group-data-[variant=line]/tabs-list:px-3 group-data-[variant=line]/tabs-list:text-control group-data-[variant=line]/tabs-list:before:absolute group-data-[variant=line]/tabs-list:before:inset-x-0 group-data-[variant=line]/tabs-list:before:inset-y-1 group-data-[variant=line]/tabs-list:before:-z-1 group-data-[variant=line]/tabs-list:before:rounded-sm group-data-[variant=line]/tabs-list:before:bg-surface-hover group-data-[variant=line]/tabs-list:before:opacity-0 group-data-[variant=line]/tabs-list:before:transition-opacity group-data-[variant=line]/tabs-list:hover:before:opacity-100",
        "group-data-[variant=line]/tabs-list:after:absolute group-data-[variant=line]/tabs-list:after:rounded-full group-data-[variant=line]/tabs-list:after:bg-primary-text group-data-[variant=line]/tabs-list:after:opacity-0 group-data-[variant=line]/tabs-list:after:transition-opacity group-data-[variant=line]/tabs-list:data-active:after:opacity-100 group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:-bottom-px group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-px group-data-vertical/tabs:after:w-0.5",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 text-body-md outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
