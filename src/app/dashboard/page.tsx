import { Search } from "lucide-react";

import { requireStaff } from "@/lib/auth";
import { getDashboardData } from "@/lib/data";
import { AppShell } from "@/components/layout/app-shell";
import { CasesTable } from "@/components/dashboard/cases-table";
import { StatusChart } from "@/components/dashboard/status-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">儀表板</h2>
          <p className="text-sm text-muted-foreground">
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
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">近 7 日</SelectItem>
                    <SelectItem value="14">近 14 日</SelectItem>
                    <SelectItem value="30">近 30 日</SelectItem>
                    <SelectItem value="90">近 90 日</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input name="q" defaultValue={query} placeholder="搜尋關鍵字" className="pl-9" />
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>歷史案件</CardTitle>
          </CardHeader>
          <CardContent>
            <CasesTable cases={data.cases} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function Metric({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
