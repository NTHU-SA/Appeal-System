"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";

import { statusLabels, type CaseStatus } from "@/lib/types";

// One accent colour for every bar; the count is printed on each bar so the
// value never depends on reading the axis.
const tick = { fill: "var(--text-tertiary)", fontSize: 12 };

export function StatusChart({ byStatus }: { byStatus: Record<string, number> }) {
  const data = (["pending", "in_progress", "closed", "rejected"] as CaseStatus[]).map(
    (status) => ({
      name: statusLabels[status],
      value: byStatus[status] || 0,
    })
  );

  return (
    <div className="h-64 w-full">
      <BarChart data={data} width={560} height={240} margin={{ top: 20 }} className="max-w-full">
        <CartesianGrid stroke="var(--border)" vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={tick} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={tick} width={32} />
        <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} isAnimationActive={false}>
          <LabelList dataKey="value" position="top" fill="var(--text-secondary)" fontSize={12} />
        </Bar>
      </BarChart>
    </div>
  );
}
