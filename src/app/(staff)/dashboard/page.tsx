import Link from "next/link";
import { ArrowRight, Inbox } from "lucide-react";

import { caseCategories, caseStatusOrder, categoryTone } from "@/lib/case-display";
import { getDashboardData, parsePeriod } from "@/lib/data";
import { statusLabels } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { BarList, ChartLegend, StackedBar, type ChartSegment } from "@/components/charts/stacked-bar";
import { TrendChart } from "@/components/charts/trend-chart";
import { CategoryBadge } from "@/components/cases/case-status";
import { PeriodControl } from "@/components/dashboard/period-control";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusDot } from "@/components/ui/status";

const statusFill = {
  pending: "bg-warning",
  in_progress: "bg-info",
  closed: "bg-success",
  rejected: "bg-danger",
} as const;

const dataFill: Record<string, string> = {
  "data-1": "bg-data-1",
  "data-2": "bg-data-2",
  "data-3": "bg-data-3",
  "data-4": "bg-data-4",
  "data-5": "bg-data-5",
  "data-6": "bg-data-6",
  "data-7": "bg-data-7",
  "data-8": "bg-data-8",
  neutral: "bg-text-muted",
};

function daysSince(date: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / (24 * 60 * 60 * 1000)));
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const days = parsePeriod((await searchParams).days);
  const data = await getDashboardData(days);

  const statusSegments: ChartSegment[] = caseStatusOrder.map((status) => ({
    key: status,
    label: statusLabels[status],
    value: data.byStatus[status] || 0,
    fill: statusFill[status],
  }));

  const categories = [
    ...caseCategories.filter((category) => category !== "其他"),
    ...Object.keys(data.byCategory).filter(
      (category) => !(caseCategories as readonly string[]).includes(category),
    ),
    "其他",
  ];
  const categorySegments: ChartSegment[] = categories.map((category) => ({
    key: category,
    label: category,
    value: data.byCategory[category] || 0,
    fill: dataFill[categoryTone(category)],
  }));

  const waiting = data.cases
    .filter((item) => item.status === "pending")
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .slice(0, 6);

  const trend = data.trend.map((point) => ({
    label: formatDate(point.date, { month: "numeric", day: "numeric" }),
    value: point.value,
  }));

  const metrics = [
    { label: "申訴總數", value: data.total, note: "全部期間" },
    { label: "新案件", value: data.cases.length, note: `近 ${days} 日` },
    { label: "待處理", value: data.byStatus.pending || 0, note: "尚未開始處理", tone: "warning" as const },
    { label: "處理中", value: data.byStatus.in_progress || 0, note: "幹部處理中", tone: "info" as const },
  ];

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6 lg:px-10 lg:py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-headline-md text-text-primary">儀表板</h1>
            <p className="text-body-md text-text-secondary">申訴數量、處理狀態與近期需要關注的案件。</p>
          </div>
          <PeriodControl days={days} />
        </div>

        <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="flex flex-col gap-2 rounded-lg border p-4">
              <dt className="flex items-center gap-2 text-label-md text-text-tertiary">
                {metric.tone ? <StatusDot tone={metric.tone} /> : null}
                {metric.label}
              </dt>
              <dd className="flex flex-col gap-1">
                <span className="title-features text-headline-md text-text-primary tabular-nums">{metric.value}</span>
                <span className="text-caption text-text-tertiary">{metric.note}</span>
              </dd>
            </div>
          ))}
        </dl>

        <div className="grid gap-4 lg:grid-cols-2">
          <section aria-labelledby="status-heading" className="flex flex-col gap-4 rounded-lg border p-4">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="status-heading" className="title-features text-title-sm text-text-primary">處理狀態分佈</h2>
              <span className="text-caption text-text-tertiary tabular-nums">近 {days} 日 · {data.cases.length} 件</span>
            </div>
            <StackedBar segments={statusSegments} />
            <ChartLegend segments={statusSegments} showShare />
          </section>

          <section aria-labelledby="category-heading" className="flex flex-col gap-4 rounded-lg border p-4">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="category-heading" className="title-features text-title-sm text-text-primary">申訴種類</h2>
              <span className="text-caption text-text-tertiary">近 {days} 日</span>
            </div>
            <BarList segments={categorySegments} />
          </section>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <section aria-labelledby="trend-heading" className="flex flex-col gap-4 rounded-lg border p-4">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="trend-heading" className="title-features text-title-sm text-text-primary">新案件趨勢</h2>
              <span className="text-caption text-text-tertiary">{data.bucketDays > 1 ? "每週新增" : "每日新增"}</span>
            </div>
            <TrendChart points={trend} />
          </section>

          <section aria-labelledby="waiting-heading" className="flex flex-col rounded-lg border">
            <div className="flex items-baseline justify-between gap-4 border-b p-4">
              <h2 id="waiting-heading" className="title-features flex items-center gap-2 text-title-sm text-text-primary">
                等待處理
              </h2>
              <span className="text-caption text-text-tertiary">依等待時間排序</span>
            </div>
            {waiting.length ? (
              <ul className="flex flex-col p-1">
                {waiting.map((item) => {
                  const waited = daysSince(item.created_at);
                  return (
                    <li key={item.id}>
                      <Link
                        href={`/cases/${item.id}`}
                        className="flex flex-col gap-1 rounded-md px-3 py-2 transition-colors hover:bg-surface-hover"
                      >
                        <span className="truncate text-body-sm font-medium text-text-primary" title={item.subject}>
                          {item.subject}
                        </span>
                        <span className="flex items-center gap-3 text-caption text-text-tertiary">
                          <span className="tabular-nums">{item.public_id}</span>
                          <CategoryBadge category={item.category} className="py-0 text-caption" />
                          <span className={waited >= 3 ? "ml-auto font-medium text-warning-text" : "ml-auto"}>
                            {waited ? `已等待 ${waited} 天` : "今天"}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState icon={Inbox} title="沒有待處理的案件" description="新案件送出後會出現在這裡。" />
            )}
            <div className="mt-auto border-t p-2">
              <Button asChild variant="ghost" className="w-full justify-between">
                <Link href="/cases?status=pending">
                  查看全部待處理案件
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
