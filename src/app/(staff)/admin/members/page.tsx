import { Users } from "lucide-react";

import { requireMinister } from "@/lib/auth";
import { roleTone } from "@/lib/case-display";
import { getMembers } from "@/lib/data";
import { roleLabels } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { MemberDialog } from "@/components/members/member-dialog";
import { MemberRowActions } from "@/components/members/member-row-actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = { title: "成員 · 學生申訴協力系統" };

export default async function MembersPage() {
  const [staff, members] = await Promise.all([requireMinister(), getMembers()]);
  const ministers = members.filter((member) => member.role === "minister").length;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-6 lg:px-10 lg:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-headline-md text-text-primary">成員</h1>
            <p className="text-body-md text-text-secondary">管理可以登入後台的部長與部員帳號。</p>
          </div>
          <MemberDialog />
        </div>

        <Notice>
          部長可以管理成員並核准回覆；部員可以處理案件、撰寫回覆並送交審核。成員名單同步自 Google Sheet 的 Members 工作表。
        </Notice>

        <section aria-labelledby="members-heading" className="overflow-hidden rounded-lg border">
          <div className="flex items-baseline justify-between gap-4 px-4 py-3">
            <h2 id="members-heading" className="title-features text-title-sm text-text-primary">成員列表</h2>
            <span className="text-caption text-text-tertiary tabular-nums">
              {members.length} 位成員 · {ministers} 位部長
            </span>
          </div>
          <div className="border-t">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>帳號</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead className="hidden sm:table-cell">加入時間</TableHead>
                  <TableHead className="w-12">
                    <span className="sr-only">操作</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => {
                  const isSelf = member.email.toLowerCase() === staff.email.toLowerCase();
                  return (
                    <TableRow key={member.id || member.email} className="hover:bg-surface-hover">
                      <TableCell>
                        <span className="flex items-center gap-3">
                          <Avatar size="sm">
                            <AvatarFallback>{member.email.slice(0, 1).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="truncate text-text-primary">{member.email}</span>
                          {isSelf ? <span className="text-caption text-text-tertiary">（你）</span> : null}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge tone={roleTone[member.role]}>{roleLabels[member.role]}</Badge>
                      </TableCell>
                      <TableCell className="hidden text-text-tertiary tabular-nums sm:table-cell">
                        {member.created_at ? formatDate(member.created_at) : "—"}
                      </TableCell>
                      <TableCell className="py-1 text-right">
                        {member.id ? <MemberRowActions member={member} isSelf={isSelf} /> : null}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!members.length ? (
                  <TableRow>
                    <TableCell colSpan={4} className="whitespace-normal">
                      <EmptyState
                        icon={Users}
                        title="尚未建立成員"
                        description="用「新增成員」加入第一位部員或部長。"
                      />
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
    </div>
  );
}
