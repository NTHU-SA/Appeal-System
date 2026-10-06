"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

// Form submit button: the 16px spinner replaces the icon while pending.
export function SubmitButton({
  icon,
  pendingLabel,
  children,
  disabled,
  ...props
}: React.ComponentProps<typeof Button> & {
  icon?: React.ReactNode;
  pendingLabel?: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} {...props}>
      {pending ? <Spinner /> : icon}
      {pending && pendingLabel ? pendingLabel : children}
    </Button>
  );
}
