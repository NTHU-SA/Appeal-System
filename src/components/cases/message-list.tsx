import { FileText, ImageIcon } from "lucide-react";

import type { CaseAttachment, CaseMessage } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Conversation timeline: avatar, author, time, then the message body and any
// files sent with it. Staff and student avatars differ by surface only.
export function MessageList({
  messages,
  attachments = [],
  authorLabel,
}: {
  messages: CaseMessage[];
  attachments?: CaseAttachment[];
  authorLabel: (message: CaseMessage) => { name: string; initial: string; role?: string };
}) {
  return (
    <ol className="flex flex-col">
      {messages.map((message) => {
        const author = authorLabel(message);
        const files = attachments.filter((file) => file.message_id === message.id);
        const isStudent = message.author_type === "student";
        return (
          <li key={message.id} className="flex gap-3 border-b py-5 first:pt-0 last:border-b-0 last:pb-0">
            <Avatar className="mt-0.5">
              <AvatarFallback className={isStudent ? "bg-surface-sunken" : "bg-surface-active"}>
                {author.initial}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="flex items-baseline gap-2">
                  <span className="text-label-md text-text-primary">{author.name}</span>
                  {author.role ? <span className="text-caption text-text-tertiary">{author.role}</span> : null}
                </span>
                <time dateTime={message.created_at} className="text-caption text-text-tertiary tabular-nums">
                  {formatDateTime(message.created_at, { dateStyle: "medium", timeStyle: "short" })}
                </time>
              </div>
              {message.body_html ? (
                <div
                  className="rich-text max-w-170 text-body-md"
                  dangerouslySetInnerHTML={{ __html: message.body_html }}
                />
              ) : (
                <p className="max-w-170 text-body-md whitespace-pre-wrap text-text-secondary">
                  {message.body_text}
                </p>
              )}
              {files.length ? (
                <ul className="flex flex-wrap gap-2 pt-1">
                  {files.map((file) => {
                    const Icon = file.file_type?.startsWith("image/") ? ImageIcon : FileText;
                    return (
                      <li key={file.id}>
                        <a
                          href={file.drive_url || "#"}
                          target="_blank"
                          rel="noreferrer"
                          title={file.file_name}
                          className="flex h-(--control-height) max-w-64 items-center gap-2 rounded-sm border px-3 text-body-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                        >
                          <Icon className="size-4 shrink-0 text-text-tertiary" />
                          <span className="truncate">{file.file_name}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
