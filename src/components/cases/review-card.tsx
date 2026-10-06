import { Check } from "lucide-react";

import { approveReview } from "@/lib/actions";
import { reviewDecisionLabels, reviewStatusLabels, reviewStatusTone } from "@/lib/case-display";
import type { ReviewRequest } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { InlineStatus } from "@/components/ui/status";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";

// A reply waiting for (or past) the minister's review. Ministers can edit
// and approve a pending one; everyone else reads it.
export function ReviewCard({
  review,
  canApprove,
}: {
  review: ReviewRequest;
  canApprove: boolean;
}) {
  const editable = canApprove && review.status === "pending";
  return (
    <article className="rounded-lg border">
      <header className="flex items-start justify-between gap-3 border-b px-4 py-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="title-features text-title-sm text-text-primary">
            回覆審核 · {reviewDecisionLabels[review.decision]}
          </h3>
          <p className="truncate text-caption text-text-tertiary">
            {review.requested_by_email} 送出於{" "}
            {formatDateTime(review.created_at, { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
        <InlineStatus tone={reviewStatusTone[review.status]} label={reviewStatusLabels[review.status]} />
      </header>
      <div className="p-4">
        {editable ? (
          <form action={approveReview} className="flex flex-col gap-3">
            <input type="hidden" name="reviewId" value={review.id} />
            <Textarea
              name="html"
              defaultValue={review.body_html}
              rows={6}
              aria-label="回覆內容（HTML）"
              className="font-mono text-body-sm"
            />
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-caption text-text-tertiary">核准後會立即寄給學生，並加入對話紀錄。</p>
              <SubmitButton icon={<Check />} pendingLabel="寄送中…">
                核准並寄送
              </SubmitButton>
            </div>
          </form>
        ) : (
          <div
            className="rich-text rounded-lg bg-surface-sunken px-3 py-2.5 text-body-sm"
            dangerouslySetInnerHTML={{ __html: review.body_html }}
          />
        )}
      </div>
    </article>
  );
}
