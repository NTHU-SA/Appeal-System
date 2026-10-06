import { cn } from "@/lib/utils";

// One label/value pair inside a <dl>.
export function CaseField({
  label,
  value,
  multiline,
  className,
}: {
  label: string;
  value: string | null | undefined;
  multiline?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <dt className="text-caption text-text-tertiary">{label}</dt>
      <dd
        className={cn(
          "text-body-md break-words",
          multiline ? "whitespace-pre-wrap text-text-secondary" : "text-text-primary",
        )}
      >
        {value || "無"}
      </dd>
    </div>
  );
}
