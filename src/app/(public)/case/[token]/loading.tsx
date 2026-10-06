import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-8 lg:px-10" aria-busy="true">
    <p role="status" className="text-body-md text-text-tertiary">正在載入案件…</p>
    <Skeleton className="h-6 w-56" />
    <div className="flex gap-2"><Skeleton className="h-(--control-height) w-28" /><Skeleton className="h-(--control-height) w-24" /></div>
    <div className="grid gap-6 lg:grid-cols-2"><Skeleton className="h-72" /><Skeleton className="h-72" /></div>
  </main>;
}
