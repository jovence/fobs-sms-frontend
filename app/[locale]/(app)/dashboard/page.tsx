"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { CalendarCheck, GraduationCap, Trophy, Users } from "lucide-react";
import { useActiveSchool, useCurrentUser } from "@/features/auth/hooks";
import { StatCard } from "@/features/dashboard/components/stat-card";
import { AttendanceRing } from "@/features/dashboard/components/attendance-ring";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { ActivityFeed } from "@/features/dashboard/components/activity-feed";
import { UpcomingClasses } from "@/features/dashboard/components/upcoming-classes";
import { attendanceBreakdown, sparks } from "@/features/dashboard/mock-data";
import { Reveal, Stagger, StaggerItem } from "@/components/common/motion";
import { Shimmer } from "@/components/common/skeletons";
import { formatPercent } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";

const EnrollmentChart = dynamic(
  () => import("@/features/dashboard/components/enrollment-chart").then((m) => m.EnrollmentChart),
  { ssr: false, loading: () => <Shimmer className="h-64 w-full" /> },
);

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const user = useCurrentUser();
  const active = useActiveSchool();
  const school = active?.school;
  const deltaLabel = t("vsLastTerm");

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            {t("greeting", { name: user?.name.split(" ")[0] ?? "" })}
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

      {/* Quick actions */}
      <Reveal>
        <QuickActions />
      </Reveal>

      {/* KPIs */}
      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StaggerItem>
          <StatCard label={t("students")} value={school?.studentCount ?? 0} icon={Users} delta={4.2} spark={sparks.students} accent="primary" deltaLabel={deltaLabel} />
        </StaggerItem>
        <StaggerItem>
          <StatCard label={t("teachers")} value={school?.teacherCount ?? 0} icon={GraduationCap} delta={1.1} spark={sparks.teachers} accent="info" deltaLabel={deltaLabel} />
        </StaggerItem>
        <StaggerItem>
          <StatCard label={t("attendanceRate")} value={93.4} icon={CalendarCheck} delta={0.8} spark={sparks.attendance} accent="success" format={(n) => formatPercent(n)} deltaLabel={deltaLabel} />
        </StaggerItem>
        <StaggerItem>
          <StatCard label={t("passRate")} value={78.2} icon={Trophy} delta={-1.4} spark={sparks.pass} accent="warning" format={(n) => formatPercent(n)} deltaLabel={deltaLabel} />
        </StaggerItem>
      </Stagger>

      {/* Charts */}
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

      {/* Activity + upcoming */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">{t("recentActivity")}</CardTitle>
              <Link href="/settings" className="text-sm font-medium text-primary hover:underline">
                {t("viewAll")}
              </Link>
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
    </div>
  );
}
