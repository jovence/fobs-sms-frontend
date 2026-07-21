"use client";

import { useLocale, useTranslations } from "next-intl";
import { Clock, UserCheck, Users, VenetianMask } from "lucide-react";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { StatCard } from "@/features/dashboard/components/stat-card";
import { StatCardSkeleton } from "@/components/common/skeletons";
import { useStudentStats } from "../hooks";

/**
 * Headline student counts shown above the records table: total / active / pending, plus a
 * gender split card (GET /dashboard/students/stats). Purely supplementary — on error it
 * renders nothing so the table below stays usable.
 */
export function StudentStatCards() {
  const t = useTranslations("students.stats");
  const locale = useLocale();
  const { data, isLoading, isError } = useStudentStats();

  if (isError) return null;

  if (isLoading || !data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const fmt = (n: number) => formatNumber(Math.round(n), locale);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label={t("total")} value={data.total} icon={Users} accent="primary" format={fmt} />
      <StatCard
        label={t("active")}
        value={data.active}
        icon={UserCheck}
        accent="success"
        format={fmt}
      />
      <StatCard
        label={t("pending")}
        value={data.pending}
        icon={Clock}
        accent="warning"
        format={fmt}
      />
      <GenderCard male={data.male} female={data.female} format={fmt} />
    </div>
  );
}

/** Combined Male / Female split card, styled to match {@link StatCard}. */
function GenderCard({
  male,
  female,
  format,
}: {
  male: number;
  female: number;
  format: (n: number) => string;
}) {
  const t = useTranslations("students.stats");
  return (
    <div className="card-interactive group relative overflow-hidden rounded-xl border bg-card p-5 shadow-[var(--shadow-sm)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{t("gender")}</p>
          <div className="flex items-center gap-4">
            <Split label={t("male")} value={format(male)} tone="text-info" />
            <span className="h-8 w-px bg-border" aria-hidden />
            <Split label={t("female")} value={format(female)} tone="text-primary" />
          </div>
        </div>
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-lg bg-info/10 text-info transition-transform duration-300 group-hover:scale-105",
          )}
        >
          <VenetianMask className="size-5" />
        </span>
      </div>
    </div>
  );
}

function Split({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div>
      <p className={cn("font-heading text-2xl font-bold tracking-tight tabular-nums", tone)}>
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
