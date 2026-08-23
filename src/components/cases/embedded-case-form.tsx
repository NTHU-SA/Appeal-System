"use client";

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
    <iframe
      ref={iframeRef}
      src={src}
      title="學生申訴表單"
      className="block w-full border-0"
      style={{ height }}
    />
  );
}
