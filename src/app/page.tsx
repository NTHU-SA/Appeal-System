import Link from "next/link";
import { ArrowRight, FileText, ShieldCheck } from "lucide-react";

import { getGoogleFormUrl } from "@/lib/env";
import { Button } from "@/components/ui/button";

export default function Home() {
  const formUrl = getGoogleFormUrl();

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

        <section className="space-y-4 rounded-lg border bg-card p-4 shadow-sm sm:p-6">
          <div>
            <h2 className="text-xl font-semibold">申訴送件</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              送件改由 Google Form 收集，附件會存入學權組織的 Google Drive。若表單包含附件題，Google 會要求登入帳號。
            </p>
          </div>

          <div className="grid gap-3">
            <div className="space-y-4 rounded-md border p-4">
              <h3 className="flex items-center gap-2 text-base font-semibold">
                <FileText className="h-4 w-4 text-primary" />
                填寫申訴表單
              </h3>
              <p className="text-sm leading-6 text-muted-foreground">
                送出後系統會寄出案件編號與專屬查詢連結，請保存該信件以追蹤後續狀態。
              </p>
              {formUrl ? (
                <Button asChild className="w-full sm:w-auto">
                  <a href={formUrl || "#"} target="_blank" rel="noreferrer">
                    前往 Google Form
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              ) : (
                <p className="text-xs text-destructive">
                  尚未設定 NEXT_PUBLIC_GOOGLE_FORM_URL。
                </p>
              )}
            </div>

            <div className="flex items-start gap-3 rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p>
                已送出的案件會由學權組織於後台處理；補充資料可透過案件查詢連結送出文字說明。
              </p>
            </div>
          </div>
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
