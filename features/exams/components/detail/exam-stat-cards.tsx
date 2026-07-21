"use client";

import { useLocale, useTranslations } from "next-intl";
import { BookOpen, CheckCircle2, GaugeCircle, Star } from "lucide-react";
import { formatNumber } from "@/lib/format";
import { StatCard } from "@/features/dashboard/components/stat-card";
import type { ExamDashboard } from "../../types";

/** The four headline metrics: subjects, completion, average mark (/20) and pass rate. */
export function ExamStatCards({ dashboard }: { dashboard: ExamDashboard }) {
  const t = useTranslations("exams.detail.stats");
  const locale = useLocale();

  const oneDp = (n: number) => n.toFixed(1);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label={t("totalSubjects")}
        value={dashboard.totalSubjects}
        icon={BookOpen}
        accent="primary"
        format={(n) => formatNumber(Math.round(n), locale)}
      />
      <StatCard
        label={t("completionRate")}
        value={dashboard.completionRate}
        icon={GaugeCircle}
        accent="info"
        format={oneDp}
        suffix="%"
      />
      <StatCard
        label={t("averageMark")}
        value={dashboard.averageMark}
        icon={Star}
        accent="warning"
        format={oneDp}
        suffix="/20"
      />
      <StatCard
        label={t("passRate")}
        value={dashboard.passRate}
        icon={CheckCircle2}
        accent="success"
        format={oneDp}
        suffix="%"
      />
    </div>
  );
}
