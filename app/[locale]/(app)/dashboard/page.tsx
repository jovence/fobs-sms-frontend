"use client";

import { useTranslations } from "next-intl";
import { CalendarCheck, GraduationCap, Trophy, Users } from "lucide-react";
import { useActiveSchool, useCurrentUser } from "@/features/auth/hooks";
import { StatCard } from "@/features/dashboard/components/stat-card";
import { EmptyState } from "@/components/common/states";
import { formatNumber, formatPercent } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const user = useCurrentUser();
  const active = useActiveSchool();
  const school = active?.school;

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
          <Badge variant="secondary" className="gap-1.5">
            {school.academicYear}
          </Badge>
        )}
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("students")}
          value={formatNumber(school?.studentCount ?? 0)}
          icon={Users}
          delta={4.2}
          accent="primary"
        />
        <StatCard
          label={t("teachers")}
          value={formatNumber(school?.teacherCount ?? 0)}
          icon={GraduationCap}
          delta={1.1}
          accent="info"
        />
        <StatCard
          label={t("attendanceRate")}
          value={formatPercent(93.4)}
          icon={CalendarCheck}
          delta={0.8}
          accent="success"
        />
        <StatCard
          label={t("passRate")}
          value={formatPercent(78.2)}
          icon={Trophy}
          delta={-1.4}
          accent="warning"
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("recentActivity")}</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState title={t("noActivity")} />
        </CardContent>
      </Card>
    </div>
  );
}
