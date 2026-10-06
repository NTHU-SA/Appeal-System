"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  themeOptions,
  useThemePreference,
  type ThemePreference,
} from "@/components/theme/theme-preference";

// Navigation-bar theme button: opens a Light / Dark / System menu. The icon
// rotates in from -90° only when the user changes the theme.
export function ThemeMenu() {
  const [preference, setPreference] = useThemePreference();
  const [changedByUser, setChangedByUser] = useState(false);
  const current = themeOptions.find((option) => option.value === preference) ?? themeOptions[2];
  const Icon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`主題：${current.label}`}>
          <Icon
            key={preference}
            className={changedByUser ? "animate-in fade-in-0 -spin-in-90 duration-200" : undefined}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>主題</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={preference}
          onValueChange={(value) => {
            setChangedByUser(true);
            setPreference(value as ThemePreference);
          }}
        >
          {themeOptions.map(({ value, label, icon: OptionIcon }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <OptionIcon />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
