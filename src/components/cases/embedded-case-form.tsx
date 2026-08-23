"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useRef, useState } from "react";

const HEIGHT_MESSAGE_TYPE = "campusvoice:form-height";
const DEFAULT_HEIGHT = 1200;
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
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="relative" aria-busy={isLoading}>
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

function CaseFormSkeleton() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0" role="status">
      <span className="sr-only">申訴表單載入中</span>
      <div aria-hidden="true" className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <FieldSkeleton />
          <FieldSkeleton />
          <FieldSkeleton />
          <FieldSkeleton />
        </div>

        <FieldSkeleton multiline />
        <FieldSkeleton multiline />

        <div className="space-y-3 rounded-lg border border-dashed p-4">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-4 w-80 max-w-full" />
          <Skeleton className="h-12 w-full sm:w-28" />
        </div>
      </div>
    </div>
  );
}

function FieldSkeleton({ multiline = false }: { multiline?: boolean }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-16" />
      <Skeleton className={multiline ? "h-36 w-full" : "h-12 w-full"} />
    </div>
  );
}
