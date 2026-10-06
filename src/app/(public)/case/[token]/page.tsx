import { Suspense } from "react";
import { notFound } from "next/navigation";
import { MessageSquare, Paperclip } from "lucide-react";

import { getCaseByToken } from "@/lib/data";
import { formatDateTime } from "@/lib/utils";
import { AttachmentList } from "@/components/cases/attachment-list";
import { CaseField } from "@/components/cases/case-field";
import { CaseStatusBadge } from "@/components/cases/case-status-badge";
import { StudentMessageForm } from "@/components/cases/student-message-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
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
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8 lg:px-10">
      <div className="mb-6 flex flex-col gap-2">
        <p className="text-caption text-text-tertiary">
          國立清華大學學生會 · 學生申訴協力系統
        </p>
        <Suspense fallback={<CaseDataLoading />}>
          <CaseHeading data={data} />
        </Suspense>
      </div>

      <nav aria-label="案件操作" className="mb-6 flex flex-wrap gap-2">
        <Button asChild><a href="#reply"><Paperclip />留言與補件</a></Button>
        <Button asChild variant="secondary"><a href="#conversation"><MessageSquare />查看回覆</a></Button>
      </nav>
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Suspense fallback={<CaseDataLoading />}>
          <CaseSummary data={data} />
        </Suspense>

        <Card id="reply" className="order-first scroll-mt-6 lg:order-last">
          <CardHeader>
            <CardTitle>留言與補件</CardTitle>
          </CardHeader>
          <CardContent>
            <StudentMessageForm token={token} />
          </CardContent>
        </Card>
      </div>

      <Suspense fallback={<div id="conversation" className="mt-6 scroll-mt-6"><CaseDataLoading /></div>}>
        <CaseConversation data={data} />
      </Suspense>
    </main>
  );
}

type CaseDataProps = { data: ReturnType<typeof getCaseByToken> };

async function requireCase(data: CaseDataProps["data"]) {
  const result = await data;
  if (!result) notFound();
  return result;
}

function CaseDataLoading() {
  return <div role="status" aria-busy="true" className="flex flex-col gap-3 rounded-lg border p-4">
    <p className="text-body-md text-text-tertiary">正在載入案件資料，您可以先填寫留言與補件。</p>
    <Skeleton className="h-6 w-48" />
    <Skeleton className="h-16 w-full" />
  </div>;
}

async function CaseHeading({ data }: CaseDataProps) {
  const { case: caseRow } = await requireCase(data);
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-headline-md tabular-nums text-text-primary">
          {caseRow.public_id}
        </h1>
        <p className="text-caption text-text-tertiary">
          送件時間：{formatDateTime(caseRow.created_at)}
        </p>
      </div>
      <CaseStatusBadge status={caseRow.status} />
    </div>
  );
}

async function CaseSummary({ data }: CaseDataProps) {
  const { case: caseRow } = await requireCase(data);
  return (
    <Card>
      <CardHeader>
        <CardTitle>案件摘要</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <CaseField label="申訴人" value={caseRow.student_name} />
            <CaseField label="年級" value={caseRow.student_department} />
          </div>
          <CaseField label="申訴種類" value={caseRow.category} />
          <CaseField label="申訴問題" value={caseRow.subject} multiline className="border-t pt-4" />
          <CaseField
            label="希望得到的處理方式"
            value={caseRow.desired_outcome}
            multiline
            className="border-t pt-4"
          />
        </dl>
      </CardContent>
    </Card>
  );
}

async function CaseConversation({ data }: CaseDataProps) {
  const { messages, attachments } = await requireCase(data);
  return (
    <Card id="conversation" className="mt-6 scroll-mt-6">
      <CardHeader>
        <CardTitle>對話紀錄</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {messages.length ? (
          <ol className="flex flex-col divide-y">
            {messages.map((message) => (
              <li key={message.id} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-label-md text-text-primary">
                    {message.author_type === "student" ? "你" : "學權幹部"}
                  </span>
                  <time className="text-caption text-text-tertiary">
                    {formatDateTime(message.created_at)}
                  </time>
                </div>
                {message.body_html ? (
                  <div
                    className="rich-text text-body-lg"
                    dangerouslySetInnerHTML={{ __html: message.body_html }}
                  />
                ) : (
                  <p className="whitespace-pre-wrap text-body-lg text-text-secondary">
                    {message.body_text}
                  </p>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState icon={MessageSquare} title="尚無對話紀錄" description="幹部回覆後會顯示在這裡。" />
        )}

        {attachments.length ? (
          <section aria-labelledby="attachments-heading" className="flex flex-col gap-2 border-t pt-4">
            <h2 id="attachments-heading" className="text-label-md text-text-primary">
              案件附件（{attachments.length}）
            </h2>
            <AttachmentList attachments={attachments} />
          </section>
        ) : null}
      </CardContent>
    </Card>
  );
}
