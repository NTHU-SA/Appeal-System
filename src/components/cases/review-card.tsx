import { approveReview } from "@/lib/actions";
import type { ReviewRequest } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const reviewStatusLabels: Record<ReviewRequest["status"], string> = {
  pending: "待審核",
  approved: "已核准",
  rejected: "已退回",
};

export function ReviewCard({
  review,
  canApprove,
}: {
  review: ReviewRequest;
  canApprove: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          審核請求：{review.decision === "accepted" ? "受理" : "不受理"}
        </CardTitle>
        <CardDescription className="text-caption text-text-tertiary">
          {formatDateTime(review.created_at)} · {reviewStatusLabels[review.status] ?? review.status}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {canApprove && review.status === "pending" ? (
          <form action={approveReview} className="flex flex-col gap-3">
            <input type="hidden" name="reviewId" value={review.id} />
            <Textarea
              name="html"
              defaultValue={review.body_html}
              rows={8}
              aria-label="回覆內容"
            />
            <Button className="self-end">核准並寄送給使用者</Button>
          </form>
        ) : (
          <div
            className="rich-text rounded-sm bg-surface-sunken p-3"
            dangerouslySetInnerHTML={{ __html: review.body_html }}
          />
        )}
      </CardContent>
    </Card>
  );
}
