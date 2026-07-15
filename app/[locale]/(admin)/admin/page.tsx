"use client";

import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { Building2, GraduationCap, Users, Wallet } from "lucide-react";
import { StatCard } from "@/features/dashboard/components/stat-card";
import { SubscriptionBreakdown } from "@/features/admin/dashboard/components/subscription-breakdown";
import { TopSchools } from "@/features/admin/dashboard/components/top-schools";
import {
  estimatedRevenue,
  platformSpark,
  platformTotals,
  subscriptionBreakdown,
  usersByRole,
} from "@/features/admin/dashboard/mock-data";
import { Reveal, Stagger, StaggerItem } from "@/components/common/motion";
import { Shimmer } from "@/components/common/skeletons";
import { formatCurrency, formatNumber } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PlatformGrowthChart = dynamic(
  () => import("@/features/admin/dashboard/components/platform-growth-chart").then((m) => m.PlatformGrowthChart),
  { ssr: false, loading: () => <Shimmer className="h-64 w-full" /> },
);

export default function AdminDashboardPage() {
  const t = useTranslations("admin.dashboard");
  const tt = useTranslations("admin.tiers");
  const locale = useLocale();
  const totalSchools = subscriptionBreakdown.free + subscriptionBreakdown.basic + subscriptionBreakdown.pro;
  const maxRole = Math.max(...usersByRole.map((r) => r.count));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </header>

      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StaggerItem>
          <StatCard label={t("schools")} value={platformTotals.schools} icon={Building2} delta={3.4} spark={platformSpark.schools} accent="primary" deltaLabel={t("vsLastMonth")} />
        </StaggerItem>
        <StaggerItem>
          <StatCard label={t("students")} value={platformTotals.students} icon={Users} delta={6.1} spark={platformSpark.students} accent="info" deltaLabel={t("vsLastMonth")} />
        </StaggerItem>
        <StaggerItem>
          <StatCard label={t("teachers")} value={platformTotals.teachers} icon={GraduationCap} delta={2.2} accent="success" deltaLabel={t("vsLastMonth")} />
        </StaggerItem>
        <StaggerItem>
          <StatCard label={t("revenue")} value={estimatedRevenue} icon={Wallet} delta={4.8} spark={platformSpark.revenue} accent="warning" format={(n) => formatCurrency(n, locale)} deltaLabel={t("vsLastMonth")} />
        </StaggerItem>
      </Stagger>

      <div className="grid gap-4 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">{t("growth")}</CardTitle>
              <p className="text-sm text-muted-foreground">{t("growthSubtitle")}</p>
            </CardHeader>
            <CardContent>
              <PlatformGrowthChart />
            </CardContent>
          </Card>
        </Reveal>
        <Reveal delay={0.08}>
          <Card className="h-full">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">{t("subscriptions")}</CardTitle>
              <span className="text-sm text-muted-foreground tabular-nums">
                {formatNumber(totalSchools, locale)}
              </span>
            </CardHeader>
            <CardContent>
              <SubscriptionBreakdown locale={locale} />
            </CardContent>
          </Card>
        </Reveal>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">{t("topSchools")}</CardTitle>
            </CardHeader>
            <CardContent>
              <TopSchools locale={locale} tierLabel={(tier) => tt(tier)} />
            </CardContent>
          </Card>
        </Reveal>
        <Reveal delay={0.08}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">{t("usersByRole")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {usersByRole.map((r) => (
                <div key={r.role} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{t(`roles.${r.role}`)}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {formatNumber(r.count, locale)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-chart-1"
                      style={{ width: `${(r.count / maxRole) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
