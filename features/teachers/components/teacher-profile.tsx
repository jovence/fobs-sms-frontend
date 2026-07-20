"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  ArrowLeft,
  BookOpen,
  BookPlus,
  Briefcase,
  ClipboardList,
  Layers,
  Mail,
  MapPin,
  Phone,
  School,
  User,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/states";
import { initials, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useRemoveTeacherSubject, useTeacher } from "../hooks";
import type { AssignedSubject } from "../types";
import { TeacherStatusBadge } from "./teacher-status-badge";

/** A compact profile stat tile (Subjects Teaching / Teaching Load). */
function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  hint: string;
  icon: typeof BookOpen;
  accent: "primary" | "warning";
}) {
  const chip =
    accent === "primary" ? "bg-primary/10 text-primary" : "bg-warning/15 text-warning";
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </p>
          <p className="font-heading text-3xl font-bold tabular-nums">{value}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        <span className={cn("grid size-11 shrink-0 place-items-center rounded-lg", chip)}>
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}

/** A single labelled field inside an info card. */
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium break-words">{value}</p>
    </div>
  );
}

export function TeacherProfile({ id }: { id: string }) {
  const t = useTranslations("teachers");
  const locale = useLocale();
  const { data, isLoading, isError, refetch } = useTeacher(id);
  const removeSubject = useRemoveTeacherSubject(id);
  const [subjectTarget, setSubjectTarget] = useState<AssignedSubject | null>(null);

  const dash = "—";

  if (isLoading) return <LoadingState label={t("profile.loading")} />;
  if (isError || !data) {
    return (
      <ErrorState
        title={t("profile.errorTitle")}
        description={t("profile.errorDescription")}
        onRetry={() => refetch()}
      />
    );
  }

  const active = data.status === "active";

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/teachers">
            <ArrowLeft /> {t("profile.back")}
          </Link>
        </Button>
        {active && (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" asChild>
              <Link href={`/teachers/${id}/assign-subjects`}>
                <BookPlus /> {t("profile.assignSubjects")}
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/teachers/${id}/assign-classes`}>
                <School /> {t("profile.assignClasses")}
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Header card */}
      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar className="size-16 border">
            {data.avatarUrl && <AvatarImage src={data.avatarUrl} alt={data.name} />}
            <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
              {initials(data.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-2">
            <h1 className="font-heading text-2xl font-bold tracking-tight">{data.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                {data.specialization || t("profile.generalTeacher")}
              </Badge>
              <TeacherStatusBadge status={data.status} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stat tiles */}
      <div className="grid gap-4 sm:grid-cols-2">
        <StatTile
          label={t("profile.stats.subjects")}
          value={data.totalSubjects}
          hint={t("profile.stats.subjectsHint")}
          icon={BookOpen}
          accent="primary"
        />
        <StatTile
          label={t("profile.stats.load")}
          value={data.totalAssignments}
          hint={t("profile.stats.loadHint")}
          icon={ClipboardList}
          accent="warning"
        />
      </div>

      {/* Info cards */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-4 text-primary" /> {t("profile.personal.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label={t("profile.personal.name")} value={data.name || dash} />
            <Field
              label={t("profile.personal.experience")}
              value={t("profile.personal.yearsValue", { count: data.experienceYears })}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="size-4 text-primary" /> {t("profile.contact.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <Mail className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
              <Field label={t("profile.contact.email")} value={data.email || dash} />
            </div>
            <div className="flex items-start gap-2">
              <Phone className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
              <Field label={t("profile.contact.phone")} value={data.phone || dash} />
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
              <Field label={t("profile.contact.address")} value={data.address || dash} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="size-4 text-primary" /> {t("profile.professional.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field
              label={t("profile.professional.specialization")}
              value={data.specialization || dash}
            />
            <Field
              label={t("profile.professional.qualifications")}
              value={data.qualifications || dash}
            />
            <Field
              label={t("profile.professional.joined")}
              value={data.joinedAt ? formatDate(data.joinedAt, locale) : dash}
            />
            {active && data.approvedAt && (
              <Field
                label={t("profile.professional.approved")}
                value={formatDate(data.approvedAt, locale)}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assignments (active teachers only) */}
      {active && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Assigned subjects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="size-4 text-primary" />
                  {t("profile.subjects.title", { count: data.totalSubjects })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.subjects.length > 0 ? (
                  <ul className="space-y-2">
                    {data.subjects.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                            <BookOpen className="size-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{s.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {t("profile.subjects.code", { code: s.code ?? "—" })}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          aria-label={t("profile.subjects.remove")}
                          onClick={() => setSubjectTarget(s)}
                        >
                          <X />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState
                    icon={<BookOpen className="size-6" />}
                    title={t("profile.subjects.emptyTitle")}
                    action={
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/teachers/${id}/assign-subjects`}>
                          <BookPlus /> {t("profile.assignSubjects")}
                        </Link>
                      </Button>
                    }
                  />
                )}
              </CardContent>
            </Card>

            {/* Assigned classes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-4 text-primary" />
                  {t("profile.classes.title", { count: data.totalClasses })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.classes.length > 0 ? (
                  <ul className="space-y-2">
                    {data.classes.map((c) => (
                      <li
                        key={c.id}
                        className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3"
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-success/10 text-success">
                          <Users className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{c.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {t("profile.classes.students", { count: c.studentCount })}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState
                    icon={<Users className="size-6" />}
                    title={t("profile.classes.emptyTitle")}
                    action={
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/teachers/${id}/assign-classes`}>
                          <School /> {t("profile.assignClasses")}
                        </Link>
                      </Button>
                    }
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detailed teaching assignments */}
          {data.assignments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="size-4 text-primary" /> {t("profile.assignments.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("profile.assignments.class")}</TableHead>
                      <TableHead>{t("profile.assignments.subjects")}</TableHead>
                      <TableHead className="text-right">
                        {t("profile.assignments.students")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.assignments.map((a) => (
                      <TableRow key={a.classId}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                              <School className="size-4" />
                            </span>
                            <span className="font-medium">{a.className}</span>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-normal">
                          <div className="flex flex-wrap gap-1">
                            {a.subjects.map((s) => (
                              <Badge key={s.id} variant="secondary">
                                {s.name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {t("profile.assignments.studentsCount", { count: a.studentCount })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Biography */}
      {data.bio && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="size-4 text-primary" /> {t("profile.biography.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">{data.bio}</p>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={!!subjectTarget}
        onOpenChange={(o) => !o && setSubjectTarget(null)}
        title={t("profile.subjects.removeTitle")}
        description={t("profile.subjects.removeDescription", { name: subjectTarget?.name ?? "" })}
        confirmLabel={t("profile.subjects.remove")}
        cancelLabel={t("form.cancel")}
        destructive
        isPending={removeSubject.isPending}
        onConfirm={async () => {
          if (!subjectTarget) return;
          await removeSubject.mutateAsync(subjectTarget.id);
          toast.success(t("profile.subjects.removed"));
          setSubjectTarget(null);
        }}
      />
    </div>
  );
}
