import { Trash2, Users } from "lucide-react";

import { requireMinister } from "@/lib/auth";
import { removeMember, upsertMember } from "@/lib/actions";
import { getMembers } from "@/lib/data";
import { roleLabels } from "@/lib/types";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function MembersPage() {
  const [staff, members] = await Promise.all([
    requireMinister(),
    getMembers(),
  ]);

  return (
    <AppShell staff={staff}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-headline-md text-text-primary">成員</h1>
          <p className="text-body-md text-text-secondary">
            管理可登入後台的部長與部員帳號。
          </p>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[24rem_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>新增部員</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={upsertMember} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="role">角色</Label>
                  <Select name="role" defaultValue="member">
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">部員</SelectItem>
                      <SelectItem value="minister">部長</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full">儲存成員</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="pb-0">
            <CardHeader>
              <CardTitle>成員列表</CardTitle>
            </CardHeader>
            <div className="border-t">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead className="w-12">
                      <span className="sr-only">操作</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id || member.email}>
                      <TableCell className="text-text-primary">{member.email}</TableCell>
                      <TableCell>{roleLabels[member.role as "minister" | "member"]}</TableCell>
                      <TableCell className="py-1 text-right">
                        {member.id ? (
                          <form action={removeMember}>
                            <input type="hidden" name="id" value={member.id} />
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`移除 ${member.email}`}
                              className="hover:text-danger-text active:text-danger-text"
                            >
                              <Trash2 />
                            </Button>
                          </form>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!members.length ? (
                    <TableRow>
                      <TableCell colSpan={3} className="whitespace-normal">
                        <EmptyState icon={Users} title="尚未建立成員" />
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
