"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { BadgeCheck, BookOpen, MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";
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
import type { Teacher } from "../types";
import { TeacherStatusBadge } from "./teacher-status-badge";

type Labels = {
  teacher: string;
  specialization: string;
  experience: string;
  load: string;
  status: string;
  actions: string;
  approve: string;
  edit: string;
  remove: string;
  years: string;
};

export function getTeacherColumns({
  labels,
  onApprove,
  onEdit,
  onRemove,
}: {
  labels: Labels;
  onApprove: (t: Teacher) => void;
  onEdit: (t: Teacher) => void;
  onRemove: (t: Teacher) => void;
}): ColumnDef<Teacher, unknown>[] {
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
      header: ({ column }) => <DataTableColumnHeader column={column} title={labels.teacher} />,
      cell: ({ row }) => {
        const t = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-9 border">
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {initials(t.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium">{t.name}</p>
              <p className="truncate text-xs text-muted-foreground">{t.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "specialization",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={labels.specialization} />
      ),
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate text-sm">{row.original.specialization}</p>
          <p className="truncate text-xs text-muted-foreground">
            {row.original.qualifications}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "experienceYears",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={labels.experience} />
      ),
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap tabular-nums">
          {row.original.experienceYears} {labels.years}
        </span>
      ),
    },
    {
      id: "load",
      header: labels.load,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <BookOpen className="size-3.5" /> {row.original.subjectsCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" /> {row.original.classesCount}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: labels.status,
      enableSorting: false,
      cell: ({ row }) => <TeacherStatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">{labels.actions}</span>,
      enableSorting: false,
      cell: ({ row }) => {
        const t = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            {t.status === "pending" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onApprove(t)}
                className="border-success/30 text-success hover:bg-success/10 hover:text-success"
              >
                <BadgeCheck /> {labels.approve}
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={labels.actions}>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => onEdit(t)}>
                  <Pencil className="mr-2 size-4" /> {labels.edit}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onRemove(t)}
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
