"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export interface VisitsChartPoint {
  date: string;
  count: number;
}

// Isolated as its own client component since recharts needs the DOM/canvas
// APIs — the dashboard page itself stays a Server Component and just passes
// the already-queried data in.
export function VisitsChart({ data }: { data: VisitsChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="visitsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-brand-600, #7c3aed)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--color-brand-600, #7c3aed)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-800" />
        <XAxis
          dataKey="date"
          tickFormatter={(value: string) =>
            new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" })
          }
          tick={{ fontSize: 11 }}
          interval={4}
          className="text-neutral-500 dark:text-neutral-400"
        />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} className="text-neutral-500 dark:text-neutral-400" />
        <Tooltip
          labelFormatter={(value) => (typeof value === "string" ? new Date(value).toLocaleDateString() : value)}
          formatter={(value) => [value, "Views"]}
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#7c3aed"
          strokeWidth={2}
          fill="url(#visitsFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
