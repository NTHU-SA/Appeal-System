"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import FontFamily from "@tiptap/extension-font-family";
import { TextStyle } from "@tiptap/extension-text-style";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  CircleAlert,
  CircleCheck,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Send,
} from "lucide-react";
import { toast } from "sonner";

import { saveDraftReply, submitReview } from "@/lib/actions";
import { formatTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
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
  const [saveFailed, setSaveFailed] = useState(false);
  const [isSaving, startSaving] = useTransition();
  const [isSubmitting, startSubmitting] = useTransition();
  const lastSaved = useRef("");

  const extensions = useMemo(
    () => [
      // StarterKit v3 already bundles Link; configure it here.
      StarterKit.configure({
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      TextStyle,
      FontFamily,
    ],
    []
  );

  const editor = useEditor({
    extensions,
    content: initialHtml || "<p></p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "rich-text min-h-48 px-3 py-2 text-body-md outline-none",
        "aria-label": "回覆內容",
      },
    },
  });

  // Toolbar pressed states follow the selection.
  const active = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current?.isActive("bold") ?? false,
      italic: current?.isActive("italic") ?? false,
      bulletList: current?.isActive("bulletList") ?? false,
      orderedList: current?.isActive("orderedList") ?? false,
      blockquote: current?.isActive("blockquote") ?? false,
      link: current?.isActive("link") ?? false,
    }),
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
      startSaving(async () => {
        try {
          await saveDraftReply(formData);
          setSaveFailed(false);
          setSavedAt(formatTime(new Date(), { hour: "2-digit", minute: "2-digit" }));
        } catch {
          // Retry on the next tick.
          lastSaved.current = "";
          setSaveFailed(true);
        }
      });
    }, 1800);
    return () => window.clearInterval(interval);
  }, [caseId, editor]);

  if (!editor || !active) {
    return <div className="h-72 animate-breathe rounded-sm bg-border" aria-hidden="true" />;
  }

  const submit = () => {
    const formData = new FormData();
    formData.set("caseId", caseId);
    formData.set("html", editor.getHTML());
    formData.set("json", JSON.stringify(editor.getJSON()));
    formData.set("decision", decision);
    startSubmitting(async () => {
      try {
        await submitReview(formData);
        toast.success(`已送交部長審核（${decision === "accepted" ? "受理" : "不受理"}）`);
      } catch {
        toast.error("回覆尚未送出，案件服務暫時無法回應，請稍後再試一次");
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-sm border transition-colors focus-within:border-primary">
        <div role="toolbar" aria-label="格式" className="flex flex-wrap items-center gap-1 border-b bg-surface p-1">
          <ToggleButton pressed={active.bold} label="粗體" onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold />
          </ToggleButton>
          <ToggleButton pressed={active.italic} label="斜體" onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic />
          </ToggleButton>
          <Separator orientation="vertical" className="mx-1 h-4 self-center" />
          <ToggleButton pressed={active.bulletList} label="項目清單" onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <List />
          </ToggleButton>
          <ToggleButton pressed={active.orderedList} label="編號清單" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            <ListOrdered />
          </ToggleButton>
          <ToggleButton pressed={active.blockquote} label="引用" onClick={() => editor.chain().focus().toggleBlockquote().run()}>
            <Quote />
          </ToggleButton>
          <ToggleButton
            pressed={active.link}
            label="連結"
            onClick={() => {
              if (active.link) {
                editor.chain().focus().unsetLink().run();
                return;
              }
              const href = window.prompt("連結網址");
              if (href) editor.chain().focus().setLink({ href }).run();
            }}
          >
            <Link2 />
          </ToggleButton>
          <Separator orientation="vertical" className="mx-1 h-4 self-center" />
          <Select
            defaultValue="Inter"
            onValueChange={(font) => editor.chain().focus().setFontFamily(font).run()}
          >
            <SelectTrigger className="w-28 border-transparent hover:bg-surface-hover" aria-label="字型">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Inter">Inter</SelectItem>
              <SelectItem value="serif">Serif</SelectItem>
              <SelectItem value="monospace">Mono</SelectItem>
            </SelectContent>
          </Select>
          <span role="status" className="ml-auto flex items-center gap-1 px-2 text-caption text-text-tertiary">
            {isSaving ? (
              <Spinner className="size-3.5" />
            ) : saveFailed ? (
              <CircleAlert className="size-3.5 text-danger-text" />
            ) : savedAt ? (
              <CircleCheck className="size-3.5 text-success-text" />
            ) : null}
            {isSaving
              ? "儲存草稿中"
              : saveFailed
                ? "草稿儲存失敗，稍後自動重試"
                : savedAt
                  ? `已儲存草稿 ${savedAt}`
                  : "草稿會自動儲存"}
          </span>
        </div>
        <EditorContent editor={editor} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span id="decision-label" className="text-label-md text-text-primary">審核決定</span>
          <SegmentedControl
            aria-labelledby="decision-label"
            value={decision}
            onValueChange={(value) => setDecision(value as "accepted" | "rejected")}
          >
            <SegmentedControlItem value="accepted">受理</SegmentedControlItem>
            <SegmentedControlItem value="rejected">不受理</SegmentedControlItem>
          </SegmentedControl>
        </div>
        <Button type="button" onClick={submit} disabled={isSubmitting}>
          {isSubmitting ? <Spinner /> : <Send />}
          送交部長審核
        </Button>
      </div>
    </div>
  );
}
