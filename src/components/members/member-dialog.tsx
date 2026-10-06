"use client";

import { useState, useTransition } from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

import { upsertMember } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldHint } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control";
import { Spinner } from "@/components/ui/spinner";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function emailError(value: string) {
  if (!value.trim()) return "請輸入要加入的 Google 帳號 email。";
  if (!value.includes("@")) return "缺少 @，例如 name@gapp.nthu.edu.tw。";
  if (!EMAIL_PATTERN.test(value.trim())) return "缺少網域結尾，例如 .edu.tw 或 .com。";
  return "";
}

// "新增成員" dialog: 512px, title and subtitle in the header, actions
// right-aligned in the footer.
export function MemberDialog() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "minister">("member");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = emailError(email);
    setError(message);
    if (message) return;
    const formData = new FormData();
    formData.set("email", email.trim());
    formData.set("role", role);
    startTransition(async () => {
      await upsertMember(formData);
      toast.success(`已將 ${email.trim()} 加入為${role === "minister" ? "部長" : "部員"}`);
      setOpen(false);
      setEmail("");
      setRole("member");
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError("");
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <UserPlus />
          新增成員
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={submit} noValidate>
          <DialogHeader>
            <DialogTitle>新增成員</DialogTitle>
            <DialogDescription>成員以 Google 帳號登入後台。</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Field>
              <Label htmlFor="member-email">Google 帳號 email</Label>
              <Input
                id="member-email"
                type="email"
                autoComplete="off"
                placeholder="name@gapp.nthu.edu.tw"
                value={email}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "member-email-error" : undefined}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (error) setError(emailError(event.target.value));
                }}
              />
              <FieldError id="member-email-error">{error}</FieldError>
            </Field>
            <Field>
              <span id="member-role" className="text-label-md text-text-primary">角色</span>
              <SegmentedControl
                fullWidth
                aria-labelledby="member-role"
                value={role}
                onValueChange={(value) => setRole(value as "member" | "minister")}
              >
                <SegmentedControlItem value="member">部員</SegmentedControlItem>
                <SegmentedControlItem value="minister">部長</SegmentedControlItem>
              </SegmentedControl>
              <FieldHint>
                {role === "minister" ? "部長可以管理成員，並核准回覆寄給學生。" : "部員可以處理案件、撰寫回覆並送交審核。"}
              </FieldHint>
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? <Spinner /> : null}
              加入成員
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
