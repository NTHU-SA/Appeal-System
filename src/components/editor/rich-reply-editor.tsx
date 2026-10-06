"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import LinkExtension from "@tiptap/extension-link";
import FontFamily from "@tiptap/extension-font-family";
import { TextStyle } from "@tiptap/extension-text-style";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Quote, Save, Send } from "lucide-react";

import { saveDraftReply, submitReview } from "@/lib/actions";
import { formatTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleButton } from "@/components/editor/toggle-button";

export function RichReplyEditor({
  caseId,
  initialHtml = "",
}: {
  caseId: string;
  initialHtml?: string;
}) {
  const [decision, setDecision] = useState<"accepted" | "rejected">("accepted");
  const [savedAt, setSavedAt] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const lastSaved = useRef("");

  const extensions = useMemo(
    () => [
      StarterKit,
      TextStyle,
      FontFamily,
      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
    ],
    []
  );

  const editor = useEditor({
    extensions,
    content: initialHtml || "<p></p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "rich-text min-h-48 rounded-sm border bg-surface px-3 py-2 text-body-md outline-none transition-colors focus:border-primary",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const interval = window.setInterval(() => {
      const html = editor.getHTML();
      if (html === lastSaved.current || html === "<p></p>") return;
      lastSaved.current = html;
      const formData = new FormData();
      formData.set("caseId", caseId);
      formData.set("html", html);
      formData.set("json", JSON.stringify(editor.getJSON()));
      startTransition(async () => {
        await saveDraftReply(formData);
        setSavedAt(formatTime());
      });
    }, 1800);
    return () => window.clearInterval(interval);
  }, [caseId, editor]);

  if (!editor) return null;

  const submit = () => {
    const formData = new FormData();
    formData.set("caseId", caseId);
    formData.set("html", editor.getHTML());
    formData.set("json", JSON.stringify(editor.getJSON()));
    formData.set("decision", decision);
    startTransition(async () => {
      await submitReview(formData);
      setSavedAt("已送交部長審核");
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <ToggleButton
          pressed={editor.isActive("bold")}
          label="粗體"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold />
        </ToggleButton>
        <ToggleButton
          pressed={editor.isActive("blockquote")}
          label="引用"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote />
        </ToggleButton>
        <Select
          defaultValue="Inter"
          onValueChange={(font) => editor.chain().focus().setFontFamily(font).run()}
        >
          <SelectTrigger className="w-36" aria-label="字型">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Inter">Inter</SelectItem>
            <SelectItem value="serif">Serif</SelectItem>
            <SelectItem value="monospace">Mono</SelectItem>
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            const href = window.prompt("連結網址");
            if (href) editor.chain().focus().setLink({ href }).run();
          }}
        >
          連結
        </Button>
        <div className="ml-auto flex items-center gap-1 text-caption text-text-tertiary">
          <Save className="size-3.5" />
          {isPending ? "儲存中" : savedAt || "自動儲存"}
        </div>
      </div>

      <EditorContent editor={editor} />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Select
          value={decision}
          onValueChange={(value: "accepted" | "rejected") => setDecision(value)}
        >
          <SelectTrigger className="sm:w-40" aria-label="審核決定">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="accepted">受理</SelectItem>
            <SelectItem value="rejected">不受理</SelectItem>
          </SelectContent>
        </Select>
        <Button type="button" onClick={submit} disabled={isPending}>
          送出給部長審核
          <Send />
        </Button>
      </div>
    </div>
  );
}
