"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Subject, SubjectLevel, SubjectSeries } from "../types";

const SERIES_STYLE: Record<SubjectSeries, string> = {
  science: "bg-info/10 text-info ring-info/20",
  art: "bg-chart-5/15 text-chart-5 ring-chart-5/25",
  both: "bg-success/10 text-success ring-success/20",
};

type Labels = {
  name: string;
  series: string;
  level: string;
  classes: string;
  actions: string;
  edit: string;
  delete: string;
  seriesLabels: Record<SubjectSeries, string>;
  levelLabels: Record<SubjectLevel, string>;
};

export function getSubjectColumns({
  labels,
  onEdit,
  onDelete,
}: {
  labels: Labels;
  onEdit: (s: Subject) => void;
  onDelete: (s: Subject) => void;
}): ColumnDef<Subject, unknown>[] {
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
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-lg bg-secondary font-mono text-xs font-bold text-secondary-foreground">
            {row.original.code}
          </span>
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "series",
      header: labels.series,
      enableSorting: false,
      cell: ({ row }) => (
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
            SERIES_STYLE[row.original.series],
          )}
        >
          {labels.seriesLabels[row.original.series]}
        </span>
      ),
    },
    {
      accessorKey: "level",
      header: labels.level,
      enableSorting: false,
      cell: ({ row }) =>
        row.original.level ? (
          <Badge variant="secondary" className="h-5 px-2 text-[11px] font-medium">
            {labels.levelLabels[row.original.level]}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: "classesCount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={labels.classes} />
      ),
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 text-sm tabular-nums">
          <Users className="size-3.5 text-muted-foreground" /> {row.original.classesCount}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">{labels.actions}</span>,
      enableSorting: false,
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={labels.actions}>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onEdit(s)}>
                  <Pencil className="mr-2 size-4" /> {labels.edit}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(s)}
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
