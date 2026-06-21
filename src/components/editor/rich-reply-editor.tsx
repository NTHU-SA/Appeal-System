"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import LinkExtension from "@tiptap/extension-link";
import FontFamily from "@tiptap/extension-font-family";
import { TextStyle } from "@tiptap/extension-text-style";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Quote, Save, Send } from "lucide-react";

import { saveDraftReply, submitReview } from "@/lib/actions";
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
          "min-h-48 rounded-md border bg-background px-3 py-2 text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring",
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
        setSavedAt(new Date().toLocaleTimeString("zh-TW"));
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
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <ToggleButton
          pressed={editor.isActive("bold")}
          label="粗體"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToggleButton>
        <ToggleButton
          pressed={editor.isActive("blockquote")}
          label="引用"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </ToggleButton>
        <Select
          defaultValue="Geist"
          onValueChange={(font) => editor.chain().focus().setFontFamily(font).run()}
        >
          <SelectTrigger className="h-9 w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Geist">Geist</SelectItem>
            <SelectItem value="serif">Serif</SelectItem>
            <SelectItem value="monospace">Mono</SelectItem>
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const href = window.prompt("連結網址");
            if (href) editor.chain().focus().setLink({ href }).run();
          }}
        >
          連結
        </Button>
        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <Save className="h-3.5 w-3.5" />
          {isPending ? "儲存中" : savedAt || "自動儲存"}
        </div>
      </div>

      <EditorContent editor={editor} />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Select
          value={decision}
          onValueChange={(value: "accepted" | "rejected") => setDecision(value)}
        >
          <SelectTrigger className="sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="accepted">受理</SelectItem>
            <SelectItem value="rejected">不受理</SelectItem>
          </SelectContent>
        </Select>
        <Button type="button" onClick={submit} disabled={isPending}>
          送出給部長審核
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
