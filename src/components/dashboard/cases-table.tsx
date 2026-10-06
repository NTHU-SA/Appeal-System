import Link from "next/link";
import { Inbox } from "lucide-react";

import type { CaseRecord } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { CaseStatusBadge } from "@/components/cases/case-status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Rendered flush inside its card: the top border separates it from the title.
export function CasesTable({ cases }: { cases: CaseRecord[] }) {
  return (
    <div className="border-t">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>案件</TableHead>
            <TableHead>申訴人</TableHead>
            <TableHead className="hidden md:table-cell">種類</TableHead>
            <TableHead>狀態</TableHead>
            <TableHead className="hidden lg:table-cell">建立時間</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Link
                  href={`/cases/${item.id}`}
                  className="rounded-sm text-label-md tabular-nums text-primary-text underline-offset-4 hover:underline"
                >
                  {item.public_id}
                </Link>
                <p
                  className="mt-1 max-w-80 truncate text-caption text-text-tertiary"
                  title={item.subject}
                >
                  {item.subject}
                </p>
              </TableCell>
              <TableCell>
                <p className="text-text-primary">{item.student_name}</p>
                <p className="text-caption text-text-tertiary">{item.student_department}</p>
              </TableCell>
              <TableCell className="hidden md:table-cell">{item.category}</TableCell>
              <TableCell>
                <CaseStatusBadge status={item.status} />
              </TableCell>
              <TableCell className="hidden tabular-nums text-text-tertiary lg:table-cell">
                {formatDate(item.created_at)}
              </TableCell>
            </TableRow>
          ))}
          {!cases.length ? (
            <TableRow>
              <TableCell colSpan={5} className="whitespace-normal">
                <EmptyState
                  icon={Inbox}
                  title="沒有符合條件的案件"
                  description="調整期間或搜尋關鍵字後再試一次。"
                />
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
