"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AttendanceSession } from "../types";

type Labels = {
  date: string;
  class: string;
  subject: string;
  present: string;
  rate: string;
  actions: string;
  view: string;
  ofTotal: string;
};

function rateTone(rate: number): string {
  if (rate >= 90) return "text-success";
  if (rate >= 75) return "text-warning";
  return "text-destructive";
}

export function getAttendanceColumns({
  labels,
  locale,
  onView,
}: {
  labels: Labels;
  locale: string;
  onView: (s: AttendanceSession) => void;
}): ColumnDef<AttendanceSession, unknown>[] {
  return [
    {
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={labels.date} />
      ),
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap tabular-nums">
          {formatDate(row.original.date, locale)}
        </span>
      ),
    },
    {
      accessorKey: "className",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={labels.class} />
      ),
      cell: ({ row }) => (
        <span className="text-sm font-medium whitespace-nowrap">
          {row.original.className}
        </span>
      ),
    },
    {
      accessorKey: "subjectName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={labels.subject} />
      ),
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap text-muted-foreground">
          {row.original.subjectName}
        </span>
      ),
    },
    {
      id: "present",
      accessorFn: (r) => r.counts.present,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={labels.present} />
      ),
      cell: ({ row }) => {
        const c = row.original.counts;
        return (
          <span className="text-sm tabular-nums">
            <span className="font-medium">{c.present}</span>
            <span className="text-muted-foreground">
              {" "}
              {labels.ofTotal} {c.total}
            </span>
          </span>
        );
      },
    },
    {
      id: "rate",
      accessorFn: (r) => r.rate,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={labels.rate} />
      ),
      cell: ({ row }) => (
        <span
          className={cn("text-sm font-semibold tabular-nums", rateTone(row.original.rate))}
        >
          {row.original.rate}%
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">{labels.actions}</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(row.original)}
            aria-label={labels.view}
          >
            <Eye className="size-4" /> {labels.view}
          </Button>
        </div>
      ),
    },
  ];
}
