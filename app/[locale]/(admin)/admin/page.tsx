"use client";

import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { Building2, GraduationCap, Users, Wallet } from "lucide-react";
import { StatCard } from "@/features/dashboard/components/stat-card";
import { SubscriptionBreakdown } from "@/features/admin/dashboard/components/subscription-breakdown";
import { TopSchools } from "@/features/admin/dashboard/components/top-schools";
import { useAdminDashboard } from "@/features/admin/dashboard/hooks";
import { Reveal, Stagger, StaggerItem } from "@/components/common/motion";
import { Shimmer } from "@/components/common/skeletons";
import { ErrorState } from "@/components/common/states";
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
  const { data, isLoading, isError, refetch } = useAdminDashboard();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </header>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Shimmer className="h-32 rounded-xl" />
            <Shimmer className="h-32 rounded-xl" />
            <Shimmer className="h-32 rounded-xl" />
            <Shimmer className="h-32 rounded-xl" />
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Shimmer className="h-80 rounded-xl lg:col-span-2" />
            <Shimmer className="h-80 rounded-xl" />
          </div>
        </div>
      ) : isError || !data ? (
        <ErrorState title={t("errorTitle")} description={t("errorDescription")} onRetry={() => refetch()} />
      ) : (
        <DashboardContent data={data} locale={locale} t={t} tt={tt} />
      )}
    </div>
  );
}

function DashboardContent({
  data,
  locale,
  t,
  tt,
}: {
  data: NonNullable<ReturnType<typeof useAdminDashboard>["data"]>;
  locale: string;
  t: ReturnType<typeof useTranslations>;
  tt: ReturnType<typeof useTranslations>;
}) {
  const { totals, estimatedRevenue, subscriptionBreakdown, usersByRole, growth, topSchools } = data;
  const totalSchools = subscriptionBreakdown.free + subscriptionBreakdown.basic + subscriptionBreakdown.pro;
  const maxRole = Math.max(1, ...usersByRole.map((r) => r.count));

  return (
    <div className="space-y-6">
      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StaggerItem>
          <StatCard label={t("schools")} value={totals.schools} icon={Building2} accent="primary" />
        </StaggerItem>
        <StaggerItem>
          <StatCard label={t("students")} value={totals.students} icon={Users} accent="info" />
        </StaggerItem>
        <StaggerItem>
          <StatCard label={t("teachers")} value={totals.teachers} icon={GraduationCap} accent="success" />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label={t("revenue")}
            value={estimatedRevenue}
            icon={Wallet}
            accent="warning"
            format={(n) => formatCurrency(n, locale)}
          />
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
              <PlatformGrowthChart data={growth} />
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
              <SubscriptionBreakdown locale={locale} breakdown={subscriptionBreakdown} />
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
              <TopSchools locale={locale} tierLabel={(tier) => tt(tier)} schools={topSchools} />
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
