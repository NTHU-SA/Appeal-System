import { FileText } from "lucide-react";

import { requireStaff } from "@/lib/auth";
import { getAdminCase } from "@/lib/data";
import { roleLabels, statusLabels } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { RichReplyEditor } from "@/components/editor/rich-reply-editor";
import { AppShell } from "@/components/layout/app-shell";
import { ReviewCard } from "@/components/cases/review-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function AdminCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const staff = await requireStaff();
  const { id } = await params;
  const data = await getAdminCase(id);
  const ownDraft = data.drafts.find((draft) => draft.author_id === staff.id);

  return (
    <AppShell staff={staff}>
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-sm text-muted-foreground">
              {data.case.public_id}
            </p>
            <h2 className="text-2xl font-semibold">{data.case.subject}</h2>
          </div>
          <Badge className="w-fit">{statusLabels[data.case.status]}</Badge>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardHeader>
              <CardTitle>案件資料</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <Info label="姓名" value={data.case.student_name} />
              <Info label="Email" value={data.case.student_email} />
              <Info label="年級" value={data.case.student_department} />
              <Info label="申訴種類" value={data.case.category} />
              <Separator />
              <Info label="希望處理方式" value={data.case.desired_outcome} multiline />
              <Info
                label="指派"
                value={data.case.assigned_to ? "已指派" : "尚未指派"}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>撰寫回覆</CardTitle>
            </CardHeader>
            <CardContent>
              <RichReplyEditor
                caseId={data.case.id}
                initialHtml={ownDraft?.body_html || ""}
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>來回紀錄</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.messages.map((message) => (
                <div key={message.id} className="rounded-md border p-3">
                  <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {message.author_type === "student"
                        ? "學生"
                        : roleLabels[message.author_type as "member" | "minister"]}
                    </span>
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
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>附件</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.attachments.map((attachment) => (
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
                {!data.attachments.length ? (
                  <p className="text-sm text-muted-foreground">沒有附件</p>
                ) : null}
              </CardContent>
            </Card>

            {data.reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                canApprove={staff.role === "minister"}
              />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
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
