import { requireStaff } from "@/lib/auth";
import { getAdminCase } from "@/lib/data";
import { roleLabels } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { RichReplyEditor } from "@/components/editor/rich-reply-editor";
import { AppShell } from "@/components/layout/app-shell";
import { AttachmentList } from "@/components/cases/attachment-list";
import { CaseField } from "@/components/cases/case-field";
import { CaseStatusBadge } from "@/components/cases/case-status-badge";
import { ReviewCard } from "@/components/cases/review-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const staffPromise = requireStaff();
  const casePromise = params.then(({ id }) => getAdminCase(id));
  const [staff, data] = await Promise.all([staffPromise, casePromise]);
  const ownDraft = data.drafts.find((draft) => draft.author_id === staff.id);

  return (
    <AppShell staff={staff}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-caption tabular-nums text-text-tertiary">
              {data.case.public_id}
            </p>
            {/* The full complaint is listed under 案件資料. */}
            <h1
              className="line-clamp-2 text-headline-md text-text-primary"
              title={data.case.subject}
            >
              {data.case.subject}
            </h1>
          </div>
          <CaseStatusBadge status={data.case.status} />
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardHeader>
              <CardTitle>案件資料</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="flex flex-col gap-4">
                <CaseField label="姓名" value={data.case.student_name} />
                <CaseField label="Email" value={data.case.student_email} />
                <CaseField label="年級" value={data.case.student_department} />
                <CaseField label="申訴種類" value={data.case.category} />
                <CaseField
                  label="申訴問題"
                  value={data.case.subject}
                  multiline
                  className="border-t pt-4"
                />
                <CaseField label="希望處理方式" value={data.case.desired_outcome} multiline />
                <CaseField
                  label="指派"
                  value={data.case.assigned_to ? "已指派" : "尚未指派"}
                />
              </dl>
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

        <div className="grid items-start gap-4 lg:grid-cols-[1fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>來回紀錄</CardTitle>
            </CardHeader>
            <CardContent>
              {data.messages.length ? (
                <ol className="flex flex-col divide-y">
                  {data.messages.map((message) => (
                    <li key={message.id} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-label-md text-text-primary">
                          {message.author_type === "student"
                            ? "學生"
                            : roleLabels[message.author_type as "member" | "minister"]}
                        </span>
                        <time className="text-caption text-text-tertiary">
                          {formatDateTime(message.created_at)}
                        </time>
                      </div>
                      {message.body_html ? (
                        <div
                          className="rich-text"
                          dangerouslySetInnerHTML={{ __html: message.body_html }}
                        />
                      ) : (
                        <p className="whitespace-pre-wrap text-text-secondary">{message.body_text}</p>
                      )}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-text-tertiary">尚無來回紀錄</p>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>附件</CardTitle>
              </CardHeader>
              <CardContent>
                {data.attachments.length ? (
                  <AttachmentList attachments={data.attachments} />
                ) : (
                  <p className="text-text-tertiary">沒有附件</p>
                )}
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
