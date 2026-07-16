"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CalendarDays, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Reveal, AnimatedNumber } from "@/components/common/motion";
import { Shimmer } from "@/components/common/skeletons";
import { EmptyState, ErrorState } from "@/components/common/states";
import { cn } from "@/lib/utils";
import { useClassOptions, useSubjectOptions } from "@/features/academics/hooks";
import { useRoster, useSaveSession } from "../hooks";
import {
  attendanceRate,
  type AttendanceRecord,
  type AttendanceStatus,
} from "../types";
import { RosterRow, type RosterEntry } from "./roster-row";

const DEFAULT_HOURS = 4;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function AttendanceRecord() {
  const t = useTranslations("attendance.record");

  const { data: classes = [] } = useClassOptions();
  const { data: subjects = [] } = useSubjectOptions();
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState(today);
  const [entries, setEntries] = useState<Record<string, RosterEntry>>({});

  // Default to the first real class/subject once they load (empty for a fresh school).
  useEffect(() => {
    if (!classId && classes.length) setClassId(classes[0].id);
  }, [classes, classId]);
  useEffect(() => {
    if (!subjectId && subjects.length) setSubjectId(subjects[0].id);
  }, [subjects, subjectId]);

  const { data: roster, isLoading, isError, refetch } = useRoster(classId);
  const save = useSaveSession();

  // Reset the roster marks whenever the loaded class changes.
  useEffect(() => {
    if (!roster) return;
    const next: Record<string, RosterEntry> = {};
    for (const s of roster) {
      next[s.id] = { status: "Present", hours: DEFAULT_HOURS };
    }
    setEntries(next);
  }, [roster]);

  const summary = useMemo(() => {
    const list = roster ?? [];
    let present = 0;
    let late = 0;
    let absent = 0;
    for (const s of list) {
      const status = entries[s.id]?.status ?? "Present";
      if (status === "Present") present += 1;
      else if (status === "Late") late += 1;
      else absent += 1;
    }
    const total = list.length;
    return { present, late, absent, total, rate: attendanceRate({ present, late, absent, total }) };
  }, [roster, entries]);

  function setStatus(studentId: string, status: AttendanceStatus) {
    setEntries((prev) => {
      const current = prev[studentId] ?? { status: "Present", hours: DEFAULT_HOURS };
      return {
        ...prev,
        [studentId]: {
          status,
          hours: status === "Absent" ? 0 : current.hours || DEFAULT_HOURS,
        },
      };
    });
  }

  function setHours(studentId: string, hours: number) {
    setEntries((prev) => ({
      ...prev,
      [studentId]: {
        status: prev[studentId]?.status ?? "Present",
        hours,
      },
    }));
  }

  async function onSave() {
    if (!roster || roster.length === 0) return;
    const records: AttendanceRecord[] = roster.map((s) => {
      const entry = entries[s.id] ?? { status: "Present", hours: DEFAULT_HOURS };
      return { studentId: s.id, status: entry.status, hours: entry.hours };
    });
    try {
      await save.mutateAsync({ date, classId, subjectId, records });
      toast.success(t("saved"));
    } catch {
      toast.error(t("error"));
    }
  }

  return (
    <div className="space-y-4">
      {/* Selectors */}
      <Reveal>
        <div className="grid gap-4 rounded-xl border bg-card p-4 shadow-[var(--shadow-sm)] sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="att-class">{t("class")}</Label>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger id="att-class" className="w-full">
                <SelectValue />
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
            <Label htmlFor="att-date">{t("date")}</Label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="att-date"
                type="date"
                value={date}
                max={today()}
                onChange={(e) => setDate(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="att-subject">{t("subject")}</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger id="att-subject" className="w-full">
                <SelectValue />
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
        </div>
      </Reveal>

      {/* Roster */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-[var(--shadow-sm)]">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-heading text-sm font-semibold">{t("rosterTitle")}</h2>
          {roster && !isLoading && (
            <span className="text-xs text-muted-foreground tabular-nums">
              {t("studentCount", { count: roster.length })}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="divide-y">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Shimmer className="size-9 rounded-full" />
                  <div className="space-y-2">
                    <Shimmer className="h-4 w-36" />
                    <Shimmer className="h-3 w-20" />
                  </div>
                </div>
                <Shimmer className="h-8 w-52" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <ErrorState
            title={t("errorTitle")}
            description={t("errorDescription")}
            onRetry={() => refetch()}
            retryLabel={t("retry")}
            className="m-4 border-dashed"
          />
        ) : !roster || roster.length === 0 ? (
          <EmptyState
            title={t("emptyTitle")}
            description={t("emptyDescription")}
            className="m-4 border-dashed"
          />
        ) : (
          <div className="divide-y">
            {roster.map((student, i) => (
              <RosterRow
                key={student.id}
                student={student}
                index={i}
                entry={entries[student.id] ?? { status: "Present", hours: DEFAULT_HOURS }}
                onStatusChange={(status) => setStatus(student.id, status)}
                onHoursChange={(hours) => setHours(student.id, hours)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sticky summary bar */}
      <div className="sticky bottom-4 z-20">
        <div className="flex flex-col gap-3 rounded-xl border bg-card/95 p-3 shadow-[var(--shadow-md)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <SummaryStat
              label={t("summary.present")}
              value={summary.present}
              tone="success"
            />
            <SummaryStat label={t("summary.late")} value={summary.late} tone="warning" />
            <SummaryStat
              label={t("summary.absent")}
              value={summary.absent}
              tone="destructive"
            />
            <div className="flex items-center gap-2 border-l pl-5">
              <span className="text-xs text-muted-foreground">{t("summary.rate")}</span>
              <AnimatedNumber
                value={summary.rate}
                format={(n) => `${Math.round(n)}%`}
                className="font-heading text-xl font-bold tabular-nums"
              />
            </div>
          </div>
          <Button
            size="lg"
            onClick={onSave}
            disabled={save.isPending || !roster || roster.length === 0}
          >
            {save.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {t("save")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "success" | "warning" | "destructive";
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "size-2 rounded-full",
          tone === "success" && "bg-success",
          tone === "warning" && "bg-warning",
          tone === "destructive" && "bg-destructive",
        )}
      />
      <span className="text-xs text-muted-foreground">{label}</span>
      <AnimatedNumber
        value={value}
        className="font-heading text-lg font-bold tabular-nums"
      />
    </div>
  );
}
