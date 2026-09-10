import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 px-4 py-8" aria-busy="true">
    <p role="status" className="text-sm text-muted-foreground">正在載入案件…</p>
    <Skeleton className="h-9 w-72" />
    <Skeleton className="h-10 w-48" />
    <div className="grid gap-6 sm:grid-cols-2"><Skeleton className="h-72" /><Skeleton className="h-72" /></div>
  </main>;
}
