"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ListFilter, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Keyword search bound to ?q (debounced), keeping the other params.
function CaseSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (value === (searchParams.get("q") ?? "")) return;
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (value.trim()) params.set("q", value.trim());
      else params.delete("q");
      startTransition(() => router.replace(`${pathname}?${params}`, { scroll: false }));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [value, pathname, router, searchParams]);

  return (
    <InputGroup data-pending={pending || undefined}>
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="搜尋編號、姓名或內容"
        aria-label="搜尋案件"
        className="[&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <InputGroupAddon align="inline-end">
          <InputGroupButton aria-label="清除搜尋" onClick={() => setValue("")}>
            <X />
          </InputGroupButton>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  );
}

// List column: search row on top, cards scrolling underneath. Once
// scrolled, an 18px fade under the search row hints at content above.
export function CaseListColumn({
  count,
  activeFilters,
  filters,
  hiddenOnMobile,
  children,
}: {
  count: number;
  activeFilters: number;
  // The filter panel, shown in a drawer below the wide breakpoint.
  filters: React.ReactNode;
  hiddenOnMobile: boolean;
  children: React.ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  return (
    <section
      aria-label="案件清單"
      className={cn(
        "min-h-0 w-full flex-col border-r md:flex md:w-96 md:shrink-0",
        hiddenOnMobile ? "hidden" : "flex",
      )}
    >
      <div data-scrolled={scrolled || undefined} className="scroll-mask relative z-10 flex flex-col gap-3 p-3">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <CaseSearch />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary" className="xl:hidden" aria-label="篩選">
                <ListFilter />
                <span className="hidden sm:inline">篩選</span>
                {activeFilters ? (
                  <span className="rounded-sm bg-surface-sunken px-1.5 py-0.5 text-caption text-text-secondary tabular-nums">
                    {activeFilters}
                  </span>
                ) : null}
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader className="sr-only">
                <SheetTitle>篩選案件</SheetTitle>
                <SheetDescription>依期間、處理狀態與申訴種類篩選</SheetDescription>
              </SheetHeader>
              <div className="overflow-y-auto p-6">{filters}</div>
            </SheetContent>
          </Sheet>
        </div>
        <p className="px-1 text-caption text-text-tertiary tabular-nums" aria-live="polite">
          {count} 件案件
        </p>
      </div>
      <div
        ref={scrollRef}
        onScroll={(event) => setScrolled(event.currentTarget.scrollTop > 0)}
        className="min-h-0 flex-1 overflow-y-auto px-3 pb-3"
      >
        {children}
      </div>
    </section>
  );
}
