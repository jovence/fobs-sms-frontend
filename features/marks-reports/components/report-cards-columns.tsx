"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { FileText } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { initials } from "@/lib/format";
import type { ReportRow } from "../types";
import { DecisionBadge } from "./decision-badge";

type Labels = {
  student: string;
  class: string;
  average: string;
  rank: string;
  decision: string;
  actions: string;
  generate: string;
};

export function getReportColumns({
  labels,
  formatAverage,
  formatRank,
  onGenerate,
}: {
  labels: Labels;
  formatAverage: (average: number) => string;
  formatRank: (rank: number, total: number) => string;
  onGenerate: (row: ReportRow) => void;
}): ColumnDef<ReportRow, unknown>[] {
  return [
    {
      accessorKey: "fullName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={labels.student} />
      ),
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-9 border">
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {initials(r.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium">{r.fullName}</p>
              <p className="truncate text-xs text-muted-foreground tabular-nums">
                {r.matricule ?? "—"}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "className",
      header: labels.class,
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap">{row.original.className}</span>
      ),
    },
    {
      accessorKey: "average",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={labels.average} />
      ),
      cell: ({ row }) => (
        <span className="text-sm font-medium tabular-nums">
          {formatAverage(row.original.average)}
        </span>
      ),
    },
    {
      accessorKey: "rank",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={labels.rank} />
      ),
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap text-muted-foreground tabular-nums">
          {formatRank(row.original.rank, row.original.total)}
        </span>
      ),
    },
    {
      accessorKey: "decision",
      header: labels.decision,
      enableSorting: false,
      cell: ({ row }) => <DecisionBadge decision={row.original.decision} />,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">{labels.actions}</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onGenerate(row.original)}
          >
            <FileText /> {labels.generate}
          </Button>
        </div>
      ),
    },
  ];
}
