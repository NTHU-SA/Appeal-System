import { notFound } from "next/navigation";
import { ExternalLink, FileText, ImageIcon } from "lucide-react";

import { getCaseByToken } from "@/lib/data";
import { statusLabels } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { StudentMessageForm } from "@/components/cases/student-message-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function CaseStatusPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  let data = null;
  try {
    data = await getCaseByToken(token);
  } catch {
    data = null;
  }

  if (!data) notFound();

  const { case: caseRow, messages, attachments } = data;

  return (
    <main className="mx-auto min-h-dvh w-full max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          國立清華大學學生會 · 學生申訴協力系統
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-mono text-2xl font-bold tracking-tight sm:text-3xl">
              {caseRow.public_id}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              送件時間：{formatDateTime(caseRow.created_at)}
            </p>
          </div>
          <Badge
            variant={
              caseRow.status === "in_progress"
                ? "default"
                : caseRow.status === "closed"
                  ? "secondary"
                  : caseRow.status === "rejected"
                    ? "destructive"
                    : "outline"
            }
            className="w-fit text-sm px-3 py-1 font-semibold"
          >
            {statusLabels[caseRow.status]}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg">案件內容摘要</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <Info label="申訴人" value={caseRow.student_name} />
              <Info label="年級" value={caseRow.student_department} />
            </div>
            <Info label="申訴種類" value={caseRow.category} />
            <Separator />
            <Info label="申訴問題" value={caseRow.subject} multiline />
            <Separator />
            <Info label="希望得到的處理方式" value={caseRow.desired_outcome} multiline />
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg">補充說明與檔案補件</CardTitle>
          </CardHeader>
          <CardContent>
            <StudentMessageForm token={token} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg">案件紀錄與歷史回覆</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {messages.map((message) => {
              const isStudent = message.author_type === "student";
              return (
                <div
                  key={message.id}
                  className={`rounded-lg border p-4 transition ${
                    isStudent
                      ? "border-primary/20 bg-primary/5"
                      : "border-muted bg-card shadow-2xs"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                    <span className="font-semibold text-foreground">
                      {isStudent ? "🧑‍🎓 學生回覆 / 補充" : "🏛️ 學權組織 / 幹部回覆"}
                    </span>
                    <time className="text-muted-foreground">{formatDateTime(message.created_at)}</time>
                  </div>
                  {message.body_html ? (
                    <div
                      className="prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: message.body_html }}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                      {message.body_text}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {attachments.length ? (
            <div className="space-y-3 pt-2">
              <h2 className="text-sm font-semibold text-foreground">
                📁 案件佐證附件 ({attachments.length})
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.drive_url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-2 rounded-lg border bg-card p-3 text-sm transition hover:border-primary/40 hover:bg-muted/40"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {attachment.file_type?.startsWith("image/") ? (
                        <ImageIcon className="h-4 w-4 shrink-0 text-blue-500" />
                      ) : (
                        <FileText className="h-4 w-4 shrink-0 text-amber-500" />
                      )}
                      <span className="truncate font-medium">{attachment.file_name}</span>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}

function Info({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`text-foreground ${multiline ? "whitespace-pre-wrap leading-6" : "font-medium"}`}>
        {value || "無"}
      </p>
    </div>
  );
}
