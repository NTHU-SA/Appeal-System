import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

// Product wordmark: 24px / 580 with Inter's title alternates. Phones keep
// the text only, so it never truncates beside the menu buttons.
export function Wordmark({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "title-features flex min-w-0 items-center gap-2 rounded-sm text-wordmark text-text-primary",
        className,
      )}
    >
      <Image
        src="/logo-square.png"
        alt=""
        width={28}
        height={28}
        className="hidden size-7 shrink-0 rounded-sm sm:block"
      />
      <span className="truncate">學生申訴協力系統</span>
    </Link>
  );
}
