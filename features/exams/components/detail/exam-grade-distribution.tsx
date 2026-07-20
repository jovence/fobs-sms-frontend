"use client";

import { useTranslations } from "next-intl";
import { BarChart3 } from "lucide-react";
import { ChartCard } from "@/features/dashboard/components/analytics/chart-card";
import type { ExamGradeDistribution } from "../../types";
import { ExamProgress } from "./exam-progress";

type Grade = keyof ExamGradeDistribution;

const GRADES: readonly Grade[] = ["A", "B", "C", "D", "E"];

/** Per-grade bar tone — E (fail) reads red, the passing bands stay neutral/green. */
const TONE: Record<Grade, "primary" | "success" | "warning" | "danger"> = {
  A: "success",
  B: "success",
  C: "primary",
  D: "warning",
  E: "danger",
};

/** A/B/C/D/E tallies rendered as a labelled bar list (Cameroon /20 grade bands). */
export function ExamGradeDistribution({
  distribution,
}: {
  distribution: ExamGradeDistribution;
}) {
  const t = useTranslations("exams.detail.grades");
  const total = GRADES.reduce((sum, g) => sum + (distribution[g] ?? 0), 0);

  return (
    <ChartCard title={t("title")} icon={<BarChart3 className="size-4" />}>
      {total === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="space-y-4">
          {GRADES.map((grade) => {
            const count = distribution[grade] ?? 0;
            const share = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={grade} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium">{t(`bands.${grade}`)}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {t("count", { count })} · {share.toFixed(0)}%
                  </span>
                </div>
                <ExamProgress value={share} tone={TONE[grade]} />
              </div>
            );
          })}
        </div>
      )}
    </ChartCard>
  );
}
