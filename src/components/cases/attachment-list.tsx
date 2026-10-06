import { ExternalLink, FileText, ImageIcon } from "lucide-react";

import type { CaseAttachment } from "@/lib/types";

// Compact rows: file icon, truncated name (full name on hover), external mark.
export function AttachmentList({ attachments }: { attachments: CaseAttachment[] }) {
  return (
    <ul className="-mx-2 flex flex-col gap-1">
      {attachments.map((attachment) => {
        const Icon = attachment.file_type?.startsWith("image/") ? ImageIcon : FileText;
        return (
          <li key={attachment.id}>
            <a
              href={attachment.drive_url || "#"}
              target="_blank"
              rel="noreferrer"
              title={attachment.file_name}
              className="group flex h-(--control-height) items-center gap-2 rounded-sm px-2 text-body-md text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
            >
              <Icon className="size-4 shrink-0 text-text-tertiary transition-colors group-hover:text-text-primary" />
              <span className="min-w-0 flex-1 truncate">{attachment.file_name}</span>
              <ExternalLink className="size-3.5 shrink-0 text-text-tertiary" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
