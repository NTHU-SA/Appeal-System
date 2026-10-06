"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, CircleXIcon, InfoIcon, TriangleAlertIcon } from "lucide-react"

import { Spinner } from "@/components/ui/spinner"

// Toast: surface, 1px border, radius lg, 10px 12px padding, level-2 shadow.
// The 16px icon takes the status text step; the message stays text-primary;
// an optional action reads as an accent text button. Write what was done
// ("已送出補充內容"), never "操作成功".
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="bottom-right"
      icons={{
        success: <CircleCheckIcon className="size-4 text-success-text" />,
        info: <InfoIcon className="size-4 text-info-text" />,
        warning: <TriangleAlertIcon className="size-4 text-warning-text" />,
        error: <CircleXIcon className="size-4 text-danger-text" />,
        loading: <Spinner className="text-text-tertiary" />,
      }}
      style={
        {
          "--normal-bg": "var(--surface)",
          "--normal-text": "var(--text-primary)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius-lg)",
          zIndex: 600,
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "gap-2! px-3! py-2.5! text-body-sm! shadow-level-2! font-sans!",
          title: "font-normal! text-text-primary!",
          description: "text-text-tertiary!",
          icon: "self-start! mt-0.5! mr-0!",
          actionButton:
            "h-auto! bg-transparent! px-1! text-control! text-primary-text! transition-colors hover:text-primary-text-strong!",
          cancelButton: "h-auto! bg-transparent! px-1! text-control! text-text-tertiary!",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
