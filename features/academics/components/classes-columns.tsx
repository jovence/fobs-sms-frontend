"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { BookOpen, MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { ClassLevel, ClassSection, SchoolClass } from "../types";

type Labels = {
  name: string;
  master: string;
  students: string;
  subjects: string;
  actions: string;
  edit: string;
  delete: string;
  level: Record<ClassLevel, string>;
  section: Record<ClassSection, string>;
};

export function getClassColumns({
  labels,
  onEdit,
  onDelete,
}: {
  labels: Labels;
  onEdit: (c: SchoolClass) => void;
  onDelete: (c: SchoolClass) => void;
}): ColumnDef<SchoolClass, unknown>[] {
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
      header: ({ column }) => <DataTableColumnHeader column={column} title={labels.name} />,
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
              {c.name.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium">{c.name}</p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                  {labels.level[c.level]}
                </Badge>
                <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
                  {labels.section[c.section]}
                </Badge>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "classMaster",
      header: labels.master,
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.classMaster ?? <span className="text-muted-foreground">—</span>}
        </span>
      ),
    },
    {
      accessorKey: "studentsCount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={labels.students} />
      ),
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 text-sm tabular-nums">
          <Users className="size-3.5 text-muted-foreground" /> {row.original.studentsCount}
        </span>
      ),
    },
    {
      accessorKey: "subjectsCount",
      header: labels.subjects,
      enableSorting: false,
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 text-sm tabular-nums">
          <BookOpen className="size-3.5 text-muted-foreground" /> {row.original.subjectsCount}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">{labels.actions}</span>,
      enableSorting: false,
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={labels.actions}>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onEdit(c)}>
                  <Pencil className="mr-2 size-4" /> {labels.edit}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(c)}
                  className="text-destructive focus:text-destructive"
                >
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
