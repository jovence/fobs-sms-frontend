"use client";

import { useEffect, useMemo, useState } from "react";
import type { RowSelectionState, SortingState } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Search, Trash2, X } from "lucide-react";
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
import {
  useApproveTeacher,
  useBulkDeleteTeachers,
  useDeleteTeacher,
  useTeachers,
} from "../hooks";
import type { Teacher, TeacherQuery, TeacherStatus } from "../types";
import { getTeacherColumns } from "./teachers-columns";
import { TeacherFormSheet } from "./teacher-form-sheet";

export function TeachersTable() {
  const t = useTranslations("teachers");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [editing, setEditing] = useState<Teacher | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Teacher | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  const approve = useApproveTeacher();
  const remove = useDeleteTeacher();
  const bulkRemove = useBulkDeleteTeachers();

  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const query: TeacherQuery = useMemo(
    () => ({
      page,
      perPage: pageSize,
      search: search || undefined,
      status: status === "all" ? undefined : (status as TeacherStatus),
      sortBy: (sorting[0]?.id as keyof Teacher) ?? undefined,
      sortDir: sorting[0] ? (sorting[0].desc ? "desc" : "asc") : undefined,
    }),
    [page, pageSize, search, status, sorting],
  );

  const { data, isLoading, isFetching, isError, refetch } = useTeachers(query);

  const columns = useMemo(
    () =>
      getTeacherColumns({
        labels: {
          teacher: t("columns.teacher"),
          specialization: t("columns.specialization"),
          experience: t("columns.experience"),
          load: t("columns.load"),
          status: t("columns.status"),
          actions: t("columns.actions"),
          approve: t("actions.approve"),
          edit: t("actions.edit"),
          remove: t("actions.remove"),
          years: t("years"),
        },
        onApprove: async (tc) => {
          await approve.mutateAsync(tc.id);
          toast.success(t("toasts.approved"));
        },
        onEdit: (tc) => {
          setEditing(tc);
          setFormOpen(true);
        },
        onRemove: (tc) => setRemoveTarget(tc),
      }),
    [t, approve],
  );

  const hasFilters = search || status !== "all";
  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setStatus("all");
    setPage(1);
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
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger size="sm" className="w-[9.5rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allStatuses")}</SelectItem>
            <SelectItem value="active">{t("status.active")}</SelectItem>
            <SelectItem value="pending">{t("status.pending")}</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X /> {t("clearFilters")}
          </Button>
        )}
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
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        onSortingChange={setSorting}
        onRowSelectionChange={setRowSelection}
        getRowId={(tc) => tc.id}
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
          ) : undefined
        }
        bulkActions={(ids) => (
          <Button variant="destructive" size="sm" onClick={() => setBulkOpen(true)}>
            <Trash2 /> {t("actions.remove")} ({ids.length})
          </Button>
        )}
      />

      <TeacherFormSheet open={formOpen} onOpenChange={setFormOpen} teacher={editing} />

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(o) => !o && setRemoveTarget(null)}
        title={t("remove.title")}
        description={t("remove.description", { name: removeTarget?.name ?? "" })}
        confirmLabel={t("actions.remove")}
        cancelLabel={t("form.cancel")}
        destructive
        isPending={remove.isPending}
        onConfirm={async () => {
          if (!removeTarget) return;
          await remove.mutateAsync(removeTarget.id);
          toast.success(t("toasts.removed"));
          setRemoveTarget(null);
        }}
      />

      <ConfirmDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        title={t("remove.bulkTitle", {
          count: Object.keys(rowSelection).filter((k) => rowSelection[k]).length,
        })}
        description={t("remove.bulkDescription")}
        confirmLabel={t("actions.remove")}
        cancelLabel={t("form.cancel")}
        destructive
        isPending={bulkRemove.isPending}
        onConfirm={async () => {
          const ids = Object.keys(rowSelection).filter((k) => rowSelection[k]);
          await bulkRemove.mutateAsync(ids);
          toast.success(t("toasts.bulkRemoved", { count: ids.length }));
          setRowSelection({});
          setBulkOpen(false);
        }}
      />
    </>
  );
}
