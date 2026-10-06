import { Skeleton } from "@/components/ui/skeleton";

// Mirrors the case page: header, notice, conversation and side summary.
export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 lg:px-10 lg:py-10" aria-busy="true">
      <p role="status" className="sr-only">正在載入案件…</p>
      <div aria-hidden="true" className="flex flex-col gap-4 border-b pb-6">
        <Skeleton className="h-3 w-40" />
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-(--control-height) w-28" />
            <Skeleton className="h-(--control-height) w-24" />
          </div>
        </div>
      </div>
      <Skeleton aria-hidden="true" className="mt-6 h-10 w-full rounded-lg" />
      <div aria-hidden="true" className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-72 rounded-lg" />
      </div>
    </main>
  );
}
