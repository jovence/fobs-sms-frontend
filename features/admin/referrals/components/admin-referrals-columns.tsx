"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Power, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminReferrer } from "../types";

type Labels = {
  referrer: string;
  code: string;
  residence: string;
  referrals: string;
  earnings: string;
  status: string;
  actions: string;
  active: string;
  inactive: string;
  activate: string;
  deactivate: string;
  delete: string;
};

export function getReferrerColumns({
  labels,
  locale,
  onToggle,
  onDelete,
}: {
  labels: Labels;
  locale: string;
  onToggle: (r: AdminReferrer) => void;
  onDelete: (r: AdminReferrer) => void;
}): ColumnDef<AdminReferrer, unknown>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label="Select row" />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title={labels.referrer} />,
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.name}</p>
          <p className="truncate text-xs text-muted-foreground tabular-nums">{row.original.phone}</p>
        </div>
      ),
    },
    {
      accessorKey: "code",
      header: labels.code,
      enableSorting: false,
      cell: ({ row }) => (
        <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-xs font-semibold text-secondary-foreground">
          {row.original.code}
        </span>
      ),
    },
    {
      accessorKey: "residence",
      header: labels.residence,
      enableSorting: false,
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.residence}</span>,
    },
    {
      accessorKey: "referralCount",
      header: ({ column }) => <DataTableColumnHeader column={column} title={labels.referrals} />,
      cell: ({ row }) => <span className="text-sm tabular-nums">{row.original.referralCount}</span>,
    },
    {
      accessorKey: "earnings",
      header: ({ column }) => <DataTableColumnHeader column={column} title={labels.earnings} />,
      cell: ({ row }) => (
        <span className="text-sm font-medium tabular-nums">{formatCurrency(row.original.earnings, locale)}</span>
      ),
    },
    {
      accessorKey: "isActive",
      header: labels.status,
      enableSorting: false,
      cell: ({ row }) => {
        const active = row.original.isActive;
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
              active ? "bg-success/10 text-success ring-success/20" : "bg-muted text-muted-foreground ring-border",
            )}
          >
            <span className="size-1.5 rounded-full bg-current" />
            {active ? labels.active : labels.inactive}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">{labels.actions}</span>,
      enableSorting: false,
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={labels.actions}>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onToggle(r)}>
                  <Power className="mr-2 size-4" /> {r.isActive ? labels.deactivate : labels.activate}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete(r)} className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 size-4" /> {labels.delete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
