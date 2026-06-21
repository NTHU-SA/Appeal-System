import { approveReview } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function ReviewCard({
  review,
  canApprove,
}: {
  review: {
    id: string;
    decision: string;
    status: string;
    body_html: string;
    created_at: string;
  };
  canApprove: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          審核請求：{review.decision === "accepted" ? "受理" : "不受理"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          {new Date(review.created_at).toLocaleString("zh-TW")} · {review.status}
        </p>
        {canApprove && review.status === "pending" ? (
          <form action={approveReview} className="space-y-3">
            <input type="hidden" name="reviewId" value={review.id} />
            <Textarea name="html" defaultValue={review.body_html} rows={8} />
            <Button>核准並寄送給使用者</Button>
          </form>
        ) : (
          <div
            className="prose prose-sm max-w-none rounded-md border p-3"
            dangerouslySetInnerHTML={{ __html: review.body_html }}
          />
        )}
      </CardContent>
    </Card>
  );
}
