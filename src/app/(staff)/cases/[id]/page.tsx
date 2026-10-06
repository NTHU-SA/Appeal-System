import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageSquare, Paperclip, User, UserCheck } from "lucide-react";

import { requireStaff } from "@/lib/auth";
import { caseFiltersQuery, type CaseSearchParams } from "@/lib/case-filters";
import { getAdminCase } from "@/lib/data";
import { roleLabels } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { AttachmentList } from "@/components/cases/attachment-list";
import { CaseField } from "@/components/cases/case-field";
import { CaseStatusIndicator, CategoryBadge } from "@/components/cases/case-status";
import { MessageList } from "@/components/cases/message-list";
import { ReviewCard } from "@/components/cases/review-card";
import { CaseActions } from "@/components/cases/workspace/case-actions";
import { CasesWorkspace } from "@/components/cases/workspace/cases-workspace";
import { RichReplyEditor } from "@/components/editor/rich-reply-editor";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function TabCount({ value }: { value: number }) {
  return <span className="text-caption text-text-tertiary tabular-nums">{value}</span>;
}

export default async function AdminCasePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<CaseSearchParams>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [staff, data] = await Promise.all([requireStaff(), getAdminCase(id)]);
  if (!data) notFound();

  const caseRow = data.case;
  const ownDraft = data.drafts.find((draft) => draft.author_id === staff.id);
  const pendingReviews = data.reviews.filter((review) => review.status === "pending");
  const pastReviews = data.reviews.filter((review) => review.status !== "pending");
  const canApprove = staff.role === "minister";

  return (
    <CasesWorkspace params={query} selectedId={id}>
      <Tabs defaultValue="reply" className="flex min-h-0 flex-1 flex-col gap-0">
        {/* Sticky detail header: title, meta, actions and the tab row. */}
        <header className="shrink-0 border-b px-6 pt-4 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2 text-caption text-text-tertiary">
              <Link
                href={`/cases${caseFiltersQuery(query)}`}
                className="-ml-1 flex shrink-0 items-center gap-1 rounded-sm px-1 whitespace-nowrap transition-colors hover:text-text-primary md:hidden"
              >
                <ArrowLeft className="size-3.5" />
                案件列表
              </Link>
              <span className="md:hidden" aria-hidden="true">/</span>
              <span className="shrink-0 whitespace-nowrap tabular-nums">{caseRow.public_id}</span>
              <span className="hidden sm:inline" aria-hidden="true">·</span>
              <span className="hidden truncate sm:inline">
                送件 {formatDateTime(caseRow.created_at, { dateStyle: "medium", timeStyle: "short" })}
              </span>
            </div>
            <CaseActions publicId={caseRow.public_id} email={caseRow.student_email} />
          </div>

          <h1 className="mt-2 line-clamp-2 text-headline-md text-text-primary" title={caseRow.subject}>
            {caseRow.subject}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-body-sm text-text-tertiary">
            <CaseStatusIndicator status={caseRow.status} />
            <CategoryBadge category={caseRow.category} />
            <span className="flex items-center gap-1.5">
              <User aria-hidden="true" className="size-3.5" />
              {caseRow.student_name} · {caseRow.student_department}
            </span>
            <span className="flex items-center gap-1.5">
              <UserCheck aria-hidden="true" className="size-3.5" />
              {caseRow.assigned_to ? "已指派" : "尚未指派"}
            </span>
          </div>

          {/* -mb-px lets the selection line sit on the header's border. */}
          <div className="-mx-3 mt-3 -mb-px flex">
            <TabsList variant="line" className="max-w-full overflow-x-auto [scrollbar-width:none]">
              <TabsTrigger value="reply">
                回覆
                {pendingReviews.length ? <TabCount value={pendingReviews.length} /> : null}
              </TabsTrigger>
              <TabsTrigger value="messages">
                對話紀錄
                <TabCount value={data.messages.length} />
              </TabsTrigger>
              <TabsTrigger value="details">案件資料</TabsTrigger>
              <TabsTrigger value="attachments">
                附件
                <TabCount value={data.attachments.length} />
              </TabsTrigger>
            </TabsList>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Kept mounted so switching tabs never drops an unsaved draft. */}
          <TabsContent value="reply" forceMount className="px-6 py-6 data-[state=inactive]:hidden lg:px-8">
            <div className="flex max-w-3xl flex-col gap-8">
              {pendingReviews.length ? (
                <section aria-labelledby="pending-reviews" className="flex flex-col gap-3">
                  <h2 id="pending-reviews" className="text-title-md text-text-primary">待審核的回覆</h2>
                  {pendingReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} canApprove={canApprove} />
                  ))}
                </section>
              ) : null}

              <section aria-labelledby="compose-heading" className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <h2 id="compose-heading" className="text-title-md text-text-primary">撰寫回覆</h2>
                  <p className="text-body-sm text-text-tertiary">
                    送出後由部長審核，核准後才會寄給學生。
                  </p>
                </div>
                <RichReplyEditor caseId={caseRow.id} initialHtml={ownDraft?.body_html || ""} />
              </section>

              {pastReviews.length ? (
                <section aria-labelledby="past-reviews" className="flex flex-col gap-3">
                  <h2 id="past-reviews" className="text-title-md text-text-primary">審核紀錄</h2>
                  {pastReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} canApprove={false} />
                  ))}
                </section>
              ) : null}
            </div>
          </TabsContent>

          <TabsContent value="messages" className="px-6 py-6 lg:px-8">
            <div className="max-w-3xl">
              {data.messages.length ? (
                <MessageList
                  messages={data.messages}
                  attachments={data.attachments}
                  authorLabel={(message) =>
                    message.author_type === "student"
                      ? { name: caseRow.student_name, initial: caseRow.student_name.slice(0, 1), role: "學生" }
                      : {
                          name: (message.author_email || message.author_id || "學權幹部").split("@")[0],
                          initial: (message.author_email || message.author_id || "幹").slice(0, 1).toUpperCase(),
                          role: roleLabels[message.author_type as "member" | "minister"] ?? "系統",
                        }
                  }
                />
              ) : (
                <EmptyState
                  icon={MessageSquare}
                  title="尚無對話紀錄"
                  description="核准的回覆與學生的補充留言會依時間顯示在這裡。"
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="details" className="px-6 py-6 lg:px-8">
            <dl className="grid max-w-3xl gap-x-8 gap-y-5 sm:grid-cols-2">
              <CaseField label="姓名" value={caseRow.student_name} />
              <CaseField label="年級" value={caseRow.student_department} />
              <CaseField label="Email">
                <a href={`mailto:${caseRow.student_email}`} className="rounded-sm text-primary-text underline-offset-4 hover:underline">
                  {caseRow.student_email}
                </a>
              </CaseField>
              <CaseField label="申訴種類">
                <CategoryBadge category={caseRow.category} />
              </CaseField>
              <CaseField label="送件時間" value={formatDateTime(caseRow.created_at)} />
              <CaseField label="指派" value={caseRow.assigned_to ? "已指派" : "尚未指派"} />
              <CaseField label="申訴問題" value={caseRow.subject} multiline className="border-t pt-5 sm:col-span-2" />
              <CaseField label="希望得到的處理方式" value={caseRow.desired_outcome} multiline className="sm:col-span-2" />
            </dl>
          </TabsContent>

          <TabsContent value="attachments" className="px-6 py-6 lg:px-8">
            <div className="max-w-3xl">
              {data.attachments.length ? (
                <AttachmentList attachments={data.attachments} />
              ) : (
                <EmptyState icon={Paperclip} title="沒有附件" description="學生送件或補件時上傳的檔案會出現在這裡。" />
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </CasesWorkspace>
  );
}
