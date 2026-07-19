"use client";

import { useTranslations } from "next-intl";
import {
  BookOpen,
  CalendarClock,
  CalendarCheck,
  GraduationCap,
  LineChart,
  School as SchoolIcon,
  TrendingUp,
  UserCircle,
  Users,
} from "lucide-react";
import { useActiveSchool, useCurrentUser } from "@/features/auth/hooks";
import { useSchools } from "@/features/schools/hooks";
import { useDashboardAnalytics } from "@/features/dashboard/hooks";
import { StatCard } from "@/features/dashboard/components/stat-card";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { ChartCard } from "@/features/dashboard/components/analytics/chart-card";
import {
  DonutChart,
  EnrollmentArea,
  GaugeDonut,
  MonthlyAttendanceBar,
  WorkloadBar,
} from "@/features/dashboard/components/analytics/charts";
import {
  AttendanceByClassTable,
  EngagementTable,
  RecentParentsTable,
  TopClassesTable,
} from "@/features/dashboard/components/analytics/tables";
import { DashboardAlerts } from "@/features/dashboard/components/analytics/alerts";
import { Reveal, Stagger, StaggerItem } from "@/components/common/motion";
import { EmptyState, ErrorState } from "@/components/common/states";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const user = useCurrentUser();
  const { data: schools, isLoading, isError, refetch } = useSchools();
  const school = useActiveSchool();

  const firstName = user?.name.split(" ")[0] ?? "";
  const hasSchools = (schools?.length ?? 0) > 0;

  const {
    data: analytics,
    isLoading: analyticsLoading,
    isError: analyticsError,
    refetch: refetchAnalytics,
  } = useDashboardAnalytics();

  const header = (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          {t("greeting", { name: firstName })}
        </h1>
        <p className="text-muted-foreground text-sm">{t("subtitle", { school: school?.name ?? "—" })}</p>
      </div>
      {school && (
        <Badge variant="secondary" className="gap-1.5 tabular-nums">
          {analytics?.academicYear ?? school.academicYear}
        </Badge>
      )}
    </header>
  );

  // A failed schools fetch is an error state with a retry — never the onboarding screen.
  if (!isLoading && isError) {
    return (
      <div className="space-y-6">
        {header}
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

  // First run: the account genuinely has no schools yet.
  if (!isLoading && !isError && !hasSchools) {
    return (
      <div className="space-y-6">
        {header}
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

  return (
    <div className="space-y-6">
      {header}

      <Reveal>
        <QuickActions />
      </Reveal>

      {analyticsLoading && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
        </div>
      )}

      {!analyticsLoading && analyticsError && (
        <Card>
          <CardContent className="py-4">
            <ErrorState
              title={t("loadErrorTitle")}
              description={t("analyticsErrorBody")}
              retryLabel={tCommon("retry")}
              onRetry={() => refetchAnalytics()}
            />
          </CardContent>
        </Card>
      )}

      {!analyticsLoading && !analyticsError && analytics && (
        <>
          {/* KPI strip */}
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StaggerItem>
              <StatCard
                label={t("kpiAttendanceToday")}
                value={analytics.quickStats.attendanceToday.rate}
                icon={CalendarCheck}
                accent="success"
                format={(n) => n.toFixed(1)}
                suffix="%"
                delta={analytics.metrics.attendanceChange}
                deltaLabel={t("kpiPresentOf", {
                  present: analytics.quickStats.attendanceToday.present,
                  total: analytics.quickStats.attendanceToday.total,
                })}
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                label={t("kpiNewStudents")}
                value={analytics.quickStats.studentsThisMonth}
                icon={TrendingUp}
                accent="info"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                label={t("kpiUpcomingExams")}
                value={analytics.quickStats.examsUpcoming.length}
                icon={CalendarClock}
                accent="warning"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                label={t("kpiClassAverage")}
                value={analytics.metrics.averageMarks}
                icon={LineChart}
                accent="primary"
                format={(n) => n.toFixed(1)}
                suffix="/20"
                deltaLabel={t("kpiPassRateOf", { rate: analytics.metrics.passRate })}
              />
            </StaggerItem>
          </Stagger>

          {/* Metric cards */}
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StaggerItem>
              <StatCard label={t("students")} value={analytics.metrics.totalStudents} icon={Users} accent="primary" delta={analytics.metrics.studentGrowth} deltaLabel={t("yoy")} />
            </StaggerItem>
            <StaggerItem>
              <StatCard label={t("teachers")} value={analytics.metrics.teachingStaff} icon={GraduationCap} accent="info" delta={analytics.metrics.staffGrowth} deltaLabel={t("yoy")} />
            </StaggerItem>
            <StaggerItem>
              <StatCard label={t("parents")} value={analytics.parentStats.totalParents} icon={UserCircle} accent="success" />
            </StaggerItem>
            <StaggerItem>
              <StatCard label={t("attendanceRate")} value={analytics.metrics.attendanceRate} icon={CalendarCheck} accent="success" format={(n) => n.toFixed(1)} suffix="%" />
            </StaggerItem>
            <StaggerItem>
              <StatCard label={t("classes")} value={analytics.metrics.totalClasses} icon={SchoolIcon} accent="warning" />
            </StaggerItem>
            <StaggerItem>
              <StatCard label={t("subjects")} value={analytics.metrics.totalSubjects} icon={BookOpen} accent="primary" />
            </StaggerItem>
          </Stagger>

          {/* Row 1: enrollment + attendance gauge */}
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ChartCard title={t("enrollmentTrend")} icon={<TrendingUp className="size-4" />}>
                <EnrollmentArea series={analytics.charts.enrollmentTrend} />
              </ChartCard>
            </div>
            <ChartCard title={t("attendanceRate")} icon={<CalendarCheck className="size-4" />}>
              <GaugeDonut value={analytics.metrics.attendanceRate} label={t("present")} color="var(--chart-2)" />
            </ChartCard>
          </div>

          {/* Row 2: three donuts */}
          <div className="grid gap-4 lg:grid-cols-3">
            <ChartCard title={t("studentsByClass")} icon={<Users className="size-4" />}>
              <DonutChart series={analytics.charts.classDistribution} centerLabel={t("students")} />
            </ChartCard>
            <ChartCard title={t("genderDistribution")} icon={<Users className="size-4" />}>
              <DonutChart series={analytics.charts.genderDistribution} colors={["var(--chart-1)", "var(--chart-5)"]} centerLabel={t("students")} />
            </ChartCard>
            <ChartCard title={t("parentEngagement")} icon={<UserCircle className="size-4" />}>
              <GaugeDonut value={analytics.parentStats.connectionRate} label={t("connected")} color="var(--chart-4)" />
            </ChartCard>
          </div>

          {/* Row 3: workload + monthly attendance */}
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title={t("teacherWorkload")} icon={<GraduationCap className="size-4" />}>
              <WorkloadBar series={analytics.charts.teacherWorkload} subjectsLabel={t("subjects")} classesLabel={t("classes")} />
            </ChartCard>
            <ChartCard title={t("monthlyAttendance")} icon={<CalendarCheck className="size-4" />}>
              <MonthlyAttendanceBar series={analytics.charts.monthlyAttendance} />
            </ChartCard>
          </div>

          {/* Row 4: top classes + attendance by class */}
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title={t("topPerformingClasses")}>
              <TopClassesTable
                rows={analytics.charts.topClasses}
                labels={{ class: t("colClass"), teacher: t("colTeacher"), average: t("colAverage"), empty: t("noClassData") }}
              />
            </ChartCard>
            <ChartCard title={t("attendanceByClass")}>
              <AttendanceByClassTable
                rows={analytics.charts.attendanceByClass}
                labels={{ class: t("colClass"), students: t("colStudents"), rate: t("colRate"), empty: t("noAttendanceData") }}
              />
            </ChartCard>
          </div>

          {/* Row 5: engagement + recent parents */}
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title={t("classesNeedingEngagement")}>
              <EngagementTable
                rows={analytics.parentStats.classesNeedingAttention.filter((c) => c.rate < 100)}
                labels={{ class: t("colClass"), connected: t("colConnected"), rate: t("colRate"), healthy: t("allEngaged") }}
              />
            </ChartCard>
            <ChartCard title={t("recentlyConnectedParents")}>
              <RecentParentsTable
                rows={analytics.parentStats.recentParents}
                labels={{ parent: t("colParent"), students: t("colStudents"), joined: t("colJoined"), empty: t("noRecentParents") }}
              />
            </ChartCard>
          </div>

          {/* Alerts */}
          <DashboardAlerts
            analytics={analytics}
            labels={{
              lowAttendanceTitle: t("alertLowAttendanceTitle"),
              lowAttendanceBody: t("alertLowAttendanceBody"),
              engagementTitle: t("alertEngagementTitle"),
              engagementBody: t("alertEngagementBody", { rate: analytics.parentStats.connectionRate }),
              healthyTitle: t("alertHealthyTitle"),
              healthyBody: t("alertHealthyBody"),
            }}
          />
        </>
      )}
    </div>
  );
}
