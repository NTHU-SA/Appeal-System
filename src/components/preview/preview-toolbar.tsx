"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronUp, LayoutGrid, LogOut } from "lucide-react";

import {
  previewDataLabels,
  previewDataSets,
  previewHref,
  previewPersonaLabels,
  previewPersonas,
  type PreviewState,
} from "@/lib/preview/config";
import { previewGroups } from "@/lib/preview/pages";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control";
import { StatusDot } from "@/components/ui/status";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";

// Floating switcher shown in preview mode (development only): persona, data
// set, theme and a jump list of every screen.
export function PreviewToolbar({ state }: { state: PreviewState }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const current = `${pathname}${searchParams.size ? `?${searchParams}` : ""}`;

  // A full navigation, so the new cookie reaches the server render.
  const go = (next: string, change?: Partial<PreviewState>) => {
    window.location.assign(previewHref(next, change));
  };

  return (
    // Bottom centre: the Next.js dev badge sits bottom-left, toasts bottom-right.
    <div className="fixed bottom-4 left-1/2 z-700 -translate-x-1/2 print:hidden">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex h-(--control-height) items-center gap-2 rounded-full border bg-surface px-3 text-control whitespace-nowrap text-text-secondary shadow-level-2 transition-colors hover:bg-surface-hover hover:text-text-primary"
          >
            <StatusDot tone="info" />
            UI 預覽
            <span className="hidden text-text-tertiary sm:inline">
              {previewPersonaLabels[state.persona]} · {previewDataLabels[state.data]}
            </span>
            <ChevronUp className="size-4 text-text-tertiary" />
          </button>
        </PopoverTrigger>
        <PopoverContent side="top" align="center" className="w-96 max-w-[calc(100vw-2rem)] gap-0 p-0">
          <div className="flex flex-col gap-4 border-b p-4">
            <div className="flex flex-col gap-2">
              <span className="text-overline text-text-muted uppercase">身分</span>
              <SegmentedControl
                fullWidth
                aria-label="預覽身分"
                value={state.persona}
                onValueChange={(persona) => go(current, { persona: persona as PreviewState["persona"] })}
              >
                {previewPersonas.map((persona) => (
                  <SegmentedControlItem key={persona} value={persona}>
                    {previewPersonaLabels[persona]}
                  </SegmentedControlItem>
                ))}
              </SegmentedControl>
            </div>
            <div className="flex items-end justify-between gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-overline text-text-muted uppercase">資料</span>
                <SegmentedControl
                  aria-label="預覽資料"
                  value={state.data}
                  onValueChange={(data) => go(current, { data: data as PreviewState["data"] })}
                >
                  {previewDataSets.map((data) => (
                    <SegmentedControlItem key={data} value={data}>
                      {previewDataLabels[data]}
                    </SegmentedControlItem>
                  ))}
                </SegmentedControl>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-overline text-text-muted uppercase">主題</span>
                <ThemeSwitcher />
              </div>
            </div>
          </div>

          <nav aria-label="預覽頁面" className="max-h-80 overflow-y-auto p-1">
            {previewGroups.map((group) => (
              <div key={group.title} className="flex flex-col gap-0.5 pb-1">
                <span className="px-3 pt-2 pb-1 text-overline text-text-muted uppercase">{group.title}</span>
                {group.pages.map((page) => (
                  <a
                    key={`${page.href}-${page.title}`}
                    href={previewHref(page.href, { persona: page.persona, data: page.data })}
                    className="flex h-[30px] items-center rounded-md px-3 text-body-md text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
                  >
                    <span className="truncate">{page.title}</span>
                  </a>
                ))}
              </div>
            ))}
          </nav>

          <div className="flex items-center justify-between gap-2 border-t p-2">
            <Button asChild variant="ghost">
              <Link href="/preview" onClick={() => setOpen(false)}>
                <LayoutGrid />
                所有頁面
              </Link>
            </Button>
            <Button variant="ghost" onClick={() => window.location.assign("/preview/set?off=1&next=/preview")}>
              <LogOut />
              離開預覽
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
