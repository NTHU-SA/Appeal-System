import { notFound } from "next/navigation";
import { FileText } from "lucide-react";

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
    <main className="mx-auto min-h-dvh w-full max-w-4xl px-4 py-6">
      <div className="mb-6 space-y-2">
        <p className="text-sm text-muted-foreground">案件編號</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-mono text-2xl font-semibold">{caseRow.public_id}</h1>
          <Badge className="w-fit">{statusLabels[caseRow.status]}</Badge>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>案件內容</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <Info label="姓名" value={caseRow.student_name} />
            <Info label="系級" value={caseRow.student_department} />
            <Info label="申訴種類" value={caseRow.category} />
            <Separator />
            <Info label="申訴問題" value={caseRow.subject} multiline />
            <Info label="希望得到的處理方式" value={caseRow.desired_outcome} multiline />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>補充資料</CardTitle>
          </CardHeader>
          <CardContent>
            <StudentMessageForm token={token} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>案件紀錄</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="rounded-md border p-3">
              <div className="mb-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>{message.author_type === "student" ? "學生" : "學權組織"}</span>
                <time>{formatDateTime(message.created_at)}</time>
              </div>
              {message.body_html ? (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: message.body_html }}
                />
              ) : (
                <p className="whitespace-pre-wrap text-sm">{message.body_text}</p>
              )}
            </div>
          ))}

          {attachments.length ? (
            <div className="space-y-2">
              <h2 className="text-sm font-medium">附件</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.drive_url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-md border p-3 text-sm hover:bg-muted"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{attachment.file_name}</span>
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
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      <p className={multiline ? "whitespace-pre-wrap leading-6" : ""}>{value}</p>
    </div>
  );
}
