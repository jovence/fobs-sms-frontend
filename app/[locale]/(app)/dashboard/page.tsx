"use client";

import { useTranslations } from "next-intl";
import { GraduationCap, LineChart, School as SchoolIcon, Users } from "lucide-react";
import { useActiveSchool, useCurrentUser } from "@/features/auth/hooks";
import { useSchools } from "@/features/schools/hooks";
import { StatCard } from "@/features/dashboard/components/stat-card";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { Reveal, Stagger, StaggerItem } from "@/components/common/motion";
import { EmptyState, ErrorState } from "@/components/common/states";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const user = useCurrentUser();
  const { data: schools, isLoading, isError, refetch } = useSchools();
  const school = useActiveSchool();

  const firstName = user?.name.split(" ")[0] ?? "";

  // A failed fetch is an error state with a retry — never the "create your first
  // school" onboarding screen, which would falsely imply the account is empty.
  if (!isLoading && isError) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          {t("greeting", { name: firstName })}
        </h1>
        <Card>
          <CardContent className="py-4">
            <ErrorState
              title={t("loadErrorTitle")}
              description={t("loadErrorBody")}
              retryLabel={tCommon("retry")}
              onRetry={() => refetch()}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // First run: the account genuinely has no schools yet (loaded, not an error).
  if (!isLoading && !isError && (schools?.length ?? 0) === 0) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          {t("greeting", { name: firstName })}
        </h1>
        <Card>
          <CardContent className="py-4">
            <EmptyState
              icon={<SchoolIcon className="size-6" />}
              title={t("setupTitle")}
              description={t("setupBody")}
              action={
                <Button asChild>
                  <Link href="/schools">{t("createSchool")}</Link>
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasData = (school?.studentCount ?? 0) > 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            {t("greeting", { name: firstName })}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("subtitle", { school: school?.name ?? "—" })}
          </p>
        </div>
        {school && (
          <Badge variant="secondary" className="gap-1.5 tabular-nums">
            {school.academicYear}
          </Badge>
        )}
      </header>

      <Reveal>
        <QuickActions />
      </Reveal>

      {/* Only real, backed metrics are shown as data. Attendance/pass-rate KPIs and
          the trend/activity panels are intentionally omitted until the analytics
          service exists, rather than presenting invented numbers as real. */}
      <Stagger className="grid gap-4 sm:grid-cols-2">
        <StaggerItem>
          <StatCard
            label={t("students")}
            value={school?.studentCount ?? 0}
            icon={Users}
            accent="primary"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label={t("teachers")}
            value={school?.teacherCount ?? 0}
            icon={GraduationCap}
            accent="info"
          />
        </StaggerItem>
      </Stagger>

      <Reveal>
        <Card>
          <CardContent className="py-4">
            {!hasData ? (
              <EmptyState
                icon={<LineChart className="size-6" />}
                title={t("noDataTitle")}
                description={t("noDataBody", { school: school?.name ?? "" })}
                action={
                  <Button asChild variant="outline">
                    <Link href="/students">{t("addStudent")}</Link>
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={<LineChart className="size-6" />}
                title={t("comingSoon")}
                description={t("comingSoonBody")}
              />
            )}
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
