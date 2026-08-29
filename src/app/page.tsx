import { EmbeddedCaseForm } from "@/components/cases/embedded-case-form";
import { getCaseFormUrl } from "@/lib/env";
import Image from "next/image";

export default function Home() {
  const formUrl = getCaseFormUrl();

  return (
    <main className="min-h-dvh">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8 space-y-3 sm:mb-10">
          <div className="flex items-center gap-3 sm:gap-6">
            <Image
              src="/logo.png"
              alt="國立清華大學學生會"
              width={1503}
              height={202}
              sizes="(max-width: 640px) 42vw, 320px"
              preload
              className="h-auto w-[42%] max-w-xs shrink-0"
            />
            <h1 className="text-xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
              清華大學學生申訴協力系統
            </h1>
          </div>
          <p className="max-w-2xl text-xs text-muted-foreground sm:text-base">
            填寫下方表單送出申訴，後續進度與回覆會寄到你的電子郵件。
          </p>
        </header>

        <section aria-labelledby="case-form-heading" className="rounded-lg border bg-card p-4 shadow-sm sm:p-6">
          <h2 id="case-form-heading" className="mb-6 text-xl font-semibold">
            申訴送件
          </h2>
          {formUrl ? (
            <EmbeddedCaseForm src={formUrl} />
          ) : (
            <p className="text-sm text-destructive">
              申訴表單目前無法載入，請稍後再試。
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
