import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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
