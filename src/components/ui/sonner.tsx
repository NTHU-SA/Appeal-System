"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon } from "lucide-react"

import { Spinner } from "@/components/ui/spinner"

// Colours come from the design tokens, so the toast follows the page theme;
// status colour is limited to the icon.
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-success" />,
        info: <InfoIcon className="size-4 text-text-tertiary" />,
        warning: <TriangleAlertIcon className="size-4 text-warning" />,
        error: <OctagonXIcon className="size-4 text-danger-text" />,
        loading: <Spinner className="text-text-tertiary" />,
      }}
      style={
        {
          "--normal-bg": "var(--surface)",
          "--normal-text": "var(--text-secondary)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius-lg)",
          zIndex: 600,
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "text-body-md shadow-level-2!",
          title: "text-label-md text-text-primary",
          description: "text-text-tertiary!",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
