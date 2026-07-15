"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { formatDate, initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminUser, Role } from "../types";

const ROLE_STYLE: Record<Role, string> = {
  owner: "bg-primary/10 text-primary ring-primary/20",
  teacher: "bg-info/10 text-info ring-info/20",
  parent: "bg-success/10 text-success ring-success/20",
  admin: "bg-warning/15 text-warning ring-warning/25",
};

type Labels = {
  user: string;
  role: string;
  phone: string;
  joined: string;
  actions: string;
  delete: string;
  roles: Record<Role, string>;
};

export function getAdminUserColumns({
  labels,
  locale,
  onDelete,
}: {
  labels: Labels;
  locale: string;
  onDelete: (u: AdminUser) => void;
}): ColumnDef<AdminUser, unknown>[] {
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
      cell: ({ row }) =>
        row.original.role === "admin" ? (
          <span className="block size-4" />
        ) : (
          <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label="Select row" />
        ),
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title={labels.user} />,
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-9 border">
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {initials(u.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium">{u.name}</p>
              <p className="truncate text-xs text-muted-foreground">{u.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: labels.role,
      enableSorting: false,
      cell: ({ row }) => (
        <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset", ROLE_STYLE[row.original.role])}>
          {labels.roles[row.original.role]}
        </span>
      ),
    },
    {
      accessorKey: "phone",
      header: labels.phone,
      enableSorting: false,
      cell: ({ row }) => <span className="text-sm whitespace-nowrap tabular-nums text-muted-foreground">{row.original.phone}</span>,
    },
    {
      accessorKey: "joinedAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title={labels.joined} />,
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap text-muted-foreground tabular-nums">{formatDate(row.original.joinedAt, locale)}</span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">{labels.actions}</span>,
      enableSorting: false,
      cell: ({ row }) => {
        const u = row.original;
        if (u.role === "admin") return null;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={labels.actions}>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onDelete(u)} className="text-destructive focus:text-destructive">
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
