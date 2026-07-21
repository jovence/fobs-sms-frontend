"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { FileText, Loader2, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useDownloadSlips, useDownloadSummary } from "../hooks";
import type { GceClass } from "../types";

/** Level-aware accent classes for the card header strip + coverage bar. */
const ACCENT: Record<GceClass["level"], { strip: string; bar: string }> = {
  O: {
    strip: "bg-emerald-600 text-white dark:bg-emerald-700",
    bar: "[&_[data-slot=progress-indicator]]:bg-emerald-500",
  },
  A: {
    strip: "bg-indigo-600 text-white dark:bg-indigo-700",
    bar: "[&_[data-slot=progress-indicator]]:bg-indigo-500",
  },
};

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-muted/40 p-3 text-center">
      <p className="text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-0.5 text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

export function MockGceClassCard({ cls }: { cls: GceClass }) {
  const t = useTranslations("mockGce");
  const slips = useDownloadSlips();
  const summary = useDownloadSummary();
  const accent = ACCENT[cls.level];
  const levelLabel = cls.level === "O" ? t("level.oLevel") : t("level.aLevel");

  async function handleSlips() {
    try {
      await slips.mutateAsync({ classId: cls.id, className: cls.name });
    } catch {
      toast.error(t("toasts.slipsFailed"));
    }
  }

  async function handleSummary() {
    try {
      await summary.mutateAsync({ classId: cls.id, className: cls.name });
    } catch {
      toast.error(t("toasts.summaryFailed"));
    }
  }

  return (
    <Card className="flex flex-col gap-0 py-0">
      {/* Header strip */}
      <div className={cn("flex items-center justify-between px-6 py-4", accent.strip)}>
        <div>
          <h2 className="font-heading text-lg font-bold">{cls.name}</h2>
          <p className="text-xs opacity-90">{t("card.subtitle", { level: levelLabel })}</p>
        </div>
        <Badge className="border-white/30 bg-white/20 text-white">{levelLabel}</Badge>
      </div>

      <CardContent className="flex flex-1 flex-col gap-5 px-6 py-5">
        <div className="grid grid-cols-3 gap-3">
          <Stat label={t("stats.candidates")} value={cls.candidates} />
          <Stat label={t("stats.marked")} value={cls.studentsMarked} />
          <Stat label={t("stats.marks")} value={cls.marksCount} />
        </div>

        {/* Coverage bar */}
        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>{t("coverage.label")}</span>
            <span className="tabular-nums">{cls.coverage}%</span>
          </div>
          <Progress
            value={cls.coverage}
            className={cn("h-2", accent.bar)}
            aria-label={t("coverage.label")}
          />
        </div>

        {/* Pass rule */}
        <p className="rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          {cls.level === "O" ? t.rich("passRule.o", richTags) : t.rich("passRule.a", richTags)}
        </p>

        {/* Actions */}
        <div className="mt-auto flex flex-col gap-2 sm:flex-row">
          <Button className="flex-1" onClick={handleSlips} disabled={slips.isPending}>
            {slips.isPending ? <Loader2 className="animate-spin" /> : <FileText />}
            {t("actions.downloadSlips")}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleSummary}
            disabled={summary.isPending}
          >
            {summary.isPending ? <Loader2 className="animate-spin" /> : <Table2 />}
            {t("actions.classSummary")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/** Renders `<strong>…</strong>` inside the pass-rule i18n strings. */
const richTags = {
  b: (chunks: ReactNode) => <strong className="text-foreground">{chunks}</strong>,
};
