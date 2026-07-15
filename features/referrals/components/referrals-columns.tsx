"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { School } from "lucide-react";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { formatCurrency, formatDate } from "@/lib/format";
import type { ReferralUsage } from "../types";
import { ReferralStatusBadge } from "./referral-status-badge";

type Labels = {
  school: string;
  date: string;
  discount: string;
  earnings: string;
  status: string;
};

export function getReferralColumns({
  labels,
  locale,
}: {
  labels: Labels;
  locale: string;
}): ColumnDef<ReferralUsage, unknown>[] {
  return [
    {
      accessorKey: "schoolName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={labels.school} />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <School className="size-4" />
          </span>
          <p className="min-w-0 truncate font-medium">{row.original.schoolName}</p>
        </div>
      ),
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={labels.date} />
      ),
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap text-muted-foreground tabular-nums">
          {formatDate(row.original.date, locale)}
        </span>
      ),
    },
    {
      accessorKey: "discount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={labels.discount} />
      ),
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap tabular-nums">
          {formatCurrency(row.original.discount, locale)}
        </span>
      ),
    },
    {
      accessorKey: "earnings",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={labels.earnings} />
      ),
      cell: ({ row }) => {
        const value = row.original.earnings;
        return (
          <span
            className={
              value > 0
                ? "text-sm font-medium whitespace-nowrap text-success tabular-nums"
                : "text-sm whitespace-nowrap text-muted-foreground tabular-nums"
            }
          >
            {value > 0 ? "+" : ""}
            {formatCurrency(value, locale)}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: labels.status,
      enableSorting: false,
      cell: ({ row }) => <ReferralStatusBadge status={row.original.status} />,
    },
  ];
}
