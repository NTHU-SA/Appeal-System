"use client";

import { startTransition } from "react";
import { useRouter } from "next/navigation";
import { CloudOff, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function CaseError({ reset }: { reset: () => void }) {
  const router = useRouter();
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <EmptyState
        icon={CloudOff}
        title="暫時無法載入案件"
        titleAs="h1"
        description="案件服務目前忙碌中，你的資料沒有遺失。請稍後再重新載入一次。"
        action={
          <Button onClick={() => startTransition(() => { router.refresh(); reset(); })}>
            <RotateCw />
            重新載入
          </Button>
        }
      />
    </main>
  );
}
