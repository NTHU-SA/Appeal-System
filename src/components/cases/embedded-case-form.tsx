"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef, useState } from "react";

const HEIGHT_MESSAGE_TYPE = "campusvoice:form-height";
const HEIGHT_REQUEST_TYPE = "campusvoice:request-height";
const DEFAULT_HEIGHT = 760;
const MIN_HEIGHT = 480;
const MAX_HEIGHT = 4000;

interface EmbeddedCaseFormProps {
  src: string;
}

export function EmbeddedCaseForm({ src }: EmbeddedCaseFormProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const [loadedSrc, setLoadedSrc] = useState("");
  const isLoading = loadedSrc !== src;

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (!event.data || event.data.type !== HEIGHT_MESSAGE_TYPE) return;

      const nextHeight = Number(event.data.height);
      if (!Number.isFinite(nextHeight)) return;

      setHeight(Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, Math.ceil(nextHeight))));
      // A height report also proves the form rendered, even when its load
      // event fired before hydration.
      setLoadedSrc(src);
    }

    window.addEventListener("message", handleMessage);
    // Ask a frame that finished loading before hydration to report again.
    iframeRef.current?.contentWindow?.postMessage({ type: HEIGHT_REQUEST_TYPE }, "*");
    return () => window.removeEventListener("message", handleMessage);
  }, [src]);

  return (
    <div className="@container relative" aria-busy={isLoading}>
      {isLoading ? <CaseFormSkeleton /> : null}
      <iframe
        ref={iframeRef}
        src={src}
        title="學生申訴表單"
        className={`block w-full border-0 ${isLoading ? "opacity-0" : "opacity-100"}`}
        style={{ height }}
        tabIndex={isLoading ? -1 : undefined}
        onLoad={() => setLoadedSrc(src)}
      />
    </div>
  );
}

// Mirrors apps-script/Index.html. Container queries match the iframe width,
// which is what the form's own media queries see.
function CaseFormSkeleton() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0" role="status">
      <span className="sr-only">申訴表單載入中</span>
      <div aria-hidden="true" className="flex flex-col gap-4">
        <div className="grid gap-4 @min-[560px]:grid-cols-2">
          <FieldSkeleton />
          <FieldSkeleton />
          <FieldSkeleton />
          <FieldSkeleton />
        </div>

        <FieldSkeleton multiline />
        <FieldSkeleton multiline />

        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-20" />
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed bg-surface-sunken p-4">
            <Skeleton className="h-(--control-height) w-24" />
            <Skeleton className="h-3 w-64 max-w-full" />
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t pt-4 @min-[560px]:flex-row @min-[560px]:items-center @min-[560px]:justify-between">
          <Skeleton className="h-3 w-80 max-w-full" />
          <Skeleton className="h-(--control-height) w-full @min-[560px]:w-24" />
        </div>
      </div>
    </div>
  );
}

function FieldSkeleton({ multiline = false }: { multiline?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className={multiline ? "h-32 w-full" : "h-(--control-height) w-full"} />
    </div>
  );
}
