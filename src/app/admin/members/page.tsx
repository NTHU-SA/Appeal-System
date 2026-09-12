import { Trash2 } from "lucide-react";

import { requireMinister } from "@/lib/auth";
import { removeMember, upsertMember } from "@/lib/actions";
import { getMembers } from "@/lib/data";
import { roleLabels } from "@/lib/types";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="grid gap-4 lg:grid-cols-[24rem_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>新增部員</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={upsertMember} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label>角色</Label>
                <Select name="role" defaultValue="member">
                  <SelectTrigger>
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

        <Card>
          <CardHeader>
            <CardTitle>成員列表</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead className="w-20" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id || member.email}>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{roleLabels[member.role as "minister" | "member"]}</TableCell>
                      <TableCell>
                        {member.id ? (
                          <form action={removeMember}>
                            <input type="hidden" name="id" value={member.id} />
                            <Button variant="ghost" size="icon" aria-label="移除部員">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </form>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!members.length ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                        尚未建立成員
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
