import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { SubmissionForm } from "@/components/cases/submission-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-dvh">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-6 lg:grid-cols-[0.9fr_1.1fr] lg:py-10">
        <section className="flex flex-col justify-between gap-8 lg:min-h-[calc(100dvh-5rem)]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              學生權益申訴協作
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold tracking-normal text-balance sm:text-5xl">
                清華大學學生申訴協力系統
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                送出申訴後，你會收到專屬案件連結，可在手機上追蹤狀態、補充資料與查看學權組織回覆。
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span className="rounded-md bg-card px-3 py-1">免登入送件</span>
              <span className="rounded-md bg-card px-3 py-1">多檔附件</span>
              <span className="rounded-md bg-card px-3 py-1">案件狀態追蹤</span>
            </div>
          </div>

          <Card className="bg-card/80">
            <CardContent className="space-y-3 p-4 text-sm text-muted-foreground">
              <p>若是學權組織成員，請使用 Google 登入進入後台處理案件。</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/login">前往後台登入</Link>
              </Button>
            </CardContent>
          </Card>
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
    </main>
  );
}
