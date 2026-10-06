import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// Register the DESIGN.md type scale and elevation tokens (globals.css) so
// `text-control` is merged as a font size, not as a text colour.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "display",
        "headline-lg",
        "headline-md",
        "wordmark",
        "title-lg",
        "title-md",
        "title-sm",
        "body-lg",
        "body-md",
        "label-md",
        "control",
        "caption",
        "overline",
      ],
      shadow: ["level-1", "level-2", "level-3", "segment"],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(
  date: string | number | Date,
  options: Intl.DateTimeFormatOptions = {},
) {
  return new Date(date).toLocaleDateString("zh-TW", {
    timeZone: "Asia/Taipei",
    ...options,
  });
}

export function formatDateTime(
  date: string | number | Date,
  options: Intl.DateTimeFormatOptions = {},
) {
  return new Date(date).toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
    ...options,
  });
}

export function formatTime(
  date: string | number | Date = new Date(),
  options: Intl.DateTimeFormatOptions = {},
) {
  return new Date(date).toLocaleTimeString("zh-TW", {
    timeZone: "Asia/Taipei",
    ...options,
  });
}
