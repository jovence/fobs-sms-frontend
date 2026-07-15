"use client";

import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/common/motion";
import { Sparkline } from "./sparkline";

type Accent = "primary" | "success" | "info" | "warning";

const ACCENT: Record<Accent, { chip: string; spark: string }> = {
  primary: { chip: "bg-primary/10 text-primary", spark: "var(--primary)" },
  success: { chip: "bg-success/10 text-success", spark: "var(--success)" },
  info: { chip: "bg-info/10 text-info", spark: "var(--info)" },
  warning: { chip: "bg-warning/15 text-warning", spark: "var(--warning)" },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  spark,
  accent = "primary",
  format = (n) => Math.round(n).toLocaleString("en-CM"),
  suffix,
  deltaLabel = "vs last term",
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  delta?: number;
  spark?: number[];
  accent?: Accent;
  format?: (n: number) => string;
  suffix?: string;
  deltaLabel?: string;
}) {
  const a = ACCENT[accent];
  return (
    <div className="card-interactive group relative overflow-hidden rounded-xl border bg-card p-5 shadow-[var(--shadow-sm)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="font-heading text-2xl font-bold tracking-tight tabular-nums">
            <AnimatedNumber value={value} format={format} />
            {suffix}
          </p>
          {typeof delta === "number" && (
            <p
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-semibold",
                delta >= 0 ? "text-success" : "text-destructive",
              )}
            >
              {delta >= 0 ? (
                <ArrowUpRight className="size-3.5" />
              ) : (
                <ArrowDownRight className="size-3.5" />
              )}
              {Math.abs(delta)}%
              <span className="font-normal text-muted-foreground">{deltaLabel}</span>
            </p>
          )}
        </div>
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-lg transition-transform duration-300 group-hover:scale-105",
            a.chip,
          )}
        >
          <Icon className="size-5" />
        </span>
      </div>
      {spark && (
        <div className="pointer-events-none mt-3 -mb-1 flex justify-end opacity-90">
          <Sparkline data={spark} color={a.spark} />
        </div>
      )}
    </div>
  );
}
