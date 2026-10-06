import { EmbeddedCaseForm } from "@/components/cases/embedded-case-form";
import { getCaseFormUrl } from "@/lib/env";
import Image from "next/image";

export default function Home() {
  const formUrl = getCaseFormUrl();

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-4xl px-6 pt-8 pb-12 lg:px-10">
        <header className="mb-8 flex flex-col gap-4">
          <div className="flex items-center gap-4 sm:gap-6">
            <Image
              src="/logo.png"
              alt="國立清華大學學生會"
              width={1503}
              height={202}
              sizes="(max-width: 520px) 42vw, 320px"
              preload
              className="h-auto w-[42%] max-w-xs shrink-0"
            />
            <h1 className="text-headline-md text-text-primary">
              清華大學學生申訴協力系統
            </h1>
          </div>
          <p className="max-w-170 text-body-md text-text-secondary">
            填寫下方表單送出申訴，後續進度與回覆會寄到你的電子郵件。
          </p>
        </header>

        {/* The Apps Script form runs inside Google's sandboxed frames and
            cannot follow the page theme, so this panel is always light. */}
        <section
          data-theme="light"
          aria-labelledby="case-form-heading"
          className="rounded-lg border bg-surface p-4 text-text-primary sm:p-6"
        >
          <h2 id="case-form-heading" className="mb-6 text-title-sm">
            申訴送件
          </h2>
          {formUrl ? (
            <EmbeddedCaseForm src={formUrl} />
          ) : (
            <p className="text-body-md text-danger-text">
              申訴表單目前無法載入，請稍後再試。
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
