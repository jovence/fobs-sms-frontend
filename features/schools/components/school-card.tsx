"use client";

import { useTranslations } from "next-intl";
import { BookOpen, GraduationCap, MapPin, MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatNumber } from "@/lib/format";
import type { School } from "@/types";
import { SubscriptionBadge } from "./subscription-badge";

export function SchoolCard({
  school,
  onEdit,
  onDelete,
}: {
  school: School;
  onEdit: (s: School) => void;
  onDelete: (s: School) => void;
}) {
  const t = useTranslations("schools");
  const stats = [
    { icon: Users, value: school.studentCount ?? 0, label: t("stats.students") },
    { icon: GraduationCap, value: school.teacherCount ?? 0, label: t("stats.teachers") },
    { icon: BookOpen, value: school.classCount ?? 0, label: t("stats.classes") },
  ];

  return (
    <div className="card-interactive flex flex-col rounded-2xl border bg-card p-5 shadow-[var(--shadow-sm)]">
      <div className="flex items-start gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-sidebar font-heading text-sm font-bold text-sidebar-primary">
          {school.acronym.slice(0, 3)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <SubscriptionBadge tier={school.subscription} />
            {school.isDemo && (
              <Badge variant="secondary" className="h-5 text-[10px]">
                {t("demo")}
              </Badge>
            )}
          </div>
          <h3 className="mt-1.5 truncate font-heading text-base leading-tight font-semibold">
            {school.name}
          </h3>
          <p className="text-xs text-muted-foreground tabular-nums">{school.code}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={t("actions.menu")}>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onEdit(school)}>
              <Pencil className="mr-2 size-4" /> {t("actions.edit")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(school)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 size-4" /> {t("actions.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {school.address && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{school.address}</span>
        </p>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-4">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-0.5 text-center">
            <s.icon className="size-4 text-muted-foreground" />
            <span className="font-heading text-base font-bold tabular-nums">
              {formatNumber(s.value)}
            </span>
            <span className="text-[11px] text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
