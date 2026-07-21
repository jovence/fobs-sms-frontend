"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Briefcase, Eye, MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { initials } from "@/lib/format";
import type { Parent } from "../types";

type Labels = {
  parent: string;
  email: string;
  children: string;
  occupation: string;
  actions: string;
  view: string;
  edit: string;
  remove: string;
};

export function getParentColumns({
  labels,
  onView,
  onEdit,
  onRemove,
}: {
  labels: Labels;
  onView: (p: Parent) => void;
  onEdit: (p: Parent) => void;
  onRemove: (p: Parent) => void;
}): ColumnDef<Parent, unknown>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => <DataTableColumnHeader column={column} title={labels.parent} />,
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-9 border">
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {initials(p.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium">{p.name}</p>
              <p className="truncate text-xs text-muted-foreground tabular-nums">{p.phone}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => <DataTableColumnHeader column={column} title={labels.email} />,
      cell: ({ row }) => (
        <span className="truncate text-sm text-muted-foreground">{row.original.email}</span>
      ),
    },
    {
      accessorKey: "childrenCount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={labels.children} />
      ),
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 text-sm tabular-nums">
          <Users className="size-3.5 text-muted-foreground" />
          {row.original.childrenCount}
        </span>
      ),
    },
    {
      accessorKey: "occupation",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={labels.occupation} />
      ),
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 text-sm whitespace-nowrap text-muted-foreground">
          <Briefcase className="size-3.5" />
          {row.original.occupation}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">{labels.actions}</span>,
      enableSorting: false,
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={labels.actions}>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => onView(p)}>
                  <Eye className="mr-2 size-4" /> {labels.view}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(p)}>
                  <Pencil className="mr-2 size-4" /> {labels.edit}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onRemove(p)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 size-4" /> {labels.remove}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
