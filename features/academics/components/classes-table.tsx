"use client";

import { useEffect, useMemo, useState } from "react";
import type { RowSelectionState, SortingState } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { GraduationCap, Layers, Plus, School, Search, Trash2, Users, X } from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { StatCard } from "@/features/dashboard/components/stat-card";
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
  useBulkDeleteClasses,
  useClasses,
  useClassStats,
  useDeleteClass,
} from "../hooks";
import type { ClassLevel, ClassQuery, SchoolClass } from "../types";
import { getClassColumns } from "./classes-columns";
import { ClassFormSheet } from "./class-form-sheet";

export function ClassesTable() {
  const t = useTranslations("academics.classes");
  const tc = useTranslations("academics.classForm");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [editing, setEditing] = useState<SchoolClass | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SchoolClass | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  const remove = useDeleteClass();
  const bulkRemove = useBulkDeleteClasses();
  const { data: stats } = useClassStats();

  useEffect(() => {
    const id = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const query: ClassQuery = useMemo(
    () => ({
      page,
      perPage: pageSize,
      search: search || undefined,
      level: level === "all" ? undefined : (level as ClassLevel),
      sortBy: (sorting[0]?.id as keyof SchoolClass) ?? undefined,
      sortDir: sorting[0] ? (sorting[0].desc ? "desc" : "asc") : undefined,
    }),
    [page, pageSize, search, level, sorting],
  );

  const { data, isLoading, isFetching, isError, refetch } = useClasses(query);

  const columns = useMemo(
    () =>
      getClassColumns({
        labels: {
          name: t("columns.name"),
          master: t("columns.master"),
          students: t("columns.students"),
          subjects: t("columns.subjects"),
          actions: t("columns.actions"),
          edit: t("actions.edit"),
          delete: t("actions.delete"),
          level: { lower: tc("levelLower"), upper: tc("levelUpper") },
          section: { english: tc("sectionEnglish"), french: tc("sectionFrench") },
        },
        onEdit: (c) => { setEditing(c); setFormOpen(true); },
        onDelete: (c) => setDeleteTarget(c),
      }),
    [t, tc],
  );

  const hasFilters = search || level !== "all";
  function clearFilters() { setSearchInput(""); setSearch(""); setLevel("all"); setPage(1); }

  const statCards = (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard label={t("stats.total")} value={stats?.totalClasses ?? 0} icon={School} accent="primary" />
      <StatCard label={t("stats.upper")} value={stats?.upperCount ?? 0} icon={GraduationCap} accent="info" />
      <StatCard label={t("stats.lower")} value={stats?.lowerCount ?? 0} icon={Layers} accent="warning" />
      <StatCard label={t("stats.students")} value={stats?.totalStudents ?? 0} icon={Users} accent="success" />
    </div>
  );

  const toolbar = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-56">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder={t("searchPlaceholder")} className="pl-9" aria-label={t("searchPlaceholder")} />
        </div>
        <Select value={level} onValueChange={(v) => { setLevel(v); setPage(1); }}>
          <SelectTrigger size="sm" className="w-[8.5rem]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allLevels")}</SelectItem>
            <SelectItem value="lower">{tc("levelLower")}</SelectItem>
            <SelectItem value="upper">{tc("levelUpper")}</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}><X /> {t("clearFilters")}</Button>
        )}
      </div>
      <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}>
        <Plus /> {t("add")}
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      {statCards}
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
        getRowId={(c) => c.id}
        isLoading={isLoading || isFetching}
        isError={isError}
        onRetry={() => refetch()}
        toolbar={toolbar}
        emptyTitle={hasFilters ? t("empty.filteredTitle") : t("empty.title")}
        emptyDescription={hasFilters ? t("empty.filteredDescription") : t("empty.description")}
        emptyAction={
          hasFilters ? (
            <Button variant="outline" size="sm" onClick={clearFilters}>{t("clearFilters")}</Button>
          ) : (
            <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}><Plus /> {t("add")}</Button>
          )
        }
        bulkActions={(ids) => (
          <Button variant="destructive" size="sm" onClick={() => setBulkOpen(true)}>
            <Trash2 /> {t("actions.delete")} ({ids.length})
          </Button>
        )}
      />

      <ClassFormSheet open={formOpen} onOpenChange={setFormOpen} schoolClass={editing} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={t("delete.title")}
        description={t("delete.description", { name: deleteTarget?.name ?? "" })}
        confirmLabel={t("actions.delete")}
        cancelLabel={tc("cancel")}
        destructive
        isPending={remove.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await remove.mutateAsync(deleteTarget.id);
          toast.success(t("toasts.deleted"));
          setDeleteTarget(null);
        }}
      />

      <ConfirmDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        title={t("delete.bulkTitle", { count: Object.keys(rowSelection).filter((k) => rowSelection[k]).length })}
        description={t("delete.bulkDescription")}
        confirmLabel={t("actions.delete")}
        cancelLabel={tc("cancel")}
        destructive
        isPending={bulkRemove.isPending}
        onConfirm={async () => {
          const ids = Object.keys(rowSelection).filter((k) => rowSelection[k]);
          await bulkRemove.mutateAsync(ids);
          toast.success(t("toasts.bulkDeleted", { count: ids.length }));
          setRowSelection({});
          setBulkOpen(false);
        }}
      />
    </div>
  );
}
