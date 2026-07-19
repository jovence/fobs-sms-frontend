"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { RowSelectionState, SortingState } from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Download, FileText, Search, X } from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { downloadCsv } from "@/lib/csv";
import { useClassOptions } from "@/features/academics/hooks";
import { useReportRows } from "../hooks";
import { marksService } from "../api/marks.service";
import type { ReportQuery, ReportRow } from "../types";
import { getReportColumns } from "./report-cards-columns";

export function ReportCardsTable() {
  const t = useTranslations("reports");
  const locale = useLocale();
  const { data: classes = [] } = useClassOptions();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [classId, setClassId] = useState<string>("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const query: ReportQuery = useMemo(
    () => ({
      page,
      perPage: pageSize,
      search: search || undefined,
      classId: classId === "all" ? undefined : classId,
      sortBy: (sorting[0]?.id as keyof ReportRow) ?? undefined,
      sortDir: sorting[0] ? (sorting[0].desc ? "desc" : "asc") : undefined,
    }),
    [page, pageSize, search, classId, sorting],
  );

  const { data, isLoading, isError, refetch, isFetching } = useReportRows(query);

  const formatAverage = useCallback(
    (average: number) =>
      average.toLocaleString(locale === "fr" ? "fr-CM" : "en-CM", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
    [locale],
  );

  // "Matricule" is the same term in en and fr (Cameroon), so it needs no key.
  const reportCsvHeader = useMemo(
    () => [
      t("columns.student"),
      "Matricule",
      t("columns.class"),
      t("columns.average"),
      t("columns.rank"),
      t("columns.decision"),
    ],
    [t],
  );

  const rowToCsv = useCallback(
    (r: ReportRow) => [
      r.fullName,
      r.matricule ?? "",
      r.className,
      formatAverage(r.average),
      `${r.rank}/${r.total}`,
      r.decision,
    ],
    [formatAverage],
  );

  const columns = useMemo(
    () =>
      getReportColumns({
        labels: {
          student: t("columns.student"),
          class: t("columns.class"),
          average: t("columns.average"),
          rank: t("columns.rank"),
          decision: t("columns.decision"),
          actions: t("columns.actions"),
          generate: t("actions.generate"),
        },
        formatAverage,
        formatRank: (rank, total) => `${rank}/${total}`,
        // Download a real file for this student's report card instead of a no-op toast.
        onGenerate: (row) => {
          downloadCsv(`report-card-${row.matricule ?? row.id}.csv`, reportCsvHeader, [
            rowToCsv(row),
          ]);
          toast.success(t("toasts.generated"));
        },
      }),
    [t, formatAverage, reportCsvHeader, rowToCsv],
  );

  const hasFilters = !!search || classId !== "all";

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setClassId("all");
    setPage(1);
  }

  // Fetch every report row (not just the current page) and download a real CSV.
  async function exportAllReportCards(): Promise<number> {
    const all = await marksService.listReportRows({
      ...query,
      page: 1,
      perPage: data?.total || 1000,
    });
    downloadCsv(
      `report-cards-${Date.now()}.csv`,
      reportCsvHeader,
      all.items.map(rowToCsv),
    );
    return all.items.length;
  }

  async function onDownloadAll() {
    setExporting(true);
    try {
      toast.success(t("toasts.downloaded", { count: await exportAllReportCards() }));
    } finally {
      setExporting(false);
    }
  }

  async function onGenerateAll() {
    setExporting(true);
    try {
      toast.success(t("toasts.generatedAll", { count: await exportAllReportCards() }));
    } finally {
      setExporting(false);
    }
  }

  const toolbar = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="pl-9"
            aria-label={t("searchPlaceholder")}
          />
        </div>
        <Select
          value={classId}
          onValueChange={(v) => {
            setClassId(v);
            setPage(1);
          }}
        >
          <SelectTrigger size="sm" className="w-[9.5rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allClasses")}</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
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
          variant="outline"
          size="sm"
          onClick={onDownloadAll}
          disabled={!data?.total || exporting}
        >
          <Download /> {t("actions.downloadAll")}
        </Button>
        <Button size="sm" onClick={onGenerateAll} disabled={!data?.total || exporting}>
          <FileText /> {t("actions.generateAll")}
        </Button>
      </div>
    </div>
  );

  return (
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
      getRowId={(r) => r.id}
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
        ) : undefined
      }
    />
  );
}
