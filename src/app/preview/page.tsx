import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

import {
  previewAvailable,
  previewDataLabels,
  previewHref,
  previewPersonaLabels,
} from "@/lib/preview/config";
import { previewGroups } from "@/lib/preview/pages";
import { getPreviewState } from "@/lib/preview/state";
import { Wordmark } from "@/components/layout/wordmark";
import { ThemeMenu } from "@/components/theme/theme-menu";
import { Badge } from "@/components/ui/badge";
import { Notice } from "@/components/ui/notice";

export const metadata = { title: "UI 預覽 · 學生申訴協力系統" };

// Development-only index of every screen, opened with mock data and a chosen
// persona, bypassing Google sign-in and Apps Script.
export default async function PreviewIndexPage() {
  if (!previewAvailable()) notFound();
  const state = await getPreviewState();

  return (
    <>
      <header className="sticky top-0 z-900 border-b bg-surface">
        <div className="flex items-center justify-between gap-4 px-6 py-3 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <Wordmark href="/preview" />
            <Badge>UI 預覽</Badge>
          </div>
          <ThemeMenu />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-8 lg:px-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-headline-md text-text-primary">所有頁面</h1>
          <p className="max-w-170 text-body-md text-text-secondary">
            直接開啟每個頁面檢視設計，不需要 Google 登入或 Apps Script。資料來自假資料，表單送出不會寫入任何地方。畫面下方的「UI 預覽」按鈕可以隨時切換身分、資料與主題。
          </p>
        </div>

        <Notice tone={state ? "success" : "info"}>
          {state
            ? `預覽模式已啟用：${previewPersonaLabels[state.persona]} · ${previewDataLabels[state.data]}。`
            : "尚未進入預覽模式。點選任一頁面後即會啟用，並自動切換到該頁面需要的身分。"}
        </Notice>

        {previewGroups.map((group) => (
          <section key={group.title} aria-labelledby={`group-${group.title}`} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h2 id={`group-${group.title}`} className="text-title-md text-text-primary">
                {group.title}
              </h2>
              <p className="text-body-sm text-text-tertiary">{group.description}</p>
            </div>
            <ul className="divide-y overflow-hidden rounded-lg border">
              {group.pages.map((page) => (
                <li key={`${page.href}-${page.title}`}>
                  <a
                    href={previewHref(page.href, { persona: page.persona, data: page.data })}
                    className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-surface-hover"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="text-label-md text-text-primary">{page.title}</span>
                      <span className="truncate text-body-sm text-text-tertiary">{page.description}</span>
                    </div>
                    <code className="hidden shrink-0 font-mono text-caption text-text-tertiary md:block">
                      {page.href}
                    </code>
                    {page.persona ? (
                      <Badge className="shrink-0">
                        {previewPersonaLabels[page.persona]}
                        {page.data === "empty" ? ` · ${previewDataLabels.empty}` : ""}
                      </Badge>
                    ) : null}
                    <ArrowUpRight className="size-4 shrink-0 text-text-tertiary transition-colors group-hover:text-text-primary" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </>
  );
}
