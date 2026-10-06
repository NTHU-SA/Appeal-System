import { Suspense } from "react";
import { notFound } from "next/navigation";
import { MessageSquare, Paperclip } from "lucide-react";

import { getCaseByToken } from "@/lib/data";
import { formatDateTime } from "@/lib/utils";
import { AttachmentList } from "@/components/cases/attachment-list";
import { CaseField } from "@/components/cases/case-field";
import { CaseStatusIndicator, CategoryBadge } from "@/components/cases/case-status";
import { MessageList } from "@/components/cases/message-list";
import { StudentMessageForm } from "@/components/cases/student-message-form";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { Skeleton } from "@/components/ui/skeleton";

export default async function CaseStatusPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Start one shared request without blocking the reply form.
  const data = getCaseByToken(token);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 lg:px-10 lg:py-10">
      <header className="flex flex-col gap-4 border-b pb-6">
        <p className="text-caption text-text-tertiary">學生申訴協力系統 · 案件進度</p>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <Suspense fallback={<HeadingSkeleton />}>
            <CaseHeading data={data} />
          </Suspense>
          <nav aria-label="案件操作" className="flex flex-wrap gap-2">
            <Button asChild>
              <a href="#reply">
                <Paperclip />
                留言與補件
              </a>
            </Button>
            <Button asChild variant="secondary">
              <a href="#conversation">
                <MessageSquare />
                查看回覆
              </a>
            </Button>
          </nav>
        </div>
      </header>

      <Notice className="mt-6">
        這是你的專屬案件頁，請勿轉傳連結。學權幹部回覆時會寄 email 通知你。
      </Notice>

      <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="flex min-w-0 flex-col gap-10">
          <section id="conversation" aria-labelledby="conversation-heading" className="flex scroll-mt-[calc(var(--header-height)+1.5rem)] flex-col gap-4">
            <h2 id="conversation-heading" className="text-title-md text-text-primary">
              對話紀錄
            </h2>
            <Suspense fallback={<SectionLoading label="正在載入對話紀錄，你可以先填寫留言與補件。" />}>
              <CaseConversation data={data} />
            </Suspense>
          </section>

          <section id="reply" aria-labelledby="reply-heading" className="flex scroll-mt-[calc(var(--header-height)+1.5rem)] flex-col gap-4 rounded-lg border p-4 sm:p-6">
            <div className="flex flex-col gap-1">
              <h2 id="reply-heading" className="text-title-md text-text-primary">
                留言與補件
              </h2>
              <p className="text-body-sm text-text-tertiary">補充說明或回覆學權幹部的問題，可以一併附上檔案。</p>
            </div>
            <StudentMessageForm token={token} />
          </section>
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-[calc(var(--header-height)+1.5rem)]">
          <Suspense fallback={<SectionLoading label="正在載入案件摘要…" boxed />}>
            <CaseSummary data={data} />
          </Suspense>
        </aside>
      </div>
    </main>
  );
}

type CaseDataProps = { data: ReturnType<typeof getCaseByToken> };

async function requireCase(data: CaseDataProps["data"]) {
  const result = await data;
  if (!result) notFound();
  return result;
}

function HeadingSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-4 w-72 max-w-full" />
    </div>
  );
}

function SectionLoading({ label, boxed = false }: { label: string; boxed?: boolean }) {
  return (
    <div role="status" aria-busy="true" className={boxed ? "flex flex-col gap-3 rounded-lg border p-4" : "flex flex-col gap-3"}>
      <p className="text-body-sm text-text-tertiary">{label}</p>
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-16 w-full" />
    </div>
  );
}

async function CaseHeading({ data }: CaseDataProps) {
  const { case: caseRow } = await requireCase(data);
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h1 className="text-headline-md text-text-primary tabular-nums">{caseRow.public_id}</h1>
        <CaseStatusIndicator status={caseRow.status} />
      </div>
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-body-sm text-text-tertiary">
        <span>送件時間 {formatDateTime(caseRow.created_at, { dateStyle: "medium", timeStyle: "short" })}</span>
        <CategoryBadge category={caseRow.category} />
      </p>
    </div>
  );
}

async function CaseSummary({ data }: CaseDataProps) {
  const { case: caseRow, attachments } = await requireCase(data);
  return (
    <>
      <section aria-labelledby="summary-heading" className="flex flex-col gap-4 rounded-lg border p-4">
        <h2 id="summary-heading" className="title-features text-title-sm text-text-primary">
          案件摘要
        </h2>
        <dl className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <CaseField label="申訴人" value={caseRow.student_name} />
            <CaseField label="年級" value={caseRow.student_department} />
          </div>
          <CaseField label="申訴問題" value={caseRow.subject} multiline className="border-t pt-4" />
          <CaseField label="希望得到的處理方式" value={caseRow.desired_outcome} multiline className="border-t pt-4" />
        </dl>
      </section>

      <section aria-labelledby="attachments-heading" className="flex flex-col gap-3 rounded-lg border p-4">
        <h2 id="attachments-heading" className="title-features flex items-center justify-between text-title-sm text-text-primary">
          附件
          <span className="text-body-sm font-normal text-text-tertiary tabular-nums">{attachments.length}</span>
        </h2>
        {attachments.length ? (
          <AttachmentList attachments={attachments} />
        ) : (
          <p className="text-body-sm text-text-tertiary">尚未上傳附件。</p>
        )}
      </section>
    </>
  );
}

async function CaseConversation({ data }: CaseDataProps) {
  const { messages, attachments } = await requireCase(data);
  if (!messages.length) {
    return (
      <div className="rounded-lg border">
        <EmptyState
          icon={MessageSquare}
          title="還沒有回覆"
          description="學權幹部回覆後會顯示在這裡，同時寄 email 通知你。"
        />
      </div>
    );
  }
  return (
    <MessageList
      messages={messages}
      attachments={attachments}
      authorLabel={(message) =>
        message.author_type === "student"
          ? { name: "你", initial: "你" }
          : { name: "學權幹部", initial: "學" }
      }
    />
  );
}
