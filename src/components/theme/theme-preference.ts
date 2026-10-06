"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";

import { THEME_STORAGE_KEY } from "@/components/theme/theme-script";

export type ThemePreference = "light" | "dark" | "system";

const THEME_CHANGE_EVENT = "themepreferencechange";

export const themeOptions: {
  value: ThemePreference;
  label: string;
  icon: LucideIcon;
}[] = [
  { value: "light", label: "淺色", icon: Sun },
  { value: "dark", label: "深色", icon: Moon },
  { value: "system", label: "跟隨系統", icon: Monitor },
];

// Used when storage is unavailable (e.g. blocked site data).
let unsavedPreference: ThemePreference = "system";

function readPreference(): ThemePreference {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return unsavedPreference;
  }
}

// "system" removes data-theme so the CSS media query decides; an explicit
// choice is written to <html> (globals.css holds both token sets).
function applyPreference(preference: ThemePreference) {
  const root = document.documentElement;
  // Switch every colour in one frame instead of running each 100ms transition.
  const freeze = document.createElement("style");
  freeze.textContent = "*,*::before,*::after{transition:none!important}";
  document.head.appendChild(freeze);

  if (preference === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", preference);
  }

  window.getComputedStyle(root).getPropertyValue("color-scheme");
  requestAnimationFrame(() => freeze.remove());
}

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY) return;
    applyPreference(readPreference());
    onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(THEME_CHANGE_EVENT, onChange);
  };
}

export function useThemePreference() {
  const preference = useSyncExternalStore(
    subscribe,
    readPreference,
    (): ThemePreference => "system",
  );

  const setPreference = useCallback((next: ThemePreference) => {
    unsavedPreference = next;
    try {
      if (next === "system") {
        localStorage.removeItem(THEME_STORAGE_KEY);
      } else {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      }
    } catch {
      // The choice still applies for this page view.
    }
    applyPreference(next);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }, []);

  return [preference, setPreference] as const;
}
