"use client";

import { useTranslations } from "next-intl";
import { Users } from "lucide-react";
import { ChartCard } from "@/features/dashboard/components/analytics/chart-card";
import type { ExamClassPerformance } from "../../types";

/** Class Performance table: students, marks entered, average (/20) and pass rate per class. */
export function ExamClassPerformanceTable({
  rows,
}: {
  rows: ExamClassPerformance[];
}) {
  const t = useTranslations("exams.detail.classPerf");

  return (
    <ChartCard title={t("title")} icon={<Users className="size-4" />}>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                <th className="pb-2 font-medium">{t("class")}</th>
                <th className="pb-2 text-right font-medium">{t("students")}</th>
                <th className="pb-2 text-right font-medium">{t("marksEntered")}</th>
                <th className="pb-2 text-right font-medium">{t("average")}</th>
                <th className="pb-2 text-right font-medium">{t("passRate")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.classId} className="border-b last:border-0">
                  <td className="py-2.5 font-medium whitespace-nowrap">{row.className}</td>
                  <td className="py-2.5 text-right tabular-nums">{row.studentsCount}</td>
                  <td className="py-2.5 text-right tabular-nums text-muted-foreground">
                    {row.totalMarks}
                  </td>
                  <td className="py-2.5 text-right font-medium tabular-nums">
                    {row.averageMark.toFixed(2)}/20
                  </td>
                  <td className="py-2.5 text-right tabular-nums">{row.passRate.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ChartCard>
  );
}
