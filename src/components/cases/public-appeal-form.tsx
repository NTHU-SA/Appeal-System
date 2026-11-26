"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type ComponentProps, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  appealCategories,
  appealDepartments,
  appealFileAccept,
  maxAppealFiles,
  publicAppealFormSchema,
  validateAppealFile,
  type AppealResponse,
  type PublicAppealFields,
} from "@/lib/public-appeal";

type SubmissionAttempt = {
  requestId: string;
  fields: PublicAppealFields;
  fileIds: string[];
};

const fieldClass = "min-h-12 text-base md:text-base";
const endpoint = "/api/appeals";

function AppealSelect({ options, prompt, ...props }: ComponentProps<"select"> & {
  options: readonly string[];
  prompt: string;
}) {
  return (
    <div className="relative">
      <select
        {...props}
        required
        defaultValue=""
        className="h-12 w-full appearance-none rounded-lg border border-input bg-background pl-2.5 pr-9 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <option value="">{prompt}</option>
        {options.map((item) => <option key={item}>{item}</option>)}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

async function sendAppealRequest<T>(options: RequestInit): Promise<T> {
  const response = await fetch(endpoint, options);
  const result: AppealResponse<T> | null = await response.json().catch(() => null);
  if (!result || !response.ok || !result.ok) {
    throw new Error(result && !result.ok ? result.message : "目前無法確認送件，請稍後重試。");
  }
  return result.data;
}

export function PublicAppealForm() {
  const [otherDepartment, setOtherDepartment] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [progress, setProgress] = useState("");
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [publicId, setPublicId] = useState("");
  const attempt = useRef<SubmissionAttempt | null>(null);
  const submitting = useRef(false);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (publicId) resultHeading.current?.focus();
  }, [publicId]);

  useEffect(() => {
    if (submitError) errorSummary.current?.focus();
  }, [submitError]);

  function resetAttempt() {
    attempt.current = null;
    setSubmitError("");
  }

  function selectFiles(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    if (!selected.length) return;

    const combined = [...files];
    for (const file of selected) {
      const checked = validateAppealFile(file);
      if (checked.error) {
        setFileError(checked.error);
        return;
      }
      if (!combined.some((item) => item.name === file.name && item.size === file.size && item.lastModified === file.lastModified)) {
        combined.push(file);
      }
    }
    if (combined.length > maxAppealFiles) {
      setFileError("最多可上傳 10 個附件，請先移除不需要的檔案。");
      return;
    }
    setFileError("");
    setFiles(combined);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;

    if (!attempt.current) {
      const fields = publicAppealFormSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));
      if (!fields.success) {
        setSubmitError(fields.error.issues[0].message);
        return;
      }
      attempt.current = { requestId: crypto.randomUUID(), fields: fields.data, fileIds: [] };
    }

    const current = attempt.current;
    submitting.current = true;
    setSubmitError("");
    setFileError("");

    try {
      for (let index = current.fileIds.length; index < files.length; index++) {
        setProgress(`正在上傳附件 ${index + 1} / ${files.length}`);
        const body = new FormData();
        body.set("requestId", current.requestId);
        body.set("slot", String(index));
        body.set("file", files[index]);
        const { fileId } = await sendAppealRequest<{ fileId: string }>({ method: "PUT", body });
        current.fileIds.push(fileId);
      }

      // Retry the same final request after a lost response, even if a case was created.
      setAwaitingConfirmation(true);
      setProgress("正在確認送件");
      const result = await sendAppealRequest<{ publicId: string }>({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...current.fields, requestId: current.requestId, fileIds: current.fileIds }),
      });
      setPublicId(result.publicId);
      setOtherDepartment(false);
      setFiles([]);
      attempt.current = null;
      setAwaitingConfirmation(false);
    } catch (error) {
      setSubmitError(error instanceof TypeError
        ? "連線中斷，請重試送件。"
        : error instanceof Error ? error.message : "目前無法確認送件，請稍後重試。");
    } finally {
      submitting.current = false;
      setProgress("");
    }
  }

  if (publicId) {
    return (
      <div className="space-y-3">
        <h3 ref={resultHeading} tabIndex={-1} className="text-lg font-semibold">申訴案件已建立</h3>
        <p>案件編號 <strong className="break-all">{publicId}</strong></p>
        <p className="text-sm text-muted-foreground">請保留案件編號，並到填寫的電子信箱查看受理通知和專屬查詢連結。</p>
        <Button type="button" variant="outline" onClick={() => setPublicId("")}>填寫新申訴</Button>
      </div>
    );
  }

  return (
    <form action={endpoint} method="post" onSubmit={submit} onChange={resetAttempt} className="space-y-5">
      <noscript><p className="text-destructive">請啟用 JavaScript 後重新開啟表單。</p></noscript>
      <p className="text-sm text-muted-foreground">除附件外，所有欄位皆為必填。</p>

      <fieldset disabled={Boolean(progress) || awaitingConfirmation} className="min-w-0 space-y-5">
        <legend className="sr-only">申訴資料</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="appeal-email">電子郵件</Label>
            <Input id="appeal-email" name="email" type="email" autoComplete="email" maxLength={254} required className={fieldClass} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="appeal-name">姓名</Label>
            <Input id="appeal-name" name="name" autoComplete="name" maxLength={80} required className={fieldClass} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="appeal-department">年級</Label>
            <AppealSelect
              id="appeal-department"
              name="department"
              prompt="請選擇年級"
              options={appealDepartments}
              onChange={(event) => setOtherDepartment(event.currentTarget.value === "其他")}
            />
            {otherDepartment && (
              <div className="space-y-2 pt-2">
                <Label htmlFor="appeal-department-other">年級／身分說明</Label>
                <Input id="appeal-department-other" name="departmentOther" maxLength={60} required className={fieldClass} />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="appeal-category">申訴種類</Label>
            <AppealSelect id="appeal-category" name="category" prompt="請選擇申訴種類" options={appealCategories} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="appeal-subject">申訴問題</Label>
          <p id="appeal-subject-help" className="text-sm text-muted-foreground">請描述事件、時間和相關單位，至少 8 個字。</p>
          <Textarea id="appeal-subject" name="subject" aria-describedby="appeal-subject-help" minLength={8} maxLength={8000} rows={4} required className="min-h-28 text-base md:text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="appeal-outcome">希望得到的處理方式</Label>
          <Textarea id="appeal-outcome" name="desiredOutcome" maxLength={4000} rows={3} required className="min-h-24 text-base md:text-base" />
        </div>

        <div className="space-y-2 rounded-lg border border-dashed p-4">
          <Label htmlFor="appeal-files">附件（選填）</Label>
          <p id="appeal-file-help" className="text-sm text-muted-foreground">
            支援 PDF、Word、PNG、JPG。最多 10 個，每個最多 8 MB。附件會存入學權組織的 Google Drive。
          </p>
          <Input id="appeal-files" type="file" multiple accept={appealFileAccept} onChange={selectFiles} aria-describedby="appeal-file-help" className="min-h-12 py-2 text-base md:text-base" />
          {fileError && <p role="alert" className="text-sm text-destructive">{fileError}</p>}
          {files.length > 0 && (
            <ul className="divide-y" aria-label="已選附件">
              {files.map((file, index) => (
                <li key={`${file.name}-${file.size}-${file.lastModified}`} className="flex items-center justify-between gap-2">
                  <span className="min-w-0 break-all text-sm">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    aria-label={`移除 ${file.name}`}
                    className="min-h-12"
                    onClick={() => {
                      resetAttempt();
                      setFileError("");
                      setFiles(files.filter((_, fileIndex) => fileIndex !== index));
                    }}
                  >
                    移除
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </fieldset>

      {submitError && <p ref={errorSummary} role="alert" tabIndex={-1} className="text-sm text-destructive">{submitError}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" className="min-h-12 px-4" disabled={Boolean(progress)}>
          {awaitingConfirmation ? "重試送件" : "送出申訴"}
        </Button>
        <span role="status" className="text-sm text-muted-foreground">{progress}</span>
      </div>
    </form>
  );
}
