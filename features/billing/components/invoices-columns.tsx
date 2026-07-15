"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Receipt } from "lucide-react";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Invoice } from "../types";
import { InvoiceStatusBadge } from "./invoice-status-badge";

type Labels = {
  invoice: string;
  date: string;
  description: string;
  amount: string;
  status: string;
};

export function getInvoiceColumns({
  labels,
  locale,
  describe,
}: {
  labels: Labels;
  locale: string;
  /** Turns an invoice into a localized human-readable description. */
  describe: (invoice: Invoice) => string;
}): ColumnDef<Invoice, unknown>[] {
  return [
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
      accessorKey: "number",
      header: labels.description,
      enableSorting: false,
      cell: ({ row }) => {
        const inv = row.original;
        return (
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Receipt className="size-4.5" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium">{describe(inv)}</p>
              <p className="truncate text-xs text-muted-foreground tabular-nums">
                {inv.number}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <div className="flex justify-end">
          <DataTableColumnHeader column={column} title={labels.amount} />
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-right text-sm font-medium whitespace-nowrap tabular-nums">
          {formatCurrency(row.original.amount, locale)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: labels.status,
      enableSorting: false,
      cell: ({ row }) => <InvoiceStatusBadge status={row.original.status} />,
    },
  ];
}
