import { MousePointerClick } from "lucide-react";

import type { CaseSearchParams } from "@/lib/case-filters";
import { CasesWorkspace } from "@/components/cases/workspace/cases-workspace";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "案件 · 學生申訴協力系統" };

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<CaseSearchParams>;
}) {
  return (
    <CasesWorkspace params={await searchParams}>
      <div className="flex flex-1 items-center justify-center p-6">
        <EmptyState
          icon={MousePointerClick}
          title="選擇一個案件"
          description="從清單選擇案件，查看申訴內容、對話紀錄並撰寫回覆。"
        />
      </div>
    </CasesWorkspace>
  );
}
