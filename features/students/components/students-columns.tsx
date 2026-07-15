"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { formatDate, initials } from "@/lib/format";
import type { RegistrationStatus, Student } from "../types";
import { StudentStatusBadge } from "./student-status-badge";

type Labels = {
  student: string;
  class: string;
  gender: string;
  dob: string;
  status: string;
  actions: string;
  edit: string;
  delete: string;
  setStatus: string;
  male: string;
  female: string;
  approve: string;
  reject: string;
  markPending: string;
};

export function getStudentColumns({
  labels,
  locale,
  onEdit,
  onDelete,
  onStatus,
}: {
  labels: Labels;
  locale: string;
  onEdit: (s: Student) => void;
  onDelete: (s: Student) => void;
  onStatus: (s: Student, status: RegistrationStatus) => void;
}): ColumnDef<Student, unknown>[] {
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
      accessorKey: "fullName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={labels.student} />
      ),
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-9 border">
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {initials(s.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium">{s.fullName}</p>
              <p className="truncate text-xs text-muted-foreground tabular-nums">
                {s.matricule ?? "—"}
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
      accessorKey: "gender",
      header: labels.gender,
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.gender === "Male" ? labels.male : labels.female}
        </span>
      ),
    },
    {
      accessorKey: "dateOfBirth",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={labels.dob} />
      ),
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap text-muted-foreground tabular-nums">
          {formatDate(row.original.dateOfBirth, locale)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: labels.status,
      enableSorting: false,
      cell: ({ row }) => <StudentStatusBadge status={row.original.status} />,
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
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onEdit(s)}>
                  <Pencil className="mr-2 size-4" /> {labels.edit}
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <CheckCircle2 className="mr-2 size-4" /> {labels.setStatus}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => onStatus(s, "Approved")}>
                      <CheckCircle2 className="mr-2 size-4 text-success" /> {labels.approve}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatus(s, "Pending")}>
                      <Clock className="mr-2 size-4 text-warning" /> {labels.markPending}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatus(s, "Rejected")}>
                      <XCircle className="mr-2 size-4 text-destructive" /> {labels.reject}
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
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
