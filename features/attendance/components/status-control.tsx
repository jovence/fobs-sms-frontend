"use client";

import { useTranslations } from "next-intl";
import { Check, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AttendanceStatus } from "../types";

const OPTIONS: {
  value: AttendanceStatus;
  key: "present" | "late" | "absent";
  icon: typeof Check;
  active: string;
}[] = [
  {
    value: "Present",
    key: "present",
    icon: Check,
    active: "bg-success/15 text-success ring-1 ring-inset ring-success/30",
  },
  {
    value: "Late",
    key: "late",
    icon: Clock,
    active: "bg-warning/20 text-warning ring-1 ring-inset ring-warning/35",
  },
  {
    value: "Absent",
    key: "absent",
    icon: X,
    active: "bg-destructive/15 text-destructive ring-1 ring-inset ring-destructive/30",
  },
];

/** Accessible 3-way segmented control for a student's attendance status. */
export function StatusControl({
  value,
  onChange,
  studentName,
}: {
  value: AttendanceStatus;
  onChange: (next: AttendanceStatus) => void;
  studentName: string;
}) {
  const t = useTranslations("attendance.record");
  return (
    <div
      role="radiogroup"
      aria-label={t("statusFor", { name: studentName })}
      className="inline-flex items-center gap-1 rounded-lg border bg-muted/40 p-1"
    >
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              selected
                ? opt.active
                : "text-muted-foreground hover:bg-background hover:text-foreground",
            )}
          >
            <Icon className="size-3.5" aria-hidden />
            <span className="hidden sm:inline">{t(`status.${opt.key}`)}</span>
          </button>
        );
      })}
    </div>
  );
}
