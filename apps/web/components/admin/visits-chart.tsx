"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

export interface VisitsChartPoint {
  date: string;
  views: number;
  visitors: number;
}

const VIEWS_COLOR = "#7c3aed"; // brand-600
const VISITORS_COLOR = "#f59e0b"; // amber-500 — deliberately distinct from every brand-purple accent elsewhere on the dashboard, so the two series read apart at a glance

// Isolated as its own client component since recharts needs the DOM/canvas
// APIs — the dashboard page itself stays a Server Component and just passes
// the already-queried data in. Two series (total views vs. deduplicated
// unique visitors, see PageView.visitorId) rather than one line, so the gap
// between them is visible at a glance.
export function VisitsChart({ data }: { data: VisitsChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={VIEWS_COLOR} stopOpacity={0.3} />
            <stop offset="100%" stopColor={VIEWS_COLOR} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="visitorsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={VISITORS_COLOR} stopOpacity={0.3} />
            <stop offset="100%" stopColor={VISITORS_COLOR} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-neutral-200 admin-dark:text-neutral-800" />
        <XAxis
          dataKey="date"
          tickFormatter={(value: string) =>
            new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" })
          }
          tick={{ fontSize: 11 }}
          interval={4}
          axisLine={false}
          tickLine={false}
          className="text-neutral-500 admin-dark:text-neutral-400"
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11 }}
          width={28}
          axisLine={false}
          tickLine={false}
          className="text-neutral-500 admin-dark:text-neutral-400"
        />
        <Tooltip
          labelFormatter={(value) => (typeof value === "string" ? new Date(value).toLocaleDateString() : value)}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e5e5" }}
        />
        <Legend
          verticalAlign="top"
          height={28}
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12 }}
        />
        <Area
          name="Views"
          type="monotone"
          dataKey="views"
          stroke={VIEWS_COLOR}
          strokeWidth={2}
          fill="url(#viewsFill)"
        />
        <Area
          name="Unique visitors"
          type="monotone"
          dataKey="visitors"
          stroke={VISITORS_COLOR}
          strokeWidth={2}
          fill="url(#visitorsFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
