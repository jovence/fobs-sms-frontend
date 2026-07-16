"use client";

import { useEffect, useMemo, useState } from "react";
import type { RowSelectionState, SortingState } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import { Download, Plus, Search, Trash2, X } from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/format";
import { downloadCsv } from "@/lib/csv";
import {
  useBulkDeleteStudents,
  useDeleteStudent,
  useStudents,
  useUpdateStudentStatus,
} from "../hooks";
import { studentsService } from "../api/students.service";
import { useClassOptions } from "@/features/academics/hooks";
import type { RegistrationStatus, Student, StudentQuery } from "../types";
import { getStudentColumns } from "./students-columns";
import { StudentFormSheet } from "./student-form-sheet";

const STATUSES: RegistrationStatus[] = ["Approved", "Pending", "Rejected"];

export function StudentsTable() {
  const t = useTranslations("students");
  const tf = useTranslations("students.form");
  const locale = useLocale();
  const { data: classOptions = [] } = useClassOptions();

  // Query state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [classId, setClassId] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  const deleteStudent = useDeleteStudent();
  const bulkDelete = useBulkDeleteStudents();
  const updateStatus = useUpdateStudentStatus();

  // Debounce search
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const query: StudentQuery = useMemo(
    () => ({
      page,
      perPage: pageSize,
      search: search || undefined,
      classId: classId === "all" ? undefined : classId,
      status: status === "all" ? undefined : (status as RegistrationStatus),
      sortBy: (sorting[0]?.id as keyof Student) ?? undefined,
      sortDir: sorting[0] ? (sorting[0].desc ? "desc" : "asc") : undefined,
    }),
    [page, pageSize, search, classId, status, sorting],
  );

  const { data, isLoading, isError, refetch, isFetching } = useStudents(query);

  const columns = useMemo(
    () =>
      getStudentColumns({
        locale,
        labels: {
          student: t("columns.student"),
          class: t("columns.class"),
          gender: t("columns.gender"),
          dob: t("columns.dob"),
          status: t("columns.status"),
          actions: t("columns.actions"),
          edit: t("actions.edit"),
          delete: t("actions.delete"),
          setStatus: t("actions.setStatus"),
          male: tf("male"),
          female: tf("female"),
          approve: t("actions.approve"),
          reject: t("actions.reject"),
          markPending: t("actions.markPending"),
        },
        onEdit: (s) => {
          setEditing(s);
          setFormOpen(true);
        },
        onDelete: (s) => setDeleteTarget(s),
        onStatus: async (s, next) => {
          await updateStatus.mutateAsync({ id: s.id, status: next });
          toast.success(t("toasts.statusChanged"));
        },
      }),
    [locale, t, tf, updateStatus],
  );

  const hasFilters = search || classId !== "all" || status !== "all";

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setClassId("all");
    setStatus("all");
    setPage(1);
  }

  async function exportCsv() {
    const all = await studentsService.list({ ...query, page: 1, perPage: data?.total || 1000 });
    const header = ["Matricule", "Full name", "Gender", "Date of birth", "Class", "Status"];
    const rows = all.items.map((s) => [
      s.matricule ?? "",
      s.fullName,
      s.gender,
      formatDate(s.dateOfBirth, locale),
      s.className,
      s.status,
    ]);
    downloadCsv(`students-${Date.now()}.csv`, header, rows);
    toast.success(t("toasts.exported"));
  }

  const toolbar = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="pl-9"
            aria-label={t("searchPlaceholder")}
          />
        </div>
        <Select value={classId} onValueChange={(v) => { setClassId(v); setPage(1); }}>
          <SelectTrigger size="sm" className="w-[9.5rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allClasses")}</SelectItem>
            {classOptions.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger size="sm" className="w-[8.5rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allStatuses")}</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {t(`status.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X /> {t("clearFilters")}
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={!data?.total}>
          <Download /> {t("export")}
        </Button>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus /> {t("add")}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        sorting={sorting}
        rowSelection={rowSelection}
        onPageChange={setPage}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setPage(1);
        }}
        onSortingChange={setSorting}
        onRowSelectionChange={setRowSelection}
        getRowId={(s) => s.id}
        isLoading={isLoading || isFetching}
        isError={isError}
        onRetry={() => refetch()}
        toolbar={toolbar}
        emptyTitle={hasFilters ? t("empty.filteredTitle") : t("empty.title")}
        emptyDescription={hasFilters ? t("empty.filteredDescription") : t("empty.description")}
        emptyAction={
          hasFilters ? (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              {t("clearFilters")}
            </Button>
          ) : (
            <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <Plus /> {t("add")}
            </Button>
          )
        }
        bulkActions={(ids) => (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setBulkOpen(true)}
          >
            <Trash2 /> {t("actions.delete")} ({ids.length})
          </Button>
        )}
      />

      <StudentFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        student={editing}
        classes={classOptions}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={t("delete.title")}
        description={t("delete.description", { name: deleteTarget?.fullName ?? "" })}
        confirmLabel={t("actions.delete")}
        cancelLabel={tf("cancel")}
        destructive
        isPending={deleteStudent.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteStudent.mutateAsync(deleteTarget.id);
          toast.success(t("toasts.deleted"));
          setDeleteTarget(null);
        }}
      />

      <ConfirmDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        title={t("delete.bulkTitle", {
          count: Object.keys(rowSelection).filter((k) => rowSelection[k]).length,
        })}
        description={t("delete.bulkDescription")}
        confirmLabel={t("actions.delete")}
        cancelLabel={tf("cancel")}
        destructive
        isPending={bulkDelete.isPending}
        onConfirm={async () => {
          const ids = Object.keys(rowSelection).filter((k) => rowSelection[k]);
          await bulkDelete.mutateAsync(ids);
          toast.success(t("toasts.bulkDeleted", { count: ids.length }));
          setRowSelection({});
          setBulkOpen(false);
        }}
      />
    </>
  );
}
