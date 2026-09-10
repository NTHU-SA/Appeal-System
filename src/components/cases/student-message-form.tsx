"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import {
  FileText,
  ImageIcon,
  Loader2,
  Paperclip,
  Send,
  UploadCloud,
  X,
} from "lucide-react";

import { addStudentMessage, type ActionState } from "@/lib/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} className="gap-2">
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>送出中...</span>
        </>
      ) : (
        <>
          <span>送出</span>
          <Send className="h-4 w-4" />
        </>
      )}
    </Button>
  );
}

export function StudentMessageForm({ token }: { token: string }) {
  const router = useRouter();
  const requestRef = useRef<{ signature: string; id: string } | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [bodyText, setBodyText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [state, action, pending] = useActionState(async (previous: ActionState, formData: FormData) => {
    const signature = JSON.stringify([bodyText, files.map((file) => [file.name, file.size, file.lastModified])]);
    if (requestRef.current?.signature !== signature) {
      requestRef.current = { signature, id: crypto.randomUUID() };
    }
    formData.set("requestId", requestRef.current.id);
    formData.delete("files");
    files.forEach((file) => formData.append("files", file));
    return addStudentMessage(previous, formData);
  }, {
    ok: false,
    message: "",
  } satisfies ActionState);

  // Reset form inputs upon successful submission
  useEffect(() => {
    if (state.ok) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBodyText("");
      setFiles([]);
      requestRef.current = null;
      router.refresh();
      setFileError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (formRef.current) {
        formRef.current.reset();
      }
    }
  }, [state, router]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFileError(null);
    const selected = Array.from(event.target.files || []);
    if (!selected.length) return;

    // Check size limit
    const oversize = selected.find((f) => f.size > MAX_FILE_BYTES);
    if (oversize) {
      setFileError(`「${oversize.name}」超過 8MB 限制，請縮減大小後再上傳。`);
      return;
    }

    const combined = [...files];
    for (const newFile of selected) {
      if (!combined.some((file) => file.name === newFile.name && file.size === newFile.size)) {
        combined.push(newFile);
      }
    }
    if (combined.length > 3) {
      setFileError("每次最多上傳 3 個檔案。");
      return;
    }
    setFiles(combined);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removeFile(indexToRemove: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  }

  function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  const isFormEmpty = bodyText.trim().length === 0 && files.length === 0;

  return (
    <div className="space-y-4">
      {state.message ? (
        <Alert role="status" variant={state.ok ? "default" : "destructive"}>
          <AlertTitle>{state.ok ? "已成功送出" : "送出失敗"}</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      {fileError ? (
        <Alert variant="destructive">
          <AlertTitle>檔案驗證錯誤</AlertTitle>
          <AlertDescription>{fileError}</AlertDescription>
        </Alert>
      ) : null}

      <form ref={formRef} action={action} className="space-y-4">
        <input type="hidden" name="token" value={token} />

        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="body">留言</Label>
          <SubmitButton disabled={isFormEmpty} />
        </div>
        <fieldset disabled={pending} className="space-y-4 min-w-0">
        <div className="space-y-2">
          <Textarea
            id="body"
            name="body"
            rows={4}
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            placeholder="補充案件資訊或回覆幹部…"
          />
        </div>

        {/* File Upload Zone */}
        <div className="space-y-2">
          <Label className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 font-medium">
              <Paperclip className="h-4 w-4 text-muted-foreground" />
              附件
            </span>
            <span className="text-xs text-muted-foreground">最多 3 檔，每檔 8MB</span>
          </Label>

          <input
            ref={fileInputRef}
            type="file"
            name="files"
            id="supplementFiles"
            multiple
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/80 bg-muted/20 p-5 text-center transition hover:border-primary/60 hover:bg-muted/40"
          >
            <div className="rounded-full bg-background p-2 shadow-xs">
              <UploadCloud className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                選擇檔案
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                PDF、Word、PNG、JPG
              </p>
            </div>
          </button>

          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <p className="text-xs font-semibold text-muted-foreground">
                已選取 {files.length} 個檔案
              </p>
              <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
                {files.map((file, idx) => (
                  <div
                    key={`${file.name}-${file.lastModified}-${idx}`}
                    className="flex items-center justify-between gap-2 rounded-md border bg-card p-2 text-xs"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {file.type.startsWith("image/") ? (
                        <ImageIcon className="h-4 w-4 shrink-0 text-blue-500" />
                      ) : (
                        <FileText className="h-4 w-4 shrink-0 text-amber-500" />
                      )}
                      <span className="truncate font-medium">{file.name}</span>
                      <span className="shrink-0 text-muted-foreground">
                        ({formatBytes(file.size)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(idx);
                      }}
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      title="移除此檔案"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        </fieldset>
        {pending && <p role="status" className="text-xs text-muted-foreground">正在儲存，請勿關閉頁面或重複送出。</p>}
        <p className="text-xs text-muted-foreground">新回覆將以 email 通知。請勿轉傳此專屬連結。</p>
      </form>

    </div>
  );
}
