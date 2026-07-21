"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Series, WorkloadSeries } from "../../types";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const TOOLTIP_STYLE = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  boxShadow: "var(--shadow-lg)",
  fontSize: "12px",
  color: "var(--popover-foreground)",
} as const;

/** Cumulative enrollment over the last 12 months (area). */
export function EnrollmentArea({ series }: { series: Series }) {
  const data = series.labels.map((label, i) => ({ label, value: series.data[i] ?? 0 }));
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -6, bottom: 0 }}>
          <defs>
            <linearGradient id="enroll" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.32} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} width={40} allowDecimals={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "var(--foreground)", fontWeight: 600 }} />
          <Area type="monotone" dataKey="value" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#enroll)" dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--background)" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** A doughnut over a labelled series, with a centered total and a wrapping legend. */
export function DonutChart({
  series,
  colors = CHART_COLORS,
  centerLabel,
}: {
  series: Series;
  colors?: string[];
  centerLabel?: string;
}) {
  const data = series.labels.map((label, i) => ({ name: label, value: series.data[i] ?? 0 }));
  const total = data.reduce((sum, d) => sum + d.value, 0);
  return (
    <div className="relative h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="82%" paddingAngle={2} strokeWidth={0}>
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-x-0 top-[42%] -translate-y-1/2 text-center">
        <div className="font-heading text-2xl font-bold tabular-nums">{total.toLocaleString("en-CM")}</div>
        {centerLabel && <div className="text-muted-foreground text-xs">{centerLabel}</div>}
      </div>
    </div>
  );
}

/** A single-value "gauge" doughnut (e.g. attendance rate, parent engagement). */
export function GaugeDonut({
  value,
  label,
  color = "var(--chart-1)",
}: {
  value: number;
  label: string;
  color?: string;
}) {
  const data = [
    { name: label, value },
    { name: "rest", value: Math.max(0, 100 - value) },
  ];
  return (
    <div className="relative h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius="62%" outerRadius="84%" startAngle={90} endAngle={-270} strokeWidth={0}>
            <Cell fill={color} />
            <Cell fill="var(--muted)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">
        <div className="font-heading text-3xl font-bold tabular-nums">{value.toFixed(1)}%</div>
        <div className="text-muted-foreground text-xs">{label}</div>
      </div>
    </div>
  );
}

/** Grouped bar of subjects vs. classes per teacher. */
export function WorkloadBar({
  series,
  subjectsLabel,
  classesLabel,
}: {
  series: WorkloadSeries;
  subjectsLabel: string;
  classesLabel: string;
}) {
  const data = series.labels.map((label, i) => ({
    label,
    subjects: series.subjects[i] ?? 0,
    classes: series.classes[i] ?? 0,
  }));
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
          <Legend verticalAlign="top" height={28} iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
          <Bar dataKey="subjects" name={subjectsLabel} fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="classes" name={classesLabel} fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Monthly attendance-rate bars (0–100%). */
export function MonthlyAttendanceBar({ series }: { series: Series }) {
  const data = series.labels.map((label, i) => ({ label, value: series.data[i] ?? 0 }));
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} width={40} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "var(--muted)", opacity: 0.4 }} formatter={(v) => [`${v}%`, ""]} />
          <Bar dataKey="value" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
