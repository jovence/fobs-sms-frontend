"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  CalendarRange,
  CheckCircle2,
  Download,
  FileText,
  GraduationCap,
  Layers,
  Loader2,
  TriangleAlert,
  Users,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState, ErrorState } from "@/components/common/states";
import { Reveal } from "@/components/common/motion";
import { Shimmer } from "@/components/common/skeletons";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";
import {
  useDownloadAllReports,
  useDownloadStudentReport,
  useGenerateReport,
  useReportIndex,
  useReportPreview,
} from "../hooks";
import type { ReportMode, ReportParams, ReportPreviewStudent } from "../types";

const ALL_CLASSES = "all";

export function ReportCardsPanel() {
  const tc = useTranslations("reports.cards");
  return (
    <Tabs defaultValue="term" className="space-y-4">
      <TabsList>
        <TabsTrigger value="term" className="gap-1.5">
          <CalendarRange className="size-4" /> {tc("modes.term")}
        </TabsTrigger>
        <TabsTrigger value="sequence" className="gap-1.5">
          <Layers className="size-4" /> {tc("modes.sequence")}
        </TabsTrigger>
        <TabsTrigger value="annual" className="gap-1.5">
          <GraduationCap className="size-4" /> {tc("modes.annual")}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="term">
        <ReportCardsMode mode="term" />
      </TabsContent>
      <TabsContent value="sequence">
        <ReportCardsMode mode="sequence" />
      </TabsContent>
      <TabsContent value="annual">
        <ReportCardsMode mode="annual" />
      </TabsContent>
    </Tabs>
  );
}

function ReportCardsMode({ mode }: { mode: ReportMode }) {
  const t = useTranslations("reports");
  const tc = useTranslations("reports.cards");

  const { data: index } = useReportIndex();
  const classes = index?.classes ?? [];

  const [term, setTerm] = useState("1");
  const [sequence, setSequence] = useState("1");
  const [classId, setClassId] = useState<string>(ALL_CLASSES);
  const [submitted, setSubmitted] = useState<ReportParams | null>(null);

  const generate = useGenerateReport(mode);
  const downloadAll = useDownloadAllReports(mode);
  const downloadStudent = useDownloadStudentReport(mode);

  // Derived from the selectors (no set-state-in-effect) — used for preview,
  // generation and downloads alike.
  const params: ReportParams = useMemo(
    () => ({
      ...(mode === "term" ? { term: Number(term) } : {}),
      ...(mode === "sequence" ? { sequence: Number(sequence) } : {}),
      ...(classId !== ALL_CLASSES ? { classId } : {}),
    }),
    [mode, term, sequence, classId],
  );

  const { data: preview, isLoading, isError, isFetching, refetch } =
    useReportPreview(mode, submitted);

  // The academic year for downloads (part of the URL). The preview carries the
  // authoritative value; fall back to the index's current year before any preview.
  const academicYear = preview?.academicYear ?? index?.currentAcademicYear ?? "";

  const missingCount = preview?.students.filter((s) => s.missing).length ?? 0;
  const completeCount = (preview?.students.length ?? 0) - missingCount;

  function onPreview() {
    setSubmitted(params);
  }

  async function onGenerate() {
    try {
      const res = await generate.mutateAsync(params);
      toast.success(res.message?.trim() ? res.message : tc("toasts.generated"));
    } catch {
      toast.error(tc("toasts.generateError"));
    }
  }

  async function onDownloadAll() {
    if (!academicYear) return;
    try {
      await downloadAll.mutateAsync({ ...params, academicYear });
      toast.success(tc("toasts.downloadStarted"));
    } catch {
      toast.error(tc("toasts.downloadError"));
    }
  }

  async function onDownloadStudent(student: ReportPreviewStudent) {
    if (!academicYear) return;
    try {
      await downloadStudent.mutateAsync({
        ...params,
        academicYear,
        studentId: student.id,
      });
    } catch {
      toast.error(tc("toasts.downloadError"));
    }
  }

  const busy = generate.isPending || downloadAll.isPending;

  return (
    <div className="space-y-4">
      <Reveal>
        <Card className="shadow-[var(--shadow-sm)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="text-muted-foreground size-4" />
              {tc(`descriptions.${mode}`)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-end gap-3">
              {mode === "term" && (
                <div className="space-y-2">
                  <Label htmlFor={`rc-term-${mode}`}>{tc("term.label")}</Label>
                  <Select value={term} onValueChange={setTerm}>
                    <SelectTrigger id={`rc-term-${mode}`} className="w-44">
                      <SelectValue placeholder={tc("term.placeholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">{tc("term.first")}</SelectItem>
                      <SelectItem value="2">{tc("term.second")}</SelectItem>
                      <SelectItem value="3">{tc("term.third")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {mode === "sequence" && (
                <div className="space-y-2">
                  <Label htmlFor={`rc-seq-${mode}`}>{tc("sequence.label")}</Label>
                  <Select value={sequence} onValueChange={setSequence}>
                    <SelectTrigger id={`rc-seq-${mode}`} className="w-44">
                      <SelectValue placeholder={tc("sequence.placeholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {tc("sequence.option", { n })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor={`rc-class-${mode}`}>{tc("classLabel")}</Label>
                <Select value={classId} onValueChange={setClassId}>
                  <SelectTrigger id={`rc-class-${mode}`} className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_CLASSES}>{t("allClasses")}</SelectItem>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={onPreview} disabled={isFetching}>
                {isFetching ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Users className="size-4" />
                )}
                {tc("preview")}
              </Button>
            </div>

            {mode === "annual" && (
              <p className="text-muted-foreground text-sm">{tc("annualNote")}</p>
            )}
            {academicYear && (
              <p className="text-muted-foreground text-xs">
                {tc("academicYear", { year: academicYear })}
              </p>
            )}
          </CardContent>
        </Card>
      </Reveal>

      {!submitted ? (
        <EmptyState
          icon={<FileText className="size-6" />}
          title={tc("empty.title")}
          description={tc("empty.description")}
        />
      ) : isError ? (
        <ErrorState
          title={tc("error.title")}
          description={tc("error.description")}
          retryLabel={t("retry")}
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <PreviewSkeleton />
      ) : !preview || preview.students.length === 0 ? (
        <EmptyState
          icon={<Users className="size-6" />}
          title={tc("emptyStudents.title")}
          description={tc("emptyStudents.description")}
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryTile
              icon={<Users className="size-4" />}
              label={tc("summary.students")}
              value={String(preview.students.length)}
            />
            <SummaryTile
              icon={<CheckCircle2 className="size-4" />}
              label={tc("summary.complete")}
              value={String(completeCount)}
              tone="success"
            />
            <SummaryTile
              icon={<TriangleAlert className="size-4" />}
              label={tc("summary.missing")}
              value={String(missingCount)}
              tone={missingCount > 0 ? "warning" : "default"}
            />
          </div>

          {missingCount > 0 && (
            <div
              role="alert"
              className="bg-warning/10 text-warning ring-warning/25 flex items-start gap-2 rounded-xl px-4 py-3 text-sm ring-1 ring-inset"
            >
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              <span>
                {tc("missingWarning", {
                  count: missingCount,
                  total: preview.students.length,
                })}
              </span>
            </div>
          )}

          <Card className="shadow-[var(--shadow-sm)]">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10 text-right">
                        {tc("table.index")}
                      </TableHead>
                      <TableHead>{tc("table.student")}</TableHead>
                      <TableHead>{tc("table.class")}</TableHead>
                      <TableHead className="text-right">{tc("table.marked")}</TableHead>
                      <TableHead>{tc("table.status")}</TableHead>
                      <TableHead className="text-right">
                        <span className="sr-only">{tc("download")}</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.students.map((s, i) => (
                      <TableRow
                        key={s.id}
                        className={cn(s.missing && "bg-warning/5")}
                      >
                        <TableCell className="text-muted-foreground text-right text-xs tabular-nums">
                          {i + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8 border">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                {initials(s.fullName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate font-medium">{s.fullName}</p>
                              <p className="text-muted-foreground truncate text-xs tabular-nums">
                                {s.matricule ?? "—"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {s.className || "—"}
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums">
                          {s.totalSubjects == null
                            ? s.subjectsCount
                            : `${s.subjectsCount}/${s.totalSubjects}`}
                        </TableCell>
                        <TableCell>
                          <StatusBadge student={s} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={tc("download")}
                            disabled={!academicYear || downloadStudent.isPending}
                            onClick={() => onDownloadStudent(s)}
                          >
                            <Download className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={onDownloadAll}
              disabled={!academicYear || busy}
            >
              {downloadAll.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              {tc("downloadAll")}
            </Button>
            <Button onClick={onGenerate} disabled={busy}>
              {generate.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FileText className="size-4" />
              )}
              {tc("generate")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function StatusBadge({ student }: { student: ReportPreviewStudent }) {
  const tc = useTranslations("reports.cards");
  if (!student.missing) {
    return (
      <Badge className="bg-success/10 text-success ring-success/20 ring-1 ring-inset">
        {tc("status.complete")}
      </Badge>
    );
  }
  if (student.totalSubjects == null) {
    return <Badge variant="destructive">{tc("status.noMarks")}</Badge>;
  }
  return (
    <Badge variant="destructive">
      {tc("status.missing", { count: student.totalSubjects - student.subjectsCount })}
    </Badge>
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
  tone?: "default" | "success" | "warning";
}) {
  return (
    <div className="bg-card flex items-center gap-3 rounded-xl border px-4 py-3 shadow-[var(--shadow-sm)]">
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-lg",
          tone === "success"
            ? "bg-success/10 text-success"
            : tone === "warning"
              ? "bg-warning/15 text-warning"
              : "bg-primary/10 text-primary",
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

function PreviewSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading preview">
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Shimmer key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
      <div className="bg-card space-y-3 rounded-xl border p-4 shadow-[var(--shadow-sm)]">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Shimmer className="size-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Shimmer className="h-3.5 w-40" />
              <Shimmer className="h-3 w-24" />
            </div>
            <Shimmer className="h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
