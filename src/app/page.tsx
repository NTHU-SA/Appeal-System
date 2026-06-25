import Link from "next/link";
import { SubmissionForm } from "@/components/cases/submission-form";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col">
      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-8 px-4 py-6 lg:grid-cols-[0.9fr_1.1fr] lg:py-10">
        <section className="flex flex-col gap-8 lg:min-h-[calc(100dvh-10rem)]">
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold tracking-normal text-balance sm:text-5xl">
                清華大學學生申訴協力系統
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                送出申訴後，你會收到專屬案件連結，可在手機上追蹤狀態、補充資料與查看學權組織回覆。
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-lg border bg-card p-4 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-xl font-semibold">申訴送件</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              欄位會隨第一封確認信寄回給你，請確認內容正確。
            </p>
          </div>
          <SubmissionForm />
        </section>
      </div>

      <footer className="border-t bg-card/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-foreground">清華大學學生會</p>
            <p className="mt-1">清華大學學生申訴協力系統</p>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <Link
              href="/login"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              學權後台登入
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
