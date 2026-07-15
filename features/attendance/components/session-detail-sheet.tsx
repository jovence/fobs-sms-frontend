"use client";

import { useLocale, useTranslations } from "next-intl";
import { CalendarDays, GraduationCap, Users } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AttendanceSession } from "../types";

function rateTone(rate: number): string {
  if (rate >= 90) return "text-success";
  if (rate >= 75) return "text-warning";
  return "text-destructive";
}

export function SessionDetailSheet({
  open,
  onOpenChange,
  session,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: AttendanceSession | null;
}) {
  const t = useTranslations("attendance.detail");
  const locale = useLocale();

  const counts = session?.counts;
  const total = counts?.total ?? 0;
  const bars: { key: "present" | "late" | "absent"; value: number; bar: string }[] = [
    { key: "present", value: counts?.present ?? 0, bar: "bg-success" },
    { key: "late", value: counts?.late ?? 0, bar: "bg-warning" },
    { key: "absent", value: counts?.absent ?? 0, bar: "bg-destructive" },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b">
          <SheetTitle>{t("title")}</SheetTitle>
          <SheetDescription>{t("subtitle")}</SheetDescription>
        </SheetHeader>

        {session && (
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Meta icon={<CalendarDays className="size-4" />} label={t("date")}>
                {formatDate(session.date, locale)}
              </Meta>
              <Meta icon={<GraduationCap className="size-4" />} label={t("class")}>
                {session.className}
              </Meta>
              <Meta icon={<Users className="size-4" />} label={t("subject")}>
                {session.subjectName}
              </Meta>
              <Meta icon={<Users className="size-4" />} label={t("total")}>
                {t("students", { count: total })}
              </Meta>
            </dl>

            <div className="rounded-xl border bg-muted/30 p-4 text-center">
              <p className="text-xs text-muted-foreground">{t("rate")}</p>
              <p
                className={cn(
                  "font-heading text-4xl font-bold tabular-nums",
                  rateTone(session.rate),
                )}
              >
                {session.rate}%
              </p>
            </div>

            <div className="space-y-4">
              {bars.map((b) => {
                const pct = total === 0 ? 0 : Math.round((b.value / total) * 100);
                return (
                  <div key={b.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{t(`status.${b.key}`)}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {b.value} · {pct}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full transition-all", b.bar)}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <SheetFooter className="flex-row justify-end gap-2 border-t">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("close")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Meta({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium">{children}</dd>
    </div>
  );
}
