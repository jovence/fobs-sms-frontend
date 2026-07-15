"use client";

import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight, GraduationCap, MessageSquare, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedNumber } from "@/components/common/motion";
import { formatDate, formatNumber } from "@/lib/format";
import type { CurrentSubscription, LimitValue } from "../types";

function LimitRow({
  icon: Icon,
  label,
  value,
  locale,
  unlimitedLabel,
}: {
  icon: LucideIcon;
  label: string;
  value: LimitValue;
  locale: string;
  unlimitedLabel: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-background/60 p-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4.5" />
      </span>
      <div className="min-w-0">
        <p className="text-lg leading-none font-semibold tabular-nums">
          {value === "unlimited" ? (
            unlimitedLabel
          ) : (
            <AnimatedNumber
              value={value}
              format={(n) => formatNumber(Math.round(n), locale)}
            />
          )}
        </p>
        <p className="mt-1 truncate text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export function CurrentPlanCard({
  current,
  onUpgrade,
}: {
  current: CurrentSubscription;
  onUpgrade: () => void;
}) {
  const t = useTranslations("billing");
  const tc = useTranslations("billing.currentPlan");
  const locale = useLocale();

  const planName = t(`plans.tiers.${current.tier}.name`);

  return (
    <Card className="card-interactive overflow-hidden">
      <CardHeader className="border-b">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {tc("eyebrow")}
        </p>
        <CardTitle className="flex items-center gap-2 text-xl">
          {planName}
          <Badge variant="secondary" className="gap-1.5">
            <span className="size-1.5 rounded-full bg-success" />
            {tc("active")}
          </Badge>
        </CardTitle>
        <CardDescription>
          {tc("renews", { date: formatDate(current.renewalDate, locale) })}
        </CardDescription>
        <CardAction>
          <Button size="sm" onClick={onUpgrade}>
            <ArrowUpRight /> {tc("upgrade")}
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        <p className="mb-3 text-sm font-medium">{tc("limitsTitle")}</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <LimitRow
            icon={Users}
            label={tc("students")}
            value={current.limits.students}
            locale={locale}
            unlimitedLabel={t("unlimited")}
          />
          <LimitRow
            icon={GraduationCap}
            label={tc("teachers")}
            value={current.limits.teachers}
            locale={locale}
            unlimitedLabel={t("unlimited")}
          />
          <LimitRow
            icon={MessageSquare}
            label={tc("sms")}
            value={current.limits.smsPerMonth}
            locale={locale}
            unlimitedLabel={t("unlimited")}
          />
        </div>
      </CardContent>
    </Card>
  );
}
