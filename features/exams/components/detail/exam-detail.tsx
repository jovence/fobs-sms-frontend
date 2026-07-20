"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  ArrowLeft,
  Lock,
  LockOpen,
  Pencil,
  Send,
  Undo2,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/common/states";
import { Shimmer } from "@/components/common/skeletons";
import {
  useExamDashboard,
  useToggleMarkFill,
  useTogglePublish,
} from "../../hooks";
import { ExamTermBadge } from "../exam-term-badge";
import { ExamFlagBadge } from "../exam-flag-badge";
import { ExamFormSheet } from "../exam-form-sheet";
import { ExamStatCards } from "./exam-stat-cards";
import { ExamGradeDistribution } from "./exam-grade-distribution";
import { ExamClassPerformanceTable } from "./exam-class-performance";
import { ExamSubjectSubmission } from "./exam-subject-submission";

/** Exam detail / analytics dashboard — header, stat cards, grades, class & subject breakdowns. */
export function ExamDetail({ id }: { id: string }) {
  const t = useTranslations("exams.detail");
  const [editOpen, setEditOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useExamDashboard(id);
  const togglePublish = useTogglePublish();
  const toggleMarkFill = useToggleMarkFill();

  if (isLoading) {
    return (
      <div className="space-y-6" role="status" aria-label={t("loading")}>
        <Shimmer className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Shimmer key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <Shimmer className="h-72 w-full rounded-xl" />
        <span className="sr-only">{t("loading")}</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-6">
        <BackLink label={t("back")} />
        <ErrorState
          title={t("errorTitle")}
          description={t("errorDescription")}
          onRetry={() => refetch()}
          retryLabel={t("retry")}
        />
      </div>
    );
  }

  const { exam } = data;

  async function onTogglePublish() {
    const next = !exam.published;
    await togglePublish.mutateAsync(exam.id);
    toast.success(next ? t("toasts.published") : t("toasts.unpublished"));
  }

  async function onToggleMarkFill() {
    const next = !exam.markEntryAllowed;
    await toggleMarkFill.mutateAsync(exam.id);
    toast.success(next ? t("toasts.markOpened") : t("toasts.markClosed"));
  }

  return (
    <div className="space-y-6">
      <BackLink label={t("back")} />

      {/* Header: name, term/year, live status pills, and the row actions. */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="font-heading text-2xl font-bold tracking-tight">{exam.name}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <ExamTermBadge term={exam.term} />
            <span className="text-sm tabular-nums text-muted-foreground">
              {exam.academicYear}
            </span>
            <ExamFlagBadge
              active={exam.published}
              activeLabel={t("statusPublished")}
              inactiveLabel={t("statusUnpublished")}
            />
            <ExamFlagBadge
              active={exam.markEntryAllowed}
              activeLabel={t("statusMarkOpen")}
              inactiveLabel={t("statusMarkClosed")}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleMarkFill}
            disabled={toggleMarkFill.isPending}
          >
            {exam.markEntryAllowed ? <Lock /> : <LockOpen />}
            {exam.markEntryAllowed ? t("closeMarkEntry") : t("openMarkEntry")}
          </Button>
          <Button
            variant={exam.published ? "outline" : "default"}
            size="sm"
            onClick={onTogglePublish}
            disabled={togglePublish.isPending}
          >
            {exam.published ? <Undo2 /> : <Send />}
            {exam.published ? t("unpublish") : t("publish")}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setEditOpen(true)}>
            <Pencil /> {t("edit")}
          </Button>
        </div>
      </header>

      <ExamStatCards dashboard={data} />

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <ExamGradeDistribution distribution={data.gradeDistribution} />
        </div>
        <div className="lg:col-span-3">
          <ExamClassPerformanceTable rows={data.classes} />
        </div>
      </div>

      <ExamSubjectSubmission subjects={data.subjects} />

      <ExamFormSheet open={editOpen} onOpenChange={setEditOpen} exam={exam} />
    </div>
  );
}

function BackLink({ label }: { label: string }) {
  return (
    <Button variant="ghost" size="sm" asChild className="-ml-2 w-fit text-muted-foreground">
      <Link href="/exams">
        <ArrowLeft /> {label}
      </Link>
    </Button>
  );
}
