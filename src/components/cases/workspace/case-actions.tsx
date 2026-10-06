"use client";

import { Copy, Mail, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

async function copy(text: string, done: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(done);
  } catch {
    toast.error("無法存取剪貼簿，請手動選取複製");
  }
}

// Detail header actions: email the student, plus a menu of copy actions.
export function CaseActions({ publicId, email }: { publicId: string; email: string }) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button asChild variant="secondary">
        <a href={`mailto:${email}?subject=${encodeURIComponent(`[${publicId}] 學生申訴案件`)}`}>
          <Mail />
          <span className="hidden sm:inline">寄信給學生</span>
        </a>
      </Button>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" aria-label="更多操作">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>更多操作</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => copy(publicId, `已複製案件編號 ${publicId}`)}>
            <Copy />
            複製案件編號
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => copy(email, "已複製學生 email")}>
            <Copy />
            複製學生 email
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
