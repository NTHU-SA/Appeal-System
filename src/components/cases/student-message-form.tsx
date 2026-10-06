"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, ImageIcon, Paperclip, Send, X } from "lucide-react";
import { toast } from "sonner";

import { addStudentMessage, type ActionState } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldHint } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Notice } from "@/components/ui/notice";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB
const MAX_FILES = 3;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
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
    const result = await addStudentMessage(previous, formData);
    if (result.ok) {
      toast.success(files.length ? `已送出補充內容與 ${files.length} 個檔案` : "已送出補充內容");
    }
    return result;
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

    const oversize = selected.find((f) => f.size > MAX_FILE_BYTES);
    if (oversize) {
      setFileError(`「${oversize.name}」超過 8MB，請壓縮或分割後再上傳。`);
      return;
    }

    const combined = [...files];
    for (const newFile of selected) {
      if (!combined.some((file) => file.name === newFile.name && file.size === newFile.size)) {
        combined.push(newFile);
      }
    }
    if (combined.length > MAX_FILES) {
      setFileError(`每次最多上傳 ${MAX_FILES} 個檔案，請先移除部分檔案。`);
      return;
    }
    setFiles(combined);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removeFile(indexToRemove: number) {
    setFileError(null);
    setFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  }

  const isFormEmpty = bodyText.trim().length === 0 && files.length === 0;

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />

      {!state.ok && state.message ? (
        <Notice tone="danger" title="補充內容尚未送出" role="alert">
          {state.message}
        </Notice>
      ) : null}

      <fieldset disabled={pending} className="flex min-w-0 flex-col gap-4">
        <Field>
          <Label htmlFor="body">留言</Label>
          <Textarea
            id="body"
            name="body"
            rows={4}
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            placeholder="補充案件資訊，或回覆學權幹部的問題…"
            className="min-h-28"
          />
        </Field>

        <Field>
          <div className="flex items-center justify-between gap-4">
            <Label id="files-label">附件</Label>
            <FieldHint>最多 {MAX_FILES} 個檔案，每個 8MB 以內</FieldHint>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            name="files"
            id="supplementFiles"
            multiple
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            className="sr-only"
            aria-labelledby="files-label"
            aria-describedby={fileError ? "files-error" : undefined}
            onChange={handleFileChange}
          />

          <div
            data-invalid={fileError ? "" : undefined}
            className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed bg-surface-sunken p-4 data-invalid:border-danger-text"
          >
            <Button type="button" variant="secondary" className="bg-surface" onClick={() => fileInputRef.current?.click()}>
              <Paperclip />
              選擇檔案
            </Button>
            <span className="text-caption text-text-tertiary">PDF、Word、PNG、JPG</span>
          </div>

          <FieldError id="files-error">{fileError}</FieldError>

          {files.length > 0 ? (
            <ul className="flex flex-col gap-1" aria-label="已選取的檔案">
              {files.map((file, idx) => {
                const Icon = file.type.startsWith("image/") ? ImageIcon : FileText;
                return (
                  <li
                    key={`${file.name}-${file.lastModified}-${idx}`}
                    className="flex h-(--control-height) items-center gap-2 rounded-sm border pl-3"
                  >
                    <Icon className="size-4 shrink-0 text-text-tertiary" />
                    <span className="min-w-0 truncate text-body-sm text-text-primary" title={file.name}>
                      {file.name}
                    </span>
                    <span className="ml-auto shrink-0 text-caption text-text-tertiary tabular-nums">
                      {formatBytes(file.size)}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="hover:text-danger-text active:text-danger-text"
                      aria-label={`移除 ${file.name}`}
                      onClick={() => removeFile(idx)}
                    >
                      <X />
                    </Button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </Field>
      </fieldset>

      <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p role="status" className="text-caption text-text-tertiary">
          {pending ? "正在送出，請勿關閉頁面或重複送出。" : "新的回覆會以 email 通知你。"}
        </p>
        <Button type="submit" disabled={pending || isFormEmpty}>
          {pending ? <Spinner /> : <Send />}
          {pending ? "送出中…" : "送出"}
        </Button>
      </div>
    </form>
  );
}
