"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";

import { removeMember, upsertMember } from "@/lib/actions";
import type { StaffMember } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Notice } from "@/components/ui/notice";
import { Spinner } from "@/components/ui/spinner";

// Row menu: switch role, or remove after a confirmation dialog.
export function MemberRowActions({ member, isSelf }: { member: StaffMember; isSelf: boolean }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const nextRole = member.role === "minister" ? "member" : "minister";

  const changeRole = () => {
    const formData = new FormData();
    formData.set("email", member.email);
    formData.set("role", nextRole);
    startTransition(async () => {
      await upsertMember(formData);
      toast.success(`已將 ${member.email} 改為${nextRole === "minister" ? "部長" : "部員"}`);
    });
  };

  const remove = () => {
    const formData = new FormData();
    formData.set("id", member.id);
    startTransition(async () => {
      await removeMember(formData);
      setConfirming(false);
      toast.success(`已移除 ${member.email}`);
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`${member.email} 的操作`} disabled={pending}>
            {pending ? <Spinner /> : <MoreHorizontal />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={changeRole} disabled={isSelf}>
            {nextRole === "minister" ? <ShieldCheck /> : <UserRound />}
            改為{nextRole === "minister" ? "部長" : "部員"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" disabled={isSelf} onSelect={() => setConfirming(true)}>
            <Trash2 />
            移除成員
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>移除成員</AlertDialogTitle>
            <AlertDialogDescription className="break-all">{member.email}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Notice tone="warning">
              移除後這個帳號將無法登入後台；已寫好的回覆與審核紀錄會保留。
            </Notice>
          </AlertDialogBody>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>取消</AlertDialogCancel>
            <Button variant="danger" onClick={remove} disabled={pending}>
              {pending ? <Spinner /> : <Trash2 />}
              移除成員
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
