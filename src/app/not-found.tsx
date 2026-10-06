import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Wordmark } from "@/components/layout/wordmark";

// Unknown URLs render under the root layout only, so this page carries its
// own minimal navigation bar.
export default function NotFound() {
  return (
    <>
      <header className="border-b bg-surface">
        <div className="flex items-center px-6 py-3 lg:px-10">
          <Wordmark />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <EmptyState
          icon={Compass}
          title="找不到這個頁面"
          titleAs="h1"
          description="網址可能打錯了，或頁面已經移除。"
          action={
            <Button asChild>
              <Link href="/">回到申訴首頁</Link>
            </Button>
          }
        />
      </main>
    </>
  );
}
