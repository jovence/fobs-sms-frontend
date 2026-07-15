"use client";

import { useEffect, useMemo, useState } from "react";
import type { RowSelectionState, SortingState } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Search, Trash2, X } from "lucide-react";
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
  useBulkDeleteExams,
  useDeleteExam,
  useExams,
} from "../hooks";
import type { Exam, ExamQuery, Term } from "../types";
import { getExamColumns } from "./exams-columns";
import { ExamFormSheet } from "./exam-form-sheet";

const TERMS: Term[] = ["First", "Second", "Third"];

export function ExamsTable() {
  const t = useTranslations("exams");
  const tf = useTranslations("exams.form");

  // Query state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState<string>("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Exam | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Exam | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  const deleteExam = useDeleteExam();
  const bulkDelete = useBulkDeleteExams();

  // Debounce search
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const query: ExamQuery = useMemo(
    () => ({
      page,
      perPage: pageSize,
      search: search || undefined,
      term: term === "all" ? undefined : (term as Term),
      sortBy: (sorting[0]?.id as keyof Exam) ?? undefined,
      sortDir: sorting[0] ? (sorting[0].desc ? "desc" : "asc") : undefined,
    }),
    [page, pageSize, search, term, sorting],
  );

  const { data, isLoading, isError, refetch, isFetching } = useExams(query);

  const columns = useMemo(
    () =>
      getExamColumns({
        labels: {
          name: t("columns.name"),
          term: t("columns.term"),
          sequence: t("columns.sequence"),
          academicYear: t("columns.academicYear"),
          published: t("columns.published"),
          markEntry: t("columns.markEntry"),
          actions: t("columns.actions"),
          edit: t("actions.edit"),
          delete: t("actions.delete"),
          publishedYes: t("published.yes"),
          publishedNo: t("published.no"),
          markOpen: t("markEntry.open"),
          markClosed: t("markEntry.closed"),
          selectAll: t("selectAll"),
          selectRow: t("selectRow"),
        },
        onEdit: (exam) => {
          setEditing(exam);
          setFormOpen(true);
        },
        onDelete: (exam) => setDeleteTarget(exam),
      }),
    [t],
  );

  const hasFilters = !!search || term !== "all";

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setTerm("all");
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
        <Select
          value={term}
          onValueChange={(v) => {
            setTerm(v);
            setPage(1);
          }}
        >
          <SelectTrigger size="sm" className="w-[9.5rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allTerms")}</SelectItem>
            {TERMS.map((tm) => (
              <SelectItem key={tm} value={tm}>
                {t(`term.${tm}`)}
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
        getRowId={(e) => e.id}
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
            <Trash2 /> {t("actions.delete")} ({ids.length})
          </Button>
        )}
      />

      <ExamFormSheet open={formOpen} onOpenChange={setFormOpen} exam={editing} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={t("delete.title")}
        description={t("delete.description", { name: deleteTarget?.name ?? "" })}
        confirmLabel={t("actions.delete")}
        cancelLabel={tf("cancel")}
        destructive
        isPending={deleteExam.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteExam.mutateAsync(deleteTarget.id);
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
