"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  FileText,
  HelpCircle,
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
          <span>送出補充資料</span>
          <Send className="h-4 w-4" />
        </>
      )}
    </Button>
  );
}

export function StudentMessageForm({ token }: { token: string }) {
  const [showMailHelp, setShowMailHelp] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [bodyText, setBodyText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [state, action] = useActionState(addStudentMessage, {
    ok: false,
    message: "",
  } satisfies ActionState);

  // Reset form inputs upon successful submission
  useEffect(() => {
    if (state.ok) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBodyText("");
      setFiles([]);
      setFileError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (formRef.current) {
        formRef.current.reset();
      }
    }
  }, [state]);

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

    setFiles((prev) => {
      // Merge unique by name and lastModified
      const combined = [...prev];
      for (const newFile of selected) {
        if (!combined.some((f) => f.name === newFile.name && f.size === newFile.size)) {
          combined.push(newFile);
        }
      }
      return combined;
    });

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
        <Alert variant={state.ok ? "default" : "destructive"}>
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

        <div className="space-y-2">
          <Label htmlFor="body">
            補充文字說明 <span className="text-xs text-muted-foreground">（若有文字補充請填寫）</span>
          </Label>
          <Textarea
            id="body"
            name="body"
            rows={4}
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            placeholder="請輸入欲向學權幹部補充說明的狀況、時間細節或補充說明..."
          />
        </div>

        {/* File Upload Zone */}
        <div className="space-y-2">
          <Label className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 font-medium">
              <Paperclip className="h-4 w-4 text-muted-foreground" />
              上傳補件檔案
            </span>
            <span className="text-xs text-muted-foreground">可複選，每檔上限 8MB</span>
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

          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/80 bg-muted/20 p-5 text-center transition hover:border-primary/60 hover:bg-muted/40"
          >
            <div className="rounded-full bg-background p-2 shadow-xs">
              <UploadCloud className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                點擊此處選擇要補件的檔案
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                支援 PDF、Word、PNG、JPG 文件或截圖
              </p>
            </div>
          </div>

          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <p className="text-xs font-semibold text-muted-foreground">
                已選取 {files.length} 個補件檔案：
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

        <p className="rounded-md border border-dashed bg-muted/30 p-2.5 text-xs leading-5 text-muted-foreground">
          📌 提示：上傳的佐證檔案將自動安全同步至該案件的 Google Drive 雲端資料夾，學權幹部會即時收到通知。
        </p>

        <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowMailHelp((value) => !value)}
            className="text-xs"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            信件相關說明
          </Button>
          <SubmitButton disabled={isFormEmpty} />
        </div>
      </form>

      {showMailHelp ? (
        <Alert className="mt-2 text-xs">
          <AlertTitle className="text-sm font-semibold">信件收發注意事項</AlertTitle>
          <AlertDescription className="space-y-1 text-xs leading-5">
            <p>1. 案件進度與學權組織回覆皆會寄至您的登記信箱，若未收到請先檢查垃圾郵件匣。</p>
            <p>2. 本專屬網址已包含安全憑證，請妥善保管此網址，勿將網址轉傳他人以維護個人隱私。</p>
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
