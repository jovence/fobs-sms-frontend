"use client";

import { useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Check,
  Copy,
  Gift,
  Info,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/common/states";
import { Shimmer } from "@/components/common/skeletons";
import { AnimatedNumber, Stagger, StaggerItem } from "@/components/common/motion";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useReferralSummary } from "../hooks";

export function ReferralHero() {
  const t = useTranslations("referrals");
  const locale = useLocale();
  const { data, isLoading, isError, refetch } = useReferralSummary();

  if (isError || (!data && !isLoading)) {
    return (
      <ErrorState
        title={t("hero.errorTitle")}
        description={t("hero.errorDescription")}
        onRetry={() => refetch()}
        retryLabel={t("hero.retry")}
      />
    );
  }

  if (isLoading || !data) {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        <Shimmer className="h-44 lg:col-span-1" />
        <Shimmer className="h-44" />
        <Shimmer className="h-44" />
      </div>
    );
  }

  return (
    <Stagger className="grid gap-4 lg:grid-cols-3">
      <StaggerItem className="lg:col-span-1">
        <ReferralCodeCard code={data.code} />
      </StaggerItem>

      <StaggerItem>
        <StatTile
          icon={TrendingUp}
          accent="success"
          label={t("hero.totalEarnings")}
          hint={t("hero.earningsHint")}
          value={
            <AnimatedNumber
              value={data.totalEarnings}
              format={(n) => formatCurrency(n, locale)}
            />
          }
        />
      </StaggerItem>

      <StaggerItem>
        <StatTile
          icon={Users}
          accent="primary"
          label={t("hero.successfulReferrals")}
          hint={t("hero.successfulHint")}
          value={<AnimatedNumber value={data.successfulReferrals} />}
        />
      </StaggerItem>

      <StaggerItem className="lg:col-span-3">
        <p className="flex items-start gap-2 rounded-lg border border-dashed bg-muted/40 px-3.5 py-2.5 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <span>
            {t("hero.info", {
              discount: formatCurrency(data.discountPerReferral, locale),
              earning: formatCurrency(data.earningPerReferral, locale),
            })}
          </span>
        </p>
      </StaggerItem>
    </Stagger>
  );
}

function ReferralCodeCard({ code }: { code: string }) {
  const t = useTranslations("referrals");
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success(t("hero.copied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("hero.copyError"));
    }
  }

  return (
    <div className="card-interactive group relative flex h-full flex-col justify-between overflow-hidden rounded-xl border bg-card p-5 shadow-[var(--shadow-sm)]">
      <div className="pointer-events-none absolute -top-10 -right-10 size-32 rounded-full bg-primary/10 blur-2xl" />
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <Gift className="size-4" />
        </span>
        {t("hero.codeLabel")}
      </div>
      <p className="mt-4 font-mono text-3xl font-bold tracking-[0.15em] text-foreground tabular-nums sm:text-4xl">
        {code}
      </p>
      <Button onClick={copy} className="mt-4 w-full" aria-label={t("hero.copy")}>
        {copied ? <Check className="text-success" /> : <Copy />}
        {copied ? t("hero.copied") : t("hero.copy")}
      </Button>
    </div>
  );
}

const ACCENT: Record<"primary" | "success", string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
};

function StatTile({
  icon: Icon,
  accent,
  label,
  hint,
  value,
}: {
  icon: LucideIcon;
  accent: "primary" | "success";
  label: string;
  hint: string;
  value: ReactNode;
}) {
  return (
    <div className="card-interactive group relative flex h-full flex-col justify-between overflow-hidden rounded-xl border bg-card p-5 shadow-[var(--shadow-sm)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-lg transition-transform duration-300 group-hover:scale-105",
            ACCENT[accent],
          )}
        >
          <Icon className="size-5" />
        </span>
      </div>
      <p className="mt-3 font-heading text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
