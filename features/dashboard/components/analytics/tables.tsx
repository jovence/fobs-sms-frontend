"use client";

import type {
  ClassAttendanceRow,
  ClassEngagementRow,
  ClassPerformanceRow,
  RecentParentRow,
} from "../../types";

const MEDALS = ["🥇", "🥈", "🥉"];

function Empty({ label }: { label: string }) {
  return <p className="text-muted-foreground py-6 text-center text-sm">{label}</p>;
}

function Bar({ value, tone = "primary" }: { value: number; tone?: "primary" | "success" | "warning" }) {
  const color = tone === "success" ? "bg-success" : tone === "warning" ? "bg-warning" : "bg-primary";
  return (
    <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

/** Top performing classes by average mark (/20). */
export function TopClassesTable({
  rows,
  labels,
}: {
  rows: ClassPerformanceRow[];
  labels: { class: string; teacher: string; average: string; empty: string };
}) {
  if (rows.length === 0) return <Empty label={labels.empty} />;
  const max = Math.max(...rows.map((r) => r.average), 20);
  return (
    <div className="space-y-3">
      {rows.map((r, i) => (
        <div key={r.name} className="flex items-center gap-3">
          <span className="w-6 text-center text-lg">{MEDALS[i] ?? i + 1}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="truncate font-medium">{r.name}</span>
              <span className="tabular-nums">{r.average.toFixed(1)}/20</span>
            </div>
            <p className="text-muted-foreground truncate text-xs">{r.teacher}</p>
            <div className="mt-1">
              <Bar value={(r.average / max) * 100} tone="success" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Attendance rate per class this month. */
export function AttendanceByClassTable({
  rows,
  labels,
}: {
  rows: ClassAttendanceRow[];
  labels: { class: string; students: string; rate: string; empty: string };
}) {
  if (rows.length === 0) return <Empty label={labels.empty} />;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-muted-foreground border-b text-left text-xs uppercase">
          <th className="pb-2 font-medium">{labels.class}</th>
          <th className="pb-2 text-right font-medium">{labels.students}</th>
          <th className="pb-2 text-right font-medium">{labels.rate}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.name} className="border-b last:border-0">
            <td className="py-2 font-medium">{r.name}</td>
            <td className="py-2 text-right tabular-nums">{r.studentCount}</td>
            <td className="py-2 text-right tabular-nums">{r.rate.toFixed(1)}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Classes with the lowest parent-connection rate. */
export function EngagementTable({
  rows,
  labels,
}: {
  rows: ClassEngagementRow[];
  labels: { class: string; connected: string; rate: string; healthy: string };
}) {
  if (rows.length === 0) return <Empty label={labels.healthy} />;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-muted-foreground border-b text-left text-xs uppercase">
          <th className="pb-2 font-medium">{labels.class}</th>
          <th className="pb-2 text-right font-medium">{labels.connected}</th>
          <th className="pb-2 text-right font-medium">{labels.rate}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.name} className="border-b last:border-0">
            <td className="py-2 font-medium">{r.name}</td>
            <td className="py-2 text-right tabular-nums">
              {r.connected}/{r.total}
            </td>
            <td className="py-2 text-right tabular-nums">{r.rate.toFixed(1)}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Most recently connected parents. */
export function RecentParentsTable({
  rows,
  labels,
}: {
  rows: RecentParentRow[];
  labels: { parent: string; students: string; joined: string; empty: string };
}) {
  if (rows.length === 0) return <Empty label={labels.empty} />;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-muted-foreground border-b text-left text-xs uppercase">
          <th className="pb-2 font-medium">{labels.parent}</th>
          <th className="pb-2 text-right font-medium">{labels.students}</th>
          <th className="pb-2 text-right font-medium">{labels.joined}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={`${r.email}-${i}`} className="border-b last:border-0">
            <td className="py-2">
              <div className="font-medium">{r.name}</div>
              <div className="text-muted-foreground text-xs">{r.email}</div>
            </td>
            <td className="py-2 text-right tabular-nums">{r.studentsCount}</td>
            <td className="text-muted-foreground py-2 text-right text-xs">{r.registeredAt}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
