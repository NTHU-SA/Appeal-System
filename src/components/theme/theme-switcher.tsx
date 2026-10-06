"use client";

import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  themeOptions,
  useThemePreference,
  type ThemePreference,
} from "@/components/theme/theme-preference";

// Icon-only segmented control (Light / Dark / System) for the footer.
export function ThemeSwitcher() {
  const [preference, setPreference] = useThemePreference();

  return (
    <SegmentedControl
      iconOnly
      aria-label="主題"
      value={preference}
      onValueChange={(value) => setPreference(value as ThemePreference)}
    >
      {themeOptions.map(({ value, label, icon: Icon }) => (
        <Tooltip key={value}>
          <TooltipTrigger asChild>
            <SegmentedControlItem value={value} aria-label={label}>
              <Icon />
            </SegmentedControlItem>
          </TooltipTrigger>
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      ))}
    </SegmentedControl>
  );
}
