"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import {
  CircleAlert,
  CircleCheck,
  FileText,
  ImageIcon,
  Paperclip,
  Send,
  UploadCloud,
  X,
} from "lucide-react";

import { addStudentMessage, type ActionState } from "@/lib/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled}>
      {pending ? (
        <>
          <Spinner />
          <span>送出中...</span>
        </>
      ) : (
        <>
          <span>送出</span>
          <Send />
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
    <div className="flex flex-col gap-4">
      {state.message ? (
        <Alert role="status" variant={state.ok ? "success" : "destructive"}>
          {state.ok ? <CircleCheck /> : <CircleAlert />}
          <AlertTitle>{state.ok ? "已成功送出" : "送出失敗"}</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      {fileError ? (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>檔案驗證錯誤</AlertTitle>
          <AlertDescription>{fileError}</AlertDescription>
        </Alert>
      ) : null}

      <form ref={formRef} action={action} className="flex flex-col gap-4">
        <input type="hidden" name="token" value={token} />

        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="body">留言</Label>
          <SubmitButton disabled={isFormEmpty} />
        </div>
        <fieldset disabled={pending} className="flex min-w-0 flex-col gap-4">
        <Textarea
          id="body"
          name="body"
          rows={4}
          value={bodyText}
          onChange={(e) => setBodyText(e.target.value)}
          placeholder="補充案件資訊或回覆幹部…"
        />

        {/* File Upload Zone */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <Label>
              <Paperclip className="size-4 text-text-tertiary" />
              附件
            </Label>
            <span className="text-caption text-text-tertiary">最多 3 檔，每檔 8MB</span>
          </div>

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
            className="flex w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed bg-surface p-4 text-center transition-colors hover:bg-surface-hover active:bg-surface-active"
          >
            <UploadCloud className="mb-1 size-5 text-text-tertiary" />
            <span className="text-label-md text-text-primary">選擇檔案</span>
            <span className="text-caption text-text-tertiary">PDF、Word、PNG、JPG</span>
          </button>

          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="flex flex-col gap-2 pt-1">
              <p className="text-caption text-text-tertiary">
                已選取 {files.length} 個檔案
              </p>
              <ul className="flex max-h-48 flex-col gap-1 overflow-y-auto">
                {files.map((file, idx) => {
                  const Icon = file.type.startsWith("image/") ? ImageIcon : FileText;
                  return (
                    <li
                      key={`${file.name}-${file.lastModified}-${idx}`}
                      className="flex items-center gap-2 rounded-sm border py-1 pr-1 pl-3"
                    >
                      <Icon className="size-4 shrink-0 text-text-tertiary" />
                      <span className="min-w-0 truncate text-text-primary" title={file.name}>
                        {file.name}
                      </span>
                      <span className="shrink-0 text-caption text-text-tertiary">
                        {formatBytes(file.size)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="ml-auto hover:text-danger-text active:text-danger-text"
                        aria-label={`移除 ${file.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(idx);
                        }}
                      >
                        <X />
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        </fieldset>
        {pending && <p role="status" className="text-caption text-text-tertiary">正在儲存，請勿關閉頁面或重複送出。</p>}
        <p className="text-caption text-text-tertiary">新回覆將以 email 通知。請勿轉傳此專屬連結。</p>
      </form>

    </div>
  );
}
