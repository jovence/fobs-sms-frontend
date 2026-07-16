"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  CheckCircle2,
  ClipboardList,
  Gauge,
  Loader2,
  Save,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState, ErrorState } from "@/components/common/states";
import { Reveal, Stagger, StaggerItem } from "@/components/common/motion";
import { Shimmer } from "@/components/common/skeletons";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";
import { useEntryRoster, useSaveMarks } from "../hooks";
import { useClassOptions, useSubjectOptions } from "@/features/academics/hooks";
import { useExamOptions } from "@/features/exams/hooks";
import { MARK_MAX, PASS_MARK, type EntrySelection } from "../types";
import { validateMark } from "../schemas";

export function MarkEntry() {
  const t = useTranslations("reports");
  const te = useTranslations("reports.entry");
  const teErrors = useTranslations("reports.entry.errors");

  const { data: classes = [] } = useClassOptions();
  const { data: subjects = [] } = useSubjectOptions();
  const { data: exams = [] } = useExamOptions();
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [examId, setExamId] = useState("");
  const [marks, setMarks] = useState<Record<string, string>>({});

  const selection: EntrySelection | null =
    classId && subjectId && examId ? { classId, subjectId, examId } : null;

  const { data: roster, isLoading, isError, refetch } =
    useEntryRoster(selection);
  const saveMarks = useSaveMarks();

  // Seed the local mark inputs ONCE per selection. A post-save refetch returns the same
  // selection, so we must NOT reseed then — that would wipe marks the teacher typed after
  // saving. Keyed on the class/subject/exam selection, not the roster reference.
  const seededKey = useRef<string | null>(null);
  useEffect(() => {
    if (!roster || !selection) return;
    const key = `${selection.classId}|${selection.subjectId}|${selection.examId}`;
    if (seededKey.current === key) return;
    seededKey.current = key;
    setMarks(
      Object.fromEntries(roster.map((s) => [s.id, s.mark == null ? "" : String(s.mark)])),
    );
  }, [roster, selection]);

  const validation = useMemo(() => {
    const errors: Record<string, string> = {};
    const values: number[] = [];
    for (const [id, raw] of Object.entries(marks)) {
      if (raw.trim() === "") continue; // not entered yet — not an error
      const result = validateMark(raw, teErrors);
      if (result.ok) values.push(result.value);
      else errors[id] = result.error;
    }
    const enteredCount = values.length;
    const average = enteredCount
      ? values.reduce((sum, v) => sum + v, 0) / enteredCount
      : 0;
    const passCount = values.filter((v) => v >= PASS_MARK).length;
    const passRate = enteredCount ? (passCount / enteredCount) * 100 : 0;
    return {
      errors,
      hasErrors: Object.keys(errors).length > 0,
      enteredCount,
      average,
      passRate,
    };
  }, [marks, teErrors]);

  const total = roster?.length ?? 0;
  const canSave =
    !!selection &&
    validation.enteredCount > 0 &&
    !validation.hasErrors &&
    !saveMarks.isPending;

  async function onSave() {
    if (!selection) return;
    const payload = Object.entries(marks)
      .filter(([, raw]) => raw.trim() !== "")
      .map(([studentId, raw]) => ({ studentId, mark: Number(raw) }))
      .filter((m) => !Number.isNaN(m.mark));
    try {
      await saveMarks.mutateAsync({ ...selection, marks: payload });
      toast.success(t("toasts.marksSaved", { count: payload.length }));
    } catch {
      toast.error(t("toasts.saveError"));
    }
  }

  return (
    <div className="space-y-4">
      {/* Selectors */}
      <Reveal>
        <Card className="card-interactive shadow-[var(--shadow-sm)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="size-4 text-muted-foreground" />
              {te("selectorsTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="me-class">{te("class")}</Label>
              <Select value={classId || undefined} onValueChange={setClassId}>
                <SelectTrigger id="me-class" className="w-full">
                  <SelectValue placeholder={te("selectClass")} />
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
              <Label htmlFor="me-subject">{te("subject")}</Label>
              <Select value={subjectId || undefined} onValueChange={setSubjectId}>
                <SelectTrigger id="me-subject" className="w-full">
                  <SelectValue placeholder={te("selectSubject")} />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="me-exam">{te("exam")}</Label>
              <Select value={examId || undefined} onValueChange={setExamId}>
                <SelectTrigger id="me-exam" className="w-full">
                  <SelectValue placeholder={te("selectExam")} />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </Reveal>

      {/* Roster / states */}
      {!selection ? (
        <EmptyState
          icon={<ClipboardList className="size-6" />}
          title={te("prompt.title")}
          description={te("prompt.description")}
        />
      ) : isError ? (
        <ErrorState
          title={te("error.title")}
          description={te("error.description")}
          retryLabel={t("retry")}
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <RosterSkeleton />
      ) : total === 0 ? (
        <EmptyState
          icon={<Users className="size-6" />}
          title={te("emptyRoster.title")}
          description={te("emptyRoster.description")}
        />
      ) : (
        <>
          {/* Live summary */}
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryTile
              icon={<Gauge className="size-4" />}
              label={te("summary.average")}
              value={
                validation.enteredCount
                  ? `${validation.average.toFixed(1)} / ${MARK_MAX}`
                  : "—"
              }
            />
            <SummaryTile
              icon={<CheckCircle2 className="size-4" />}
              label={te("summary.passRate")}
              value={
                validation.enteredCount
                  ? `${validation.passRate.toFixed(0)}%`
                  : "—"
              }
              tone={
                validation.enteredCount && validation.passRate >= 50
                  ? "success"
                  : "default"
              }
            />
            <SummaryTile
              icon={<Users className="size-4" />}
              label={te("summary.entered")}
              value={`${validation.enteredCount} / ${total}`}
            />
          </div>

          <Card className="shadow-[var(--shadow-sm)]">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center justify-between gap-2">
                <span>{te("rosterTitle")}</span>
                <span className="text-xs font-normal text-muted-foreground tabular-nums">
                  {te("outOf", { max: MARK_MAX })}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Stagger className="divide-y">
                {roster!.map((student, index) => {
                  const error = validation.errors[student.id];
                  return (
                    <StaggerItem key={student.id}>
                      <div className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/40">
                        <span className="w-6 shrink-0 text-xs text-muted-foreground tabular-nums">
                          {index + 1}
                        </span>
                        <Avatar className="size-9 shrink-0 border">
                          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                            {initials(student.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {student.fullName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground tabular-nums">
                            {student.matricule ?? "—"}
                          </p>
                        </div>
                        <div className="w-24 shrink-0 text-right">
                          <Label
                            htmlFor={`mark-${student.id}`}
                            className="sr-only"
                          >
                            {te("markFor", { name: student.fullName })}
                          </Label>
                          <Input
                            id={`mark-${student.id}`}
                            type="number"
                            inputMode="decimal"
                            min={0}
                            max={MARK_MAX}
                            step={0.25}
                            value={marks[student.id] ?? ""}
                            aria-invalid={!!error}
                            aria-label={te("markFor", {
                              name: student.fullName,
                            })}
                            onChange={(e) =>
                              setMarks((prev) => ({
                                ...prev,
                                [student.id]: e.target.value,
                              }))
                            }
                            className={cn(
                              "text-right tabular-nums",
                              error && "border-destructive",
                            )}
                          />
                        </div>
                      </div>
                      {error && (
                        <p className="px-4 pb-2 pl-[4.75rem] text-xs text-destructive">
                          {error}
                        </p>
                      )}
                    </StaggerItem>
                  );
                })}
              </Stagger>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3">
            {validation.hasErrors && (
              <p role="alert" className="text-sm text-destructive">{te("errors.fix")}</p>
            )}
            <Button onClick={onSave} disabled={!canSave}>
              {saveMarks.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {te("save")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryTile({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "default" | "success";
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-[var(--shadow-sm)]">
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-lg",
          tone === "success"
            ? "bg-success/10 text-success"
            : "bg-primary/10 text-primary",
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold tabular-nums">{value}</p>
      </div>
    </div>
  );
}

function RosterSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading roster">
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Shimmer key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
      <div className="rounded-xl border bg-card p-4 shadow-[var(--shadow-sm)]">
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Shimmer className="size-9 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Shimmer className="h-3.5 w-40" />
                <Shimmer className="h-3 w-24" />
              </div>
              <Shimmer className="h-9 w-24 rounded-md" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
