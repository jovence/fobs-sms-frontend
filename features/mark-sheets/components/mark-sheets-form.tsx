"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ClipboardList, Download, FileText, Loader2, TableProperties } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/common/states";
import { Reveal } from "@/components/common/motion";
import { Shimmer } from "@/components/common/skeletons";
import { cn } from "@/lib/utils";
import { useMarkSheetDownload, useMarkSheetOptions, useMarkSheetPreview } from "../hooks";
import { ALL_CLASSES, MARK_MAX, type MarkSheetPreview, type MarkSheetSelection } from "../types";

export function MarkSheetsForm() {
  const t = useTranslations("markSheets");

  const { data: options } = useMarkSheetOptions();
  const subjects = options?.subjects ?? [];
  const exams = options?.exams ?? [];
  const classes = options?.classes ?? [];

  const [subjectId, setSubjectId] = useState("");
  const [examId, setExamId] = useState("");
  const [classId, setClassId] = useState(ALL_CLASSES);

  const preview = useMarkSheetPreview();
  const download = useMarkSheetDownload();

  // Default the subject to the first available option so the page lands ready to use.
  // Derived during render (mark-entry's pattern) rather than synced via an effect — a
  // manual pick sets subjectId and takes over. The EXAM is deliberately NOT defaulted:
  // exams span old/closed sequences, so the user chooses the evaluation consciously.
  const effectiveSubjectId = subjectId || subjects[0]?.id || "";

  const selection: MarkSheetSelection | null = useMemo(
    () =>
      effectiveSubjectId && examId
        ? {
            subjectId: effectiveSubjectId,
            examId,
            classId: classId === ALL_CLASSES ? undefined : classId,
          }
        : null,
    [effectiveSubjectId, examId, classId],
  );

  // Any change to the selection invalidates the shown preview — reset it so a stale
  // table can't linger under a new selection (no effect needed; reset on the event).
  function resetPreview() {
    if (preview.data || preview.isError) preview.reset();
  }

  function onPreview() {
    if (!selection) return;
    preview.mutate(selection);
  }

  async function onGenerate() {
    if (!selection) return;
    try {
      await download.mutateAsync(selection);
      toast.success(t("toasts.generated"));
    } catch {
      toast.error(t("toasts.generateError"));
    }
  }

  const sheet = preview.data;
  const hasRows = !!sheet && sheet.rows.length > 0;

  return (
    <div className="space-y-4">
      {/* Selectors */}
      <Reveal>
        <Card className="card-interactive shadow-[var(--shadow-sm)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="text-muted-foreground size-4" />
              {t("selectorsTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="ms-subject">{t("subject")}</Label>
              <Select
                value={effectiveSubjectId || undefined}
                onValueChange={(v) => {
                  resetPreview();
                  setSubjectId(v);
                }}
              >
                <SelectTrigger id="ms-subject" className="w-full">
                  <SelectValue placeholder={t("selectSubject")} />
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
              <Label htmlFor="ms-exam">{t("exam")}</Label>
              <Select
                value={examId || undefined}
                onValueChange={(v) => {
                  resetPreview();
                  setExamId(v);
                }}
              >
                <SelectTrigger id="ms-exam" className="w-full">
                  <SelectValue placeholder={t("selectExam")} />
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
            <div className="space-y-2">
              <Label htmlFor="ms-class">{t("class")}</Label>
              <Select
                value={classId}
                onValueChange={(v) => {
                  resetPreview();
                  setClassId(v);
                }}
              >
                <SelectTrigger id="ms-class" className="w-full">
                  <SelectValue placeholder={t("selectClass")} />
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
          </CardContent>
        </Card>
      </Reveal>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button variant="outline" onClick={onPreview} disabled={!selection || preview.isPending}>
          {preview.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <TableProperties className="size-4" />
          )}
          {t("preview")}
        </Button>
        <Button onClick={onGenerate} disabled={!hasRows || download.isPending}>
          {download.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          {t("generate")}
        </Button>
      </div>

      {/* Preview / states */}
      {preview.isPending ? (
        <PreviewSkeleton />
      ) : preview.isError ? (
        <EmptyState
          icon={<FileText className="size-6" />}
          title={t("empty.title")}
          description={(preview.error as Error)?.message || t("empty.description")}
        />
      ) : sheet && sheet.rows.length > 0 ? (
        <PreviewTable sheet={sheet} />
      ) : (
        <EmptyState
          icon={<ClipboardList className="size-6" />}
          title={t("prompt.title")}
          description={t("prompt.description")}
        />
      )}
    </div>
  );
}

function PreviewTable({ sheet }: { sheet: MarkSheetPreview }) {
  const t = useTranslations("markSheets");
  const scope = [sheet.subject.name, sheet.exam.name, sheet.class?.name]
    .filter(Boolean)
    .join(" · ");

  return (
    <Card className="shadow-[var(--shadow-sm)]">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <FileText className="text-muted-foreground size-4" />
            {t("previewTitle")}
          </span>
          <span className="text-muted-foreground text-xs font-normal tabular-nums">
            {t("outOf", { max: MARK_MAX })}
          </span>
        </CardTitle>
        <p className="text-sm">
          <span className="text-muted-foreground">{t("previewFor")} </span>
          <span className="text-foreground font-medium">{scope || "—"}</span>
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 text-right">{t("columns.number")}</TableHead>
              <TableHead>{t("columns.matricule")}</TableHead>
              <TableHead>{t("columns.student")}</TableHead>
              <TableHead>{t("columns.class")}</TableHead>
              <TableHead className="text-right">{t("columns.mark")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sheet.rows.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell className="text-muted-foreground text-right text-xs tabular-nums">
                  {index + 1}
                </TableCell>
                <TableCell className="text-muted-foreground tabular-nums">
                  {row.matricule ?? "—"}
                </TableCell>
                <TableCell className="font-medium">{row.studentName || "—"}</TableCell>
                <TableCell>{row.className || "—"}</TableCell>
                <TableCell
                  className={cn(
                    "text-right font-semibold tabular-nums",
                    row.mark != null && row.mark < MARK_MAX / 2 && "text-destructive",
                  )}
                >
                  {row.mark ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function PreviewSkeleton() {
  return (
    <div
      className="bg-card space-y-3 rounded-xl border p-4 shadow-[var(--shadow-sm)]"
      role="status"
      aria-label="Loading preview"
    >
      <Shimmer className="h-5 w-56" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Shimmer className="h-4 w-6" />
          <Shimmer className="h-4 w-20" />
          <Shimmer className="h-4 flex-1" />
          <Shimmer className="h-4 w-12" />
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
