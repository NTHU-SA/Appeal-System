"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { statusLabels, type CaseStatus } from "@/lib/types";

export function StatusChart({ byStatus }: { byStatus: Record<string, number> }) {
  const data = (["pending", "in_progress", "closed", "rejected"] as CaseStatus[]).map(
    (status) => ({
      name: statusLabels[status],
      value: byStatus[status] || 0,
    })
  );

  return (
    <div className="h-64 w-full">
      <BarChart data={data} width={560} height={240} className="max-w-full">
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
        <Bar dataKey="value" fill="var(--primary)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </div>
  );
}
