"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  BanknoteArrowUp,
  CalendarCheck,
  GraduationCap,
  PenSquare,
  School,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { formatDate } from "@/lib/format";
import type { ActivityEntry, ActivityType } from "../types";

const META: Record<ActivityType, { icon: LucideIcon; tone: string }> = {
  enrollment: { icon: UserPlus, tone: "bg-primary/10 text-primary" },
  marks: { icon: PenSquare, tone: "bg-info/10 text-info" },
  attendance: { icon: CalendarCheck, tone: "bg-success/10 text-success" },
  payment: { icon: BanknoteArrowUp, tone: "bg-warning/15 text-warning" },
  teacher: { icon: GraduationCap, tone: "bg-chart-5/15 text-chart-5" },
  school: { icon: School, tone: "bg-primary/10 text-primary" },
};

function timeOf(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CM" : "en-CM", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

type Labels = {
  type: string;
  description: string;
  actor: string;
  school: string;
  when: string;
  types: Record<ActivityType, string>;
};

export function getActivityColumns({
  labels,
  locale,
}: {
  labels: Labels;
  locale: string;
}): ColumnDef<ActivityEntry, unknown>[] {
  return [
    {
      accessorKey: "type",
      header: labels.type,
      enableSorting: false,
      cell: ({ row }) => {
        const { icon: Icon, tone } = META[row.original.type];
        return (
          <span className="inline-flex items-center gap-2">
            <span className={`grid size-7 place-items-center rounded-lg ${tone}`}>
              <Icon className="size-4" />
            </span>
            <span className="text-sm font-medium whitespace-nowrap">{labels.types[row.original.type]}</span>
          </span>
        );
      },
    },
    {
      accessorKey: "description",
      header: labels.description,
      enableSorting: false,
      cell: ({ row }) => <span className="text-sm">{row.original.description}</span>,
    },
    {
      accessorKey: "actor",
      header: labels.actor,
      enableSorting: false,
      cell: ({ row }) => <span className="text-sm whitespace-nowrap text-muted-foreground">{row.original.actor}</span>,
    },
    {
      accessorKey: "school",
      header: labels.school,
      enableSorting: false,
      cell: ({ row }) => <span className="text-sm whitespace-nowrap text-muted-foreground">{row.original.school}</span>,
    },
    {
      accessorKey: "at",
      header: ({ column }) => <DataTableColumnHeader column={column} title={labels.when} />,
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm tabular-nums">
          {formatDate(row.original.at, locale)}
          <span className="ml-1.5 text-xs text-muted-foreground">{timeOf(row.original.at, locale)}</span>
        </span>
      ),
    },
  ];
}
