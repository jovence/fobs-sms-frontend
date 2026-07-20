"use client";

import { useTranslations } from "next-intl";
import { ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExamFlagBadge } from "../exam-flag-badge";
import type { ExamSubjectStat } from "../../types";
import { ExamProgress, completionTone } from "./exam-progress";

/** One subject block: overall stats + a per-class completion breakdown with progress bars. */
function SubjectBlock({ subject }: { subject: ExamSubjectStat }) {
  const t = useTranslations("exams.detail.subjects");

  return (
    <div className="rounded-xl border bg-background/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium">{subject.subjectName}</p>
          {subject.subjectCode && (
            <p className="text-xs text-muted-foreground uppercase">{subject.subjectCode}</p>
          )}
        </div>
        <ExamFlagBadge
          active={subject.submitted}
          activeLabel={t("submitted")}
          inactiveLabel={t("incomplete")}
        />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">{t("marksEntered")}</p>
          <p className="font-medium tabular-nums">
            {subject.marksEntered}/{subject.totalExpected}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t("average")}</p>
          <p className="font-medium tabular-nums">{subject.averageMark.toFixed(2)}/20</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t("passRate")}</p>
          <p className="font-medium tabular-nums">{subject.passRate.toFixed(1)}%</p>
        </div>
      </div>

      {subject.classBreakdown.length > 0 && (
        <div className="mt-4 space-y-2.5">
          {subject.classBreakdown.map((klass) => (
            <div key={klass.classId} className="space-y-1">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-medium">{klass.className}</span>
                <span className="tabular-nums text-muted-foreground">
                  {klass.marksEntered}/{klass.totalStudents} · {klass.completionRate.toFixed(0)}%
                </span>
              </div>
              <ExamProgress
                value={klass.completionRate}
                tone={completionTone(klass.completionRate)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Subject Submission Status by Class — a card grid of every subject in the exam. */
export function ExamSubjectSubmission({
  subjects,
}: {
  subjects: ExamSubjectStat[];
}) {
  const t = useTranslations("exams.detail.subjects");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardList className="size-4" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {subjects.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{t("empty")}</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {subjects.map((subject) => (
              <SubjectBlock key={subject.subjectId} subject={subject} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
