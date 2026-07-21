"use client";

import { useEffect, useMemo, useState } from "react";
import type { RowSelectionState, SortingState } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Download, FileText, Plus, Search, Trash2, X } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { DataTable } from "@/components/data-table/data-table";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useBulkDeleteParents,
  useDeleteParent,
  useExportUnattachedStudents,
  useParents,
  useParentStats,
} from "../hooks";
import { parentsService } from "../api/parents.service";
import type { Parent, ParentQuery } from "../types";
import { getParentColumns } from "./parents-columns";
import { ParentFormSheet } from "./parent-form-sheet";

export function ParentsTable() {
  const t = useTranslations("parents");
  const router = useRouter();

  // Query state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Parent | null>(null);
  const [removeTarget, setRemoveTarget] = useState<Parent | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  const remove = useDeleteParent();
  const bulkRemove = useBulkDeleteParents();
  const exportUnattached = useExportUnattachedStudents();
  const stats = useParentStats();

  // Debounce search
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const query: ParentQuery = useMemo(
    () => ({
      page,
      perPage: pageSize,
      search: search || undefined,
      sortBy: (sorting[0]?.id as keyof Parent) ?? undefined,
      sortDir: sorting[0] ? (sorting[0].desc ? "desc" : "asc") : undefined,
    }),
    [page, pageSize, search, sorting],
  );

  const { data, isLoading, isFetching, isError, refetch } = useParents(query);

  const columns = useMemo(
    () =>
      getParentColumns({
        labels: {
          parent: t("columns.parent"),
          email: t("columns.email"),
          children: t("columns.children"),
          occupation: t("columns.occupation"),
          actions: t("columns.actions"),
          view: t("actions.view"),
          edit: t("actions.edit"),
          remove: t("actions.remove"),
        },
        onView: (p) => router.push(`/parents/${p.id}`),
        onEdit: (p) => {
          setEditing(p);
          setFormOpen(true);
        },
        onRemove: (p) => setRemoveTarget(p),
      }),
    [t, router],
  );

  const hasFilters = !!search;

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setPage(1);
  }

  async function exportCsv() {
    const all = await parentsService.list({
      ...query,
      page: 1,
      perPage: data?.total || 1000,
    });
    const header = ["Name", "Email", "Phone", "Occupation", "Address", "Children"];
    const rows = all.items.map((p) => [
      p.name,
      p.email,
      p.phone,
      p.occupation,
      p.address,
      String(p.childrenCount),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `parents-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("toasts.exported"));
  }

  async function exportUnattachedStudents() {
    try {
      await exportUnattached.mutateAsync();
      toast.success(t("toasts.unattachedExported"));
    } catch {
      toast.error(t("toasts.error"));
    }
  }

  const unattachedCount = stats.data?.totalStudentsWithoutParent ?? 0;

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
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X /> {t("clearFilters")}
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={exportUnattachedStudents}
          disabled={exportUnattached.isPending}
        >
          <FileText /> {t("exportUnattached")}
          {unattachedCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {unattachedCount}
            </Badge>
          )}
        </Button>
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
        getRowId={(p) => p.id}
        isLoading={isLoading || isFetching}
        isError={isError}
        onRetry={() => refetch()}
        toolbar={toolbar}
        emptyTitle={hasFilters ? t("empty.filteredTitle") : t("empty.title")}
        emptyDescription={
          hasFilters ? t("empty.filteredDescription") : t("empty.description")
        }
        emptyAction={
          hasFilters ? (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              {t("clearFilters")}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus /> {t("add")}
            </Button>
          )
        }
        bulkActions={(ids) => (
          <Button variant="destructive" size="sm" onClick={() => setBulkOpen(true)}>
            <Trash2 /> {t("actions.remove")} ({ids.length})
          </Button>
        )}
      />

      <ParentFormSheet open={formOpen} onOpenChange={setFormOpen} parent={editing} />

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
