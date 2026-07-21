"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowLeft,
  CalendarDays,
  GraduationCap,
  Hash,
  MapPin,
  Pencil,
  Phone,
  Repeat,
  User,
  UserRound,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState, LoadingState } from "@/components/common/states";
import { initials, formatDate } from "@/lib/format";
import { useClassOptions } from "@/features/academics/hooks";
import { useStudent } from "../../hooks";
import { StudentStatusBadge } from "../student-status-badge";
import { StudentFormSheet } from "../student-form-sheet";

/** A single labelled field inside an info card. */
function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  );
}

/** Student profile: header, personal / academic / guardian info, back link and edit action. */
export function StudentDetail({ id }: { id: string }) {
  const t = useTranslations("students.detail");
  const locale = useLocale();
  const { data, isLoading, isError, refetch } = useStudent(id);
  const { data: classOptions = [] } = useClassOptions();
  const [editOpen, setEditOpen] = useState(false);

  const dash = "—";

  if (isLoading) return <LoadingState label={t("loading")} />;
  if (isError || !data) {
    return (
      <div className="space-y-6">
        <BackLink label={t("back")} />
        <ErrorState
          title={t("errorTitle")}
          description={t("errorDescription")}
          onRetry={() => refetch()}
          retryLabel={t("retry")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BackLink label={t("back")} />
        <Button size="sm" onClick={() => setEditOpen(true)}>
          <Pencil /> {t("edit")}
        </Button>
      </div>

      {/* Header card */}
      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar className="size-16 border">
            {data.photoUrl && <AvatarImage src={data.photoUrl} alt={data.fullName} />}
            <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
              {initials(data.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-2">
            <h1 className="font-heading text-2xl font-bold tracking-tight">{data.fullName}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="tabular-nums">{data.matricule ?? dash}</span>
              {data.className && (
                <>
                  <span aria-hidden>·</span>
                  <span>{data.className}</span>
                </>
              )}
              <StudentStatusBadge status={data.status} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info cards */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-4 text-primary" /> {t("sections.personal")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3.5">
            <Row icon={User} label={t("fields.fullName")} value={data.fullName || dash} />
            <Row icon={Hash} label={t("fields.matricule")} value={data.matricule ?? dash} />
            <Row
              icon={UserRound}
              label={t("fields.gender")}
              value={data.gender === "Male" ? t("male") : t("female")}
            />
            <Row
              icon={CalendarDays}
              label={t("fields.dob")}
              value={data.dateOfBirth ? formatDate(data.dateOfBirth, locale) : dash}
            />
            <Row icon={MapPin} label={t("fields.placeOfBirth")} value={data.placeOfBirth || dash} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="size-4 text-primary" /> {t("sections.academic")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3.5">
            <Row icon={GraduationCap} label={t("fields.class")} value={data.className || dash} />
            {data.code && <Row icon={Hash} label={t("fields.code")} value={data.code} />}
            <Row
              icon={Repeat}
              label={t("fields.repeater")}
              value={data.isRepeater ? t("repeater") : t("notRepeater")}
            />
            <div className="flex items-start gap-2.5">
              <User className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 space-y-1">
                <p className="text-xs text-muted-foreground">{t("fields.status")}</p>
                <StudentStatusBadge status={data.status} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="size-4 text-primary" /> {t("sections.guardian")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3.5">
            <Row icon={UserRound} label={t("fields.guardian")} value={data.guardianName ?? dash} />
            <Row icon={Phone} label={t("fields.contact")} value={data.guardianContact ?? dash} />
            <Row icon={UserRound} label={t("fields.email")} value={data.guardianEmail ?? dash} />
          </CardContent>
        </Card>
      </div>

      <StudentFormSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        student={data}
        classes={classOptions}
      />
    </div>
  );
}

function BackLink({ label }: { label: string }) {
  return (
    <Button variant="outline" size="sm" asChild>
      <Link href="/students">
        <ArrowLeft /> {label}
      </Link>
    </Button>
  );
}
