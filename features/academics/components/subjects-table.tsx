"use client";

import { useEffect, useMemo, useState } from "react";
import type { RowSelectionState, SortingState } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { BookOpen, FlaskConical, Palette, Plus, Search, SlidersHorizontal, Trash2, X } from "lucide-react";
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
  useBulkDeleteSubjects,
  useDeleteSubject,
  useSubjects,
} from "../hooks";
import type { ClassLevel, Subject, SubjectQuery, SubjectSeries } from "../types";
import { getSubjectColumns } from "./subjects-columns";
import { SubjectFormSheet } from "./subject-form-sheet";

export function SubjectsTable() {
  const t = useTranslations("academics.subjects");
  const ts = useTranslations("academics.subjectForm");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [series, setSeries] = useState("all");
  const [level, setLevel] = useState("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [editing, setEditing] = useState<Subject | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  const remove = useDeleteSubject();
  const bulkRemove = useBulkDeleteSubjects();

  useEffect(() => {
    const id = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const query: SubjectQuery = useMemo(
    () => ({
      page,
      perPage: pageSize,
      search: search || undefined,
      series: series === "all" ? undefined : (series as SubjectSeries),
      level: level === "all" ? undefined : (level as ClassLevel),
      sortBy: (sorting[0]?.id as keyof Subject) ?? undefined,
      sortDir: sorting[0] ? (sorting[0].desc ? "desc" : "asc") : undefined,
    }),
    [page, pageSize, search, series, level, sorting],
  );

  const { data, isLoading, isFetching, isError, refetch } = useSubjects(query);

  const columns = useMemo(
    () =>
      getSubjectColumns({
        labels: {
          name: t("columns.name"),
          series: t("columns.series"),
          level: t("columns.level"),
          classes: t("columns.classes"),
          actions: t("columns.actions"),
          edit: t("actions.edit"),
          delete: t("actions.delete"),
          seriesLabels: {
            science: ts("seriesScience"),
            art: ts("seriesArt"),
            both: ts("seriesBoth"),
          },
          levelLabels: {
            lower: t("level.lower"),
            upper: t("level.upper"),
            both: t("level.both"),
          },
        },
        onEdit: (s) => { setEditing(s); setFormOpen(true); },
        onDelete: (s) => setDeleteTarget(s),
      }),
    [t, ts],
  );

  const hasFilters = search || series !== "all" || level !== "all";
  function clearFilters() { setSearchInput(""); setSearch(""); setSeries("all"); setLevel("all"); setPage(1); }

  const stats = data?.stats;
  const statCards = (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard label={t("stats.total")} value={stats?.totalSubjects ?? 0} icon={BookOpen} accent="primary" />
      <StatCard label={t("stats.art")} value={stats?.artCount ?? 0} icon={Palette} accent="warning" />
      <StatCard label={t("stats.science")} value={stats?.scienceCount ?? 0} icon={FlaskConical} accent="info" />
      <StatCard label={t("stats.filtered")} value={data?.total ?? 0} icon={SlidersHorizontal} accent="success" />
    </div>
  );

  const toolbar = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-56">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder={t("searchPlaceholder")} className="pl-9" aria-label={t("searchPlaceholder")} />
        </div>
        <Select value={series} onValueChange={(v) => { setSeries(v); setPage(1); }}>
          <SelectTrigger size="sm" className="w-[8.5rem]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allSeries")}</SelectItem>
            <SelectItem value="science">{ts("seriesScience")}</SelectItem>
            <SelectItem value="art">{ts("seriesArt")}</SelectItem>
            <SelectItem value="both">{ts("seriesBoth")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={level} onValueChange={(v) => { setLevel(v); setPage(1); }}>
          <SelectTrigger size="sm" className="w-[9rem]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("level.all")}</SelectItem>
            <SelectItem value="lower">{t("level.lower")}</SelectItem>
            <SelectItem value="upper">{t("level.upper")}</SelectItem>
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
        getRowId={(s) => s.id}
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

      <SubjectFormSheet open={formOpen} onOpenChange={setFormOpen} subject={editing} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={t("delete.title")}
        description={t("delete.description", { name: deleteTarget?.name ?? "" })}
        confirmLabel={t("actions.delete")}
        cancelLabel={ts("cancel")}
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
        cancelLabel={ts("cancel")}
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
