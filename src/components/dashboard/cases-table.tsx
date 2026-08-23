import Link from "next/link";

import { statusLabels, type CaseRecord } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function CasesTable({ cases }: { cases: CaseRecord[] }) {
  return (
    <div className="overflow-hidden rounded-md border">
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
                  className="font-mono text-sm font-medium hover:underline"
                >
                  {item.public_id}
                </Link>
                <p className="mt-1 line-clamp-1 max-w-[20rem] text-xs text-muted-foreground">
                  {item.subject}
                </p>
              </TableCell>
              <TableCell>
                <p className="font-medium">{item.student_name}</p>
                <p className="text-xs text-muted-foreground">{item.student_department}</p>
              </TableCell>
              <TableCell className="hidden md:table-cell">{item.category}</TableCell>
              <TableCell>
                <Badge variant={item.status === "pending" ? "default" : "secondary"}>
                  {statusLabels[item.status]}
                </Badge>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {formatDate(item.created_at)}
              </TableCell>
            </TableRow>
          ))}
          {!cases.length ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                沒有符合條件的案件
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
