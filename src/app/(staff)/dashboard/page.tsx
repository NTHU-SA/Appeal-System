import { Search } from "lucide-react";

import { requireStaff } from "@/lib/auth";
import { getDashboardData } from "@/lib/data";
import { AppShell } from "@/components/layout/app-shell";
import { CasesTable } from "@/components/dashboard/cases-table";
import { StatusChart } from "@/components/dashboard/status-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string; q?: string }>;
}) {
  const staffPromise = requireStaff();
  const dataPromise = searchParams.then(async (params) => {
    const days = Number(params.days || 30);
    const query = params.q || "";
    const data = await getDashboardData(days, query);
    return { days, query, data };
  });

  const [staff, { days, query, data }] = await Promise.all([
    staffPromise,
    dataPromise,
  ]);

  return (
    <AppShell staff={staff}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-headline-md text-text-primary">儀表板</h1>
          <p className="text-body-md text-text-secondary">
            查看申訴數量、待處理案件與近期狀態分佈。
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Metric title="申訴總數" value={data.total} />
          <Metric title="待處理" value={data.pending} />
          <Metric title={`近 ${days} 日案件`} value={data.cases.length} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardHeader>
              <CardTitle>處理狀態分佈</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusChart byStatus={data.byStatus} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>篩選</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-3 sm:grid-cols-[10rem_1fr]">
                <Select name="days" defaultValue={String(days)}>
                  <SelectTrigger aria-label="期間">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">近 7 日</SelectItem>
                    <SelectItem value="14">近 14 日</SelectItem>
                    <SelectItem value="30">近 30 日</SelectItem>
                    <SelectItem value="90">近 90 日</SelectItem>
                  </SelectContent>
                </Select>
                <InputGroup>
                  <InputGroupAddon>
                    <Search />
                  </InputGroupAddon>
                  <InputGroupInput
                    name="q"
                    defaultValue={query}
                    placeholder="搜尋關鍵字"
                    aria-label="搜尋關鍵字"
                  />
                </InputGroup>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card id="cases" className="scroll-mt-[calc(var(--header-height)+1.5rem)] pb-0">
          <CardHeader>
            <CardTitle>歷史案件</CardTitle>
          </CardHeader>
          <CasesTable cases={data.cases} />
        </Card>
      </div>
    </AppShell>
  );
}

function Metric({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <p className="text-label-md text-text-tertiary">{title}</p>
        <p className="text-headline-md tabular-nums text-text-primary">{value}</p>
      </CardContent>
    </Card>
  );
}
