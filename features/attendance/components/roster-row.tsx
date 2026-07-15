"use client";

import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AttendanceStatus, RosterStudent } from "../types";
import { StatusControl } from "./status-control";

export interface RosterEntry {
  status: AttendanceStatus;
  hours: number;
}

export function RosterRow({
  student,
  index,
  entry,
  onStatusChange,
  onHoursChange,
}: {
  student: RosterStudent;
  index: number;
  entry: RosterEntry;
  onStatusChange: (status: AttendanceStatus) => void;
  onHoursChange: (hours: number) => void;
}) {
  const t = useTranslations("attendance.record");
  const hoursId = `hours-${student.id}`;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 px-4 py-3 transition-colors sm:flex-row sm:items-center sm:justify-between",
        "hover:bg-muted/40",
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="w-6 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
          {index + 1}
        </span>
        <Avatar className="size-9 border">
          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
            {initials(student.fullName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-medium">{student.fullName}</p>
          <p className="truncate text-xs text-muted-foreground tabular-nums">
            {student.matricule ?? "—"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:justify-end">
        <StatusControl
          value={entry.status}
          onChange={onStatusChange}
          studentName={student.fullName}
        />
        <div className="flex items-center gap-1.5">
          <Label htmlFor={hoursId} className="sr-only">
            {t("hoursFor", { name: student.fullName })}
          </Label>
          <Input
            id={hoursId}
            type="number"
            inputMode="numeric"
            min={0}
            max={12}
            step={1}
            value={Number.isNaN(entry.hours) ? "" : entry.hours}
            onChange={(e) => {
              const n = e.target.valueAsNumber;
              onHoursChange(Number.isNaN(n) ? 0 : Math.max(0, Math.min(12, n)));
            }}
            disabled={entry.status === "Absent"}
            className="h-8 w-16 text-center tabular-nums"
            aria-label={t("hoursFor", { name: student.fullName })}
          />
          <span className="text-xs text-muted-foreground">{t("hoursUnit")}</span>
        </div>
      </div>
    </div>
  );
}
