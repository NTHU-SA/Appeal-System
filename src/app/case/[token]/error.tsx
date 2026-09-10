"use client";

import { startTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function CaseError({ reset }: { reset: () => void }) {
  const router = useRouter();
  return <main className="mx-auto w-full max-w-4xl flex-1 space-y-4 px-4 py-12">
    <h1 className="text-xl font-semibold">暫時無法載入案件</h1>
    <p className="text-sm text-muted-foreground">案件服務忙碌中，請稍後再試。</p>
    <Button onClick={() => startTransition(() => { router.refresh(); reset(); })}>重新載入</Button>
  </main>;
}
