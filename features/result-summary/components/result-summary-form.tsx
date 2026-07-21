"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  ClipboardList,
  Download,
  FileSpreadsheet,
  Info,
  Loader2,
  School,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState, ErrorState } from "@/components/common/states";
import { Reveal } from "@/components/common/motion";
import { Shimmer } from "@/components/common/skeletons";
import { cn } from "@/lib/utils";
import { ApiError } from "@/types";
import { useResultSummaryOptions, useGenerateResultSummary } from "../hooks";

export function ResultSummaryForm() {
  const t = useTranslations("resultSummary");

  const { data, isLoading, isError, refetch } = useResultSummaryOptions();
  const generate = useGenerateResultSummary();

  const [classId, setClassId] = useState("");
  const [examId, setExamId] = useState("");

  const classes = data?.classes ?? [];
  const exams = data?.exams ?? [];

  const canGenerate = !!classId && !!examId && !generate.isPending;

  async function onGenerate() {
    if (!classId || !examId) {
      toast.error(t("validation.selectBoth"));
      return;
    }
    try {
      await generate.mutateAsync({ classId, examId });
      toast.success(t("toasts.success"));
    } catch (err) {
      // The backend rejects an invalid class/exam pairing with a 422 + message.
      const message = err instanceof ApiError ? err.message : t("toasts.error");
      toast.error(message);
    }
  }

  if (isLoading) return <FormSkeleton />;

  if (isError) {
    return (
      <ErrorState
        title={t("states.loadErrorTitle")}
        description={t("states.loadErrorDescription")}
        retryLabel={t("states.retry")}
        onRetry={() => refetch()}
      />
    );
  }

  const isEmpty = classes.length === 0 && exams.length === 0;

  return (
    <div className="space-y-6">
      {/* Stat tiles */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          icon={<School className="size-4" />}
          label={t("stats.classes")}
          value={String(classes.length)}
        />
        <StatTile
          icon={<ClipboardList className="size-4" />}
          label={t("stats.exams")}
          value={String(exams.length)}
        />
        <StatTile
          icon={<FileSpreadsheet className="size-4" />}
          label={t("stats.format")}
          value={t("stats.formatValue")}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Generator form */}
        <Reveal className="lg:col-span-2">
          <Card className="shadow-[var(--shadow-sm)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="text-muted-foreground size-4" />
                {t("form.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEmpty ? (
                <EmptyState
                  icon={<ClipboardList className="size-6" />}
                  title={t("states.emptyTitle")}
                  description={t("states.emptyDescription")}
                />
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="rs-class">{t("form.class")}</Label>
                      <Select
                        value={classId || undefined}
                        onValueChange={setClassId}
                      >
                        <SelectTrigger id="rs-class" className="w-full">
                          <SelectValue placeholder={t("form.selectClass")} />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rs-exam">{t("form.exam")}</Label>
                      <Select
                        value={examId || undefined}
                        onValueChange={setExamId}
                      >
                        <SelectTrigger id="rs-exam" className="w-full">
                          <SelectValue placeholder={t("form.selectExam")} />
                        </SelectTrigger>
                        <SelectContent>
                          {exams.map((e) => (
                            <SelectItem key={e.id} value={e.id}>
                              {e.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <Button onClick={onGenerate} disabled={!canGenerate}>
                      {generate.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Download className="size-4" />
                      )}
                      {generate.isPending ? t("form.generating") : t("form.generate")}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </Reveal>

        {/* Info panel */}
        <Reveal>
          <Card className="bg-muted/30 h-full shadow-[var(--shadow-sm)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="text-muted-foreground size-4" />
                {t("info.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3 text-sm">
                {t("info.description")}
              </p>
              <ul className="space-y-2 text-sm">
                {(["item1", "item2", "item3", "item4"] as const).map((key) => (
                  <li key={key} className="flex items-start gap-2">
                    <span className="bg-primary mt-1.5 size-1.5 shrink-0 rounded-full" />
                    <span className="text-foreground/90">{t(`info.${key}`)}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-card flex items-center gap-3 rounded-xl border px-4 py-3 shadow-[var(--shadow-sm)]">
      <span
        className={cn(
          "bg-primary/10 text-primary grid size-9 shrink-0 place-items-center rounded-lg",
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-muted-foreground truncate text-xs">{label}</p>
        <p className="text-lg font-semibold tabular-nums">{value}</p>
      </div>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading">
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Shimmer key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Shimmer className="h-56 w-full rounded-xl lg:col-span-2" />
        <Shimmer className="h-56 w-full rounded-xl" />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
