"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
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
import type { Exam } from "../types";
import { ExamTermBadge } from "./exam-term-badge";
import { ExamFlagBadge } from "./exam-flag-badge";

type Labels = {
  name: string;
  term: string;
  sequence: string;
  academicYear: string;
  published: string;
  markEntry: string;
  actions: string;
  view: string;
  edit: string;
  delete: string;
  publishedYes: string;
  publishedNo: string;
  markOpen: string;
  markClosed: string;
  selectAll: string;
  selectRow: string;
};

export function getExamColumns({
  labels,
  onEdit,
  onDelete,
}: {
  labels: Labels;
  onEdit: (exam: Exam) => void;
  onDelete: (exam: Exam) => void;
}): ColumnDef<Exam, unknown>[] {
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
          aria-label={labels.selectAll}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label={labels.selectRow}
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={labels.name} />
      ),
      cell: ({ row }) => (
        <span className="font-medium whitespace-nowrap">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "term",
      header: labels.term,
      enableSorting: false,
      cell: ({ row }) => <ExamTermBadge term={row.original.term} />,
    },
    {
      accessorKey: "sequence",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={labels.sequence} />
      ),
      cell: ({ row }) => (
        <span className="text-sm tabular-nums">{row.original.sequence}</span>
      ),
    },
    {
      accessorKey: "academicYear",
      header: labels.academicYear,
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap text-muted-foreground tabular-nums">
          {row.original.academicYear}
        </span>
      ),
    },
    {
      accessorKey: "published",
      header: labels.published,
      enableSorting: false,
      cell: ({ row }) => (
        <ExamFlagBadge
          active={row.original.published}
          activeLabel={labels.publishedYes}
          inactiveLabel={labels.publishedNo}
        />
      ),
    },
    {
      accessorKey: "markEntryAllowed",
      header: labels.markEntry,
      enableSorting: false,
      cell: ({ row }) => (
        <ExamFlagBadge
          active={row.original.markEntryAllowed}
          activeLabel={labels.markOpen}
          inactiveLabel={labels.markClosed}
        />
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">{labels.actions}</span>,
      enableSorting: false,
      cell: ({ row }) => {
        const exam = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={labels.actions}>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild>
                  <Link href={`/exams/${exam.id}`}>
                    <Eye className="mr-2 size-4" /> {labels.view}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(exam)}>
                  <Pencil className="mr-2 size-4" /> {labels.edit}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(exam)}
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
