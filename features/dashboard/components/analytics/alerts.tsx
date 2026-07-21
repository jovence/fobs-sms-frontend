"use client";

import { AlertTriangle, CheckCircle2, Users } from "lucide-react";
import type { DashboardAnalytics } from "../../types";

type Tone = "warning" | "info" | "success";

const TONE: Record<Tone, string> = {
  warning: "border-warning/40 bg-warning/10 text-warning-foreground",
  info: "border-info/40 bg-info/10 text-info-foreground",
  success: "border-success/40 bg-success/10 text-success-foreground",
};

/**
 * Conditional health alerts mirroring the old dashboard: low overall attendance,
 * weak parent engagement, classes needing attention — or an all-clear when healthy.
 */
export function DashboardAlerts({
  analytics,
  labels,
}: {
  analytics: DashboardAnalytics;
  labels: {
    lowAttendanceTitle: string;
    lowAttendanceBody: string;
    engagementTitle: string;
    engagementBody: string;
    healthyTitle: string;
    healthyBody: string;
  };
}) {
  const alerts: { tone: Tone; icon: typeof AlertTriangle; title: string; body: string }[] = [];

  if (analytics.metrics.attendanceRate > 0 && analytics.metrics.attendanceRate < 80) {
    alerts.push({
      tone: "warning",
      icon: AlertTriangle,
      title: labels.lowAttendanceTitle,
      body: labels.lowAttendanceBody,
    });
  }
  if (analytics.parentStats.connectionRate < 60) {
    alerts.push({
      tone: "info",
      icon: Users,
      title: labels.engagementTitle,
      body: labels.engagementBody,
    });
  }
  if (alerts.length === 0) {
    alerts.push({
      tone: "success",
      icon: CheckCircle2,
      title: labels.healthyTitle,
      body: labels.healthyBody,
    });
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {alerts.map((a) => (
        <div key={a.title} className={`flex items-start gap-3 rounded-xl border p-4 ${TONE[a.tone]}`}>
          <a.icon className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">{a.title}</p>
            <p className="text-sm opacity-90">{a.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
