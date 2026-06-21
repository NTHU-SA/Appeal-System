"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, CheckCircle2, Upload } from "lucide-react";

import { submitCase, type ActionState } from "@/lib/actions";
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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const initialState: ActionState = {
  ok: false,
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="h-11 w-full sm:w-auto" disabled={pending}>
      {pending ? "送件中..." : "送出申訴"}
      <ArrowRight className="h-4 w-4" />
    </Button>
  );
}

export function SubmissionForm() {
  const [state, action] = useActionState(submitCase, initialState);

  if (state.ok && state.token) {
    return (
      <Card className="border-primary/40 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            案件已建立
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{state.message}</p>
          <div className="rounded-md border bg-muted/40 p-3 font-mono text-sm">
            {state.caseId}
          </div>
          <Button asChild>
            <Link href={`/case/${state.token}`}>前往案件狀態頁</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form action={action} className="space-y-5">
      {state.message ? (
        <Alert variant={state.ok ? "default" : "destructive"}>
          <AlertTitle>{state.ok ? "已送出" : "送件失敗"}</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">電子郵件</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">系級</Label>
          <Input id="department" name="department" required />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">姓名</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-2">
          <Label>申訴種類</Label>
          <Select name="category" required>
            <SelectTrigger>
              <SelectValue placeholder="選擇種類" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="課務與教學">課務與教學</SelectItem>
              <SelectItem value="宿舍與生活">宿舍與生活</SelectItem>
              <SelectItem value="行政程序">行政程序</SelectItem>
              <SelectItem value="校園安全">校園安全</SelectItem>
              <SelectItem value="其他">其他</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">申訴問題</Label>
        <Textarea
          id="subject"
          name="subject"
          required
          rows={7}
          placeholder="請描述事件、時間、相關單位與目前遇到的困難。"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="desiredOutcome">希望得到的處理方式</Label>
        <Textarea
          id="desiredOutcome"
          name="desiredOutcome"
          required
          rows={4}
          placeholder="例如協助轉介、釐清規則、正式申訴、與單位溝通等。"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="attachments">上傳檔案</Label>
        <div className="flex items-center gap-3 rounded-md border bg-background px-3 py-2">
          <Upload className="h-4 w-4 text-muted-foreground" />
          <Input
            id="attachments"
            name="attachments"
            type="file"
            multiple
            className="border-0 p-0 shadow-none file:mr-3"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          支援 PDF、Word、PNG、JPG，可複選，每個檔案上限 12MB。
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-muted-foreground">
          送出後系統會寄出案件內容與專屬查詢連結。請保存該連結以查看最新狀態。
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}
