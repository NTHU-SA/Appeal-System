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

// `segmented`: segmented-control pill. `line`: nav-item tabs with one
// separate 2px indicator that slides to the selected tab.
const tabsListVariants = cva(
  "group/tabs-list relative inline-flex w-fit items-center group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col",
  {
    variants: {
      variant: {
        segmented: "rounded-full bg-surface-hover p-[3px]",
        line: "gap-1 group-data-vertical/tabs:items-stretch",
      },
    },
    defaultVariants: {
      variant: "segmented",
    },
  }
)

// Keeps the line indicator on the active trigger. It snaps into place on
// first paint and only animates on later changes.
function useSlidingIndicator(enabled: boolean) {
  const listRef = React.useRef<HTMLDivElement>(null)
  const indicatorRef = React.useRef<HTMLSpanElement>(null)

  React.useEffect(() => {
    const list = listRef.current
    const indicator = indicatorRef.current
    if (!enabled || !list || !indicator) return

    const vertical = list.getAttribute("aria-orientation") === "vertical"
    const update = () => {
      const active = list.querySelector<HTMLElement>(
        '[data-slot="tabs-trigger"][data-state="active"]'
      )
      if (!active) {
        indicator.style.opacity = "0"
        return
      }
      indicator.style.opacity = "1"
      if (vertical) {
        indicator.style.transform = `translateY(${active.offsetTop}px)`
        indicator.style.height = `${active.offsetHeight}px`
      } else {
        indicator.style.transform = `translateX(${active.offsetLeft}px)`
        indicator.style.width = `${active.offsetWidth}px`
      }
    }

    update()
    const frame = requestAnimationFrame(() => indicator.setAttribute("data-ready", ""))
    const mutations = new MutationObserver(update)
    mutations.observe(list, { subtree: true, attributes: true, attributeFilter: ["data-state"] })
    const resizes = new ResizeObserver(update)
    resizes.observe(list)
    return () => {
      cancelAnimationFrame(frame)
      mutations.disconnect()
      resizes.disconnect()
    }
  }, [enabled])

  return { listRef, indicatorRef }
}

function TabsList({
  className,
  variant = "segmented",
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  const { listRef, indicatorRef } = useSlidingIndicator(variant === "line")

  return (
    <TabsPrimitive.List
      ref={listRef}
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    >
      {children}
      {variant === "line" ? (
        <span
          ref={indicatorRef}
          aria-hidden="true"
          data-slot="tabs-indicator"
          className="pointer-events-none absolute rounded-full bg-primary-text opacity-0 group-data-horizontal/tabs:bottom-0 group-data-horizontal/tabs:left-0 group-data-horizontal/tabs:h-0.5 group-data-vertical/tabs:top-0 group-data-vertical/tabs:right-0 group-data-vertical/tabs:w-0.5 data-ready:transition-[transform,width,height] data-ready:duration-250 data-ready:ease-emphasized motion-reduce:transition-none!"
        />
      ) : null}
    </TabsPrimitive.List>
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
