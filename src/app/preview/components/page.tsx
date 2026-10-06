import { notFound } from "next/navigation";

import { previewAvailable } from "@/lib/preview/config";
import { Wordmark } from "@/components/layout/wordmark";
import { ComponentGallery } from "@/components/preview/component-gallery";
import { ThemeMenu } from "@/components/theme/theme-menu";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "元件總覽 · UI 預覽" };

// Development-only gallery of DESIGN.md tokens and component states.
export default function ComponentsPage() {
  if (!previewAvailable()) notFound();

  return (
    <>
      <header className="sticky top-0 z-900 border-b bg-surface">
        <div className="flex items-center justify-between gap-4 px-6 py-3 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <Wordmark href="/preview" />
            <Badge>元件總覽</Badge>
          </div>
          <ThemeMenu />
        </div>
      </header>
      <ComponentGallery />
    </>
  );
}
