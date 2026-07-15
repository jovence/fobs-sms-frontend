"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { platformGrowth } from "../mock-data";

export function PlatformGrowthChart() {
  return (
    <div className="h-64 w-full" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={platformGrowth} accessibilityLayer={false} margin={{ top: 8, right: 8, left: -6, bottom: 0 }}>
          <defs>
            <linearGradient id="pgrowth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.32} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={52}
            tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`)}
          />
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              boxShadow: "var(--shadow-lg)",
              fontSize: "12px",
              color: "var(--popover-foreground)",
            }}
            labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
          />
          <Area
            type="monotone"
            dataKey="users"
            stroke="var(--chart-1)"
            strokeWidth={2.5}
            fill="url(#pgrowth)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--background)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
