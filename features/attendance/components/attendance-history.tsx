"use client";

import { useEffect, useMemo, useState } from "react";
import type { RowSelectionState, SortingState } from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CLASS_SECTIONS, classLabel, classesBySection } from "@/features/academics/class-options";
import { useClassOptions } from "@/features/academics/hooks";
import { useSessions } from "../hooks";
import type { AttendanceQuery, AttendanceSession } from "../types";
import { getAttendanceColumns } from "./attendance-columns";
import { SessionDetailSheet } from "./session-detail-sheet";

const SORT_MAP: Record<string, AttendanceQuery["sortBy"]> = {
  date: "date",
  className: "className",
  subjectName: "subjectName",
  present: "present",
  rate: "rate",
};

export function AttendanceHistory() {
  const t = useTranslations("attendance.history");
  const tc = useTranslations("academics.classForm");
  const locale = useLocale();
  const { data: classes = [] } = useClassOptions();
  const groupedClasses = useMemo(() => classesBySection(classes), [classes]);
  const classLabels = useMemo(
    () => ({
      lower: tc("levelLower"),
      upper: tc("levelUpper"),
      english: tc("sectionEnglish"),
      french: tc("sectionFrench"),
    }),
    [tc],
  );

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [classId, setClassId] = useState<string>("all");
  const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: true }]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [viewing, setViewing] = useState<AttendanceSession | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const query: AttendanceQuery = useMemo(
    () => ({
      page,
      perPage: pageSize,
      search: search || undefined,
      classId: classId === "all" ? undefined : classId,
      sortBy: sorting[0] ? SORT_MAP[sorting[0].id] : undefined,
      sortDir: sorting[0] ? (sorting[0].desc ? "desc" : "asc") : undefined,
    }),
    [page, pageSize, search, classId, sorting],
  );

  const { data, isLoading, isError, refetch, isFetching } = useSessions(query);

  const columns = useMemo(
    () =>
      getAttendanceColumns({
        locale,
        labels: {
          date: t("columns.date"),
          class: t("columns.class"),
          subject: t("columns.subject"),
          present: t("columns.present"),
          rate: t("columns.rate"),
          actions: t("columns.actions"),
          view: t("actions.view"),
          ofTotal: t("ofTotal"),
        },
        onView: (s) => {
          setViewing(s);
          setDetailOpen(true);
        },
      }),
    [locale, t],
  );

  const hasFilters = search || classId !== "all";

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setClassId("all");
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
            {CLASS_SECTIONS.map((section) => {
              const rows = groupedClasses[section];
              if (rows.length === 0) return null;
              return (
                <SelectGroup key={section}>
                  <SelectLabel>{classLabels[section]}</SelectLabel>
                  {rows.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {classLabel(c, classLabels)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              );
            })}
            {groupedClasses.other.length > 0 && (
              <SelectGroup>
                <SelectLabel>{tc("sectionUnknown")}</SelectLabel>
                {groupedClasses.other.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {classLabel(c, classLabels)}
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
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

      <SessionDetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        session={viewing}
      />
    </>
  );
}
