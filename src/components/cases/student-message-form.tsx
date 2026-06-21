"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { HelpCircle, Send, Upload } from "lucide-react";

import { addStudentMessage, type ActionState } from "@/lib/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending}>
      {pending ? "送出中..." : "送出補充"}
      <Send className="h-4 w-4" />
    </Button>
  );
}

export function StudentMessageForm({ token }: { token: string }) {
  const [showMailHelp, setShowMailHelp] = useState(false);
  const [state, action] = useActionState(addStudentMessage, {
    ok: false,
    message: "",
  } satisfies ActionState);

  return (
    <div className="space-y-4">
      {state.message ? (
        <Alert variant={state.ok ? "default" : "destructive"}>
          <AlertTitle>{state.ok ? "已送出" : "送出失敗"}</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <form action={action} className="space-y-3">
        <input type="hidden" name="token" value={token} />
        <div className="space-y-2">
          <Label htmlFor="body">補充內容</Label>
          <Textarea id="body" name="body" rows={5} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="attachments">補充附件</Label>
          <div className="flex items-center gap-3 rounded-md border px-3 py-2">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <Input
              id="attachments"
              name="attachments"
              type="file"
              multiple
              className="border-0 p-0 shadow-none"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowMailHelp((value) => !value)}
          >
            <HelpCircle className="h-4 w-4" />
            沒有收到信件
          </Button>
          <SubmitButton />
        </div>
      </form>

      {showMailHelp ? (
        <Alert>
          <AlertTitle>請先檢查垃圾信件匣</AlertTitle>
          <AlertDescription>
            若仍未收到，可能是送件時 email 填錯。請重新送出一筆案件，並在申訴問題中註明原案件編號，學權組織會協助合併確認。
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
