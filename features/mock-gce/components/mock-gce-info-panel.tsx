"use client";

import { useTranslations } from "next-intl";
import { AlertCircle, Info } from "lucide-react";
import { Link } from "@/i18n/navigation";

/** The "How this works" explainer, with an inline warning when no 6th-sequence exam exists. */
export function MockGceInfoPanel({
  academicYear,
  hasSequenceSixExam,
}: {
  academicYear: string;
  hasSequenceSixExam: boolean;
}) {
  const t = useTranslations("mockGce");
  const points = t.raw("info.points") as string[];

  return (
    <div className="flex items-start gap-4 rounded-xl border bg-card p-5 shadow-[var(--shadow-sm)]">
      <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Info className="size-5" />
      </div>
      <div className="flex-1 space-y-1">
        <p className="font-heading font-semibold">{t("info.title")}</p>
        <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
          {points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        {!hasSequenceSixExam && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>
              {t("info.noExam", { year: academicYear })}{" "}
              <Link href="/exams" className="font-semibold underline underline-offset-2">
                {t("info.examsLink")}
              </Link>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
