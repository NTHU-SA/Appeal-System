"use client";

import { LogOut } from "lucide-react";

import type { StaffSession } from "@/lib/auth";
import { roleLabels } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Signed-in staff: initial avatar opening email, role and sign-out.
export function AccountMenu({
  staff,
  signOutAction,
}: {
  staff: StaffSession;
  signOutAction: (formData: FormData) => Promise<void>;
}) {
  return (
    <>
      <form id="sign-out-form" action={signOutAction} className="hidden" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`帳號：${staff.email}`}>
            <Avatar size="sm">
              <AvatarFallback>{staff.email.slice(0, 1).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <div className="flex flex-col gap-1 px-3 pt-2 pb-2">
            <span className="truncate text-label-md text-text-primary">{staff.email}</span>
            <span className="text-caption text-text-tertiary">{roleLabels[staff.role]}</span>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="sr-only">帳號操作</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <button type="submit" form="sign-out-form" className="w-full">
              <LogOut />
              登出
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
