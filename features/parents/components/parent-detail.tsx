"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  Phone,
  Unlink,
  UserRound,
  Users,
} from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/states";
import { formatDate, initials } from "@/lib/format";
import { useDeleteParent, useParent } from "../hooks";

export function ParentDetail({ id }: { id: string }) {
  const t = useTranslations("parents");
  const locale = useLocale();
  const router = useRouter();
  const { data: parent, isLoading, isError, refetch } = useParent(id);
  const disconnect = useDeleteParent();
  const [disconnectOpen, setDisconnectOpen] = useState(false);

  if (isLoading) return <LoadingState label={t("detail.loading")} />;

  if (isError || !parent) {
    return (
      <ErrorState
        title={t("detail.errorTitle")}
        description={t("detail.errorDescription")}
        onRetry={() => refetch()}
        retryLabel={t("detail.retry")}
      />
    );
  }

  const statCards = [
    {
      key: "students",
      label: t("detail.stats.connectedStudents"),
      value: String(parent.connectedStudents.length),
      icon: <Users className="size-4" />,
    },
    {
      key: "status",
      label: t("detail.stats.accountStatus"),
      value: parent.isApproved ? t("detail.status.approved") : t("detail.status.pending"),
      icon: parent.isApproved ? (
        <CheckCircle2 className="size-4 text-emerald-600" />
      ) : (
        <Clock className="size-4 text-amber-600" />
      ),
    },
    {
      key: "since",
      label: t("detail.stats.memberSince"),
      value: formatDate(parent.createdAt, locale),
      icon: <CalendarDays className="size-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
          <Link href="/parents">
            <ArrowLeft /> {t("detail.back")}
          </Link>
        </Button>
      </div>

      {/* Header */}
      <Card>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="size-14 border">
                <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">
                  {initials(parent.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-xl font-bold tracking-tight">
                    {parent.name}
                  </h1>
                  <Badge variant={parent.isApproved ? "secondary" : "outline"}>
                    {parent.isApproved
                      ? t("detail.status.approved")
                      : t("detail.status.pending")}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {parent.phone && (
                    <span className="inline-flex items-center gap-1.5 tabular-nums">
                      <Phone className="size-3.5" /> {parent.phone}
                    </span>
                  )}
                  {parent.email && (
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="size-3.5" /> {parent.email}
                    </span>
                  )}
                  {parent.occupation && (
                    <span className="inline-flex items-center gap-1.5">
                      <Briefcase className="size-3.5" /> {parent.occupation}
                    </span>
                  )}
                  {parent.address && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-3.5" /> {parent.address}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {parent.connectedStudents.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setDisconnectOpen(true)}
              >
                <Unlink /> {t("detail.disconnectAll")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {statCards.map((card) => (
          <Card key={card.key} size="sm">
            <CardContent className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground">
                {card.icon}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs text-muted-foreground">{card.label}</p>
                <p className="truncate font-heading text-lg font-semibold">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Connected students */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="size-4" /> {t("detail.connectedStudents")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {parent.connectedStudents.length === 0 ? (
            <EmptyState
              icon={<UserRound className="size-6" />}
              title={t("detail.noStudentsTitle")}
              description={t("detail.noStudentsDescription")}
            />
          ) : (
            <ul className="divide-y">
              {parent.connectedStudents.map((student) => (
                <li
                  key={student.id}
                  className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9 border">
                      <AvatarFallback className="bg-muted text-xs font-semibold">
                        {initials(student.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{student.fullName}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        {student.matricule && (
                          <span className="tabular-nums">{student.matricule}</span>
                        )}
                        {student.className && <span>{student.className}</span>}
                        {student.gender && <span>{student.gender}</span>}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/students/${student.id}`}>{t("detail.viewStudent")}</Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={disconnectOpen}
        onOpenChange={setDisconnectOpen}
        title={t("detail.disconnect.title")}
        description={t("detail.disconnect.description", { name: parent.name })}
        confirmLabel={t("detail.disconnectAll")}
        cancelLabel={t("form.cancel")}
        destructive
        isPending={disconnect.isPending}
        onConfirm={async () => {
          await disconnect.mutateAsync(parent.id);
          toast.success(t("detail.disconnect.success"));
          setDisconnectOpen(false);
          router.push("/parents");
        }}
      />
    </div>
  );
}
