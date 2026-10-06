import Link from "next/link";
import { SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function CaseNotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <EmptyState
        icon={SearchX}
        title="找不到這個案件"
        titleAs="h1"
        description="連結可能不完整或已失效。請從確認信重新開啟專屬連結，或重新送出申訴。"
        action={
          <Button asChild variant="secondary">
            <Link href="/">回到申訴首頁</Link>
          </Button>
        }
      />
    </main>
  );
}
