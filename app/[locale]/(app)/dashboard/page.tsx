"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { CalendarCheck, GraduationCap, LineChart, School as SchoolIcon, Trophy, Users } from "lucide-react";
import { useActiveSchool, useCurrentUser } from "@/features/auth/hooks";
import { useSchools } from "@/features/schools/hooks";
import { StatCard } from "@/features/dashboard/components/stat-card";
import { AttendanceRing } from "@/features/dashboard/components/attendance-ring";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { ActivityFeed } from "@/features/dashboard/components/activity-feed";
import { UpcomingClasses } from "@/features/dashboard/components/upcoming-classes";
import { attendanceBreakdown, sparks } from "@/features/dashboard/mock-data";
import { Reveal, Stagger, StaggerItem } from "@/components/common/motion";
import { EmptyState } from "@/components/common/states";
import { Shimmer } from "@/components/common/skeletons";
import { formatPercent } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const EnrollmentChart = dynamic(
  () => import("@/features/dashboard/components/enrollment-chart").then((m) => m.EnrollmentChart),
  { ssr: false, loading: () => <Shimmer className="h-64 w-full" /> },
);

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const user = useCurrentUser();
  const { data: schools, isLoading } = useSchools();
  const school = useActiveSchool();
  const deltaLabel = t("vsLastTerm");

  const firstName = user?.name.split(" ")[0] ?? "";

  // First run: the account has no schools yet.
  if (!isLoading && (schools?.length ?? 0) === 0) {
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

  // A school is selected but has no data yet → real zeros + honest empty analytics.
  const hasData = (school?.studentCount ?? 0) > 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            {t("greeting", { name: firstName })}
          </h1>
          <p className="text-sm text-muted-foreground">
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

      {/* KPIs — real per-school counts; deltas/sparklines only when there's history to show. */}
      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StaggerItem>
          <StatCard label={t("students")} value={school?.studentCount ?? 0} icon={Users} delta={hasData ? 4.2 : undefined} spark={hasData ? sparks.students : undefined} accent="primary" deltaLabel={deltaLabel} />
        </StaggerItem>
        <StaggerItem>
          <StatCard label={t("teachers")} value={school?.teacherCount ?? 0} icon={GraduationCap} delta={hasData ? 1.1 : undefined} spark={hasData ? sparks.teachers : undefined} accent="info" deltaLabel={deltaLabel} />
        </StaggerItem>
        <StaggerItem>
          <StatCard label={t("attendanceRate")} value={hasData ? 93.4 : 0} icon={CalendarCheck} delta={hasData ? 0.8 : undefined} spark={hasData ? sparks.attendance : undefined} accent="success" format={(n) => formatPercent(n)} deltaLabel={deltaLabel} />
        </StaggerItem>
        <StaggerItem>
          <StatCard label={t("passRate")} value={hasData ? 78.2 : 0} icon={Trophy} delta={hasData ? -1.4 : undefined} spark={hasData ? sparks.pass : undefined} accent="warning" format={(n) => formatPercent(n)} deltaLabel={deltaLabel} />
        </StaggerItem>
      </Stagger>

      {hasData ? (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <Reveal className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-base">{t("enrollmentTrend")}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t("enrollmentSubtitle", { year: school?.academicYear ?? "" })}
                  </p>
                </CardHeader>
                <CardContent>
                  <EnrollmentChart />
                </CardContent>
              </Card>
            </Reveal>
            <Reveal delay={0.08}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-base">{t("attendanceOverview")}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center pt-2">
                  <AttendanceRing {...attendanceBreakdown} />
                </CardContent>
              </Card>
            </Reveal>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Reveal className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-base">{t("recentActivity")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ActivityFeed />
                </CardContent>
              </Card>
            </Reveal>
            <Reveal delay={0.08}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-base">{t("upcomingClasses")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <UpcomingClasses />
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </>
      ) : (
        <Reveal>
          <Card>
            <CardContent className="py-4">
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
            </CardContent>
          </Card>
        </Reveal>
      )}
    </div>
  );
}
