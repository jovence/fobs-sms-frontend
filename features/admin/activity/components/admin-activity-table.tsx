"use client";

import { useEffect, useMemo, useState } from "react";
import type { SortingState } from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
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
import { useActivity } from "../hooks";
import type { ActivityEntry, ActivityQuery, ActivityType } from "../types";
import { getActivityColumns } from "./admin-activity-columns";

const TYPES: ActivityType[] = ["enrollment", "marks", "attendance", "payment", "teacher", "school"];

export function AdminActivityTable() {
  const t = useTranslations("adminActivity");
  const locale = useLocale();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [sorting, setSorting] = useState<SortingState>([{ id: "at", desc: true }]);

  useEffect(() => {
    const id = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const query: ActivityQuery = useMemo(
    () => ({
      page,
      perPage: pageSize,
      search: search || undefined,
      type: type === "all" ? undefined : (type as ActivityType),
      sortBy: (sorting[0]?.id as keyof ActivityEntry) ?? undefined,
      sortDir: sorting[0] ? (sorting[0].desc ? "desc" : "asc") : undefined,
    }),
    [page, pageSize, search, type, sorting],
  );

  const { data, isLoading, isFetching, isError, refetch } = useActivity(query);

  const columns = useMemo(
    () =>
      getActivityColumns({
        locale,
        labels: {
          type: t("columns.type"),
          description: t("columns.description"),
          actor: t("columns.actor"),
          school: t("columns.school"),
          when: t("columns.when"),
          types: {
            enrollment: t("types.enrollment"),
            marks: t("types.marks"),
            attendance: t("types.attendance"),
            payment: t("types.payment"),
            teacher: t("types.teacher"),
            school: t("types.school"),
          },
        },
      }),
    [t, locale],
  );

  const hasFilters = search || type !== "all";
  function clearFilters() { setSearchInput(""); setSearch(""); setType("all"); setPage(1); }

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-full sm:w-64">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder={t("searchPlaceholder")} className="pl-9" aria-label={t("searchPlaceholder")} />
      </div>
      <Select value={type} onValueChange={(v) => { setType(v); setPage(1); }}>
        <SelectTrigger size="sm" className="w-[9.5rem]"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allTypes")}</SelectItem>
          {TYPES.map((ty) => (
            <SelectItem key={ty} value={ty}>{t(`types.${ty}`)}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}><X /> {t("clearFilters")}</Button>
      )}
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
      rowSelection={{}}
      onPageChange={setPage}
      onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
      onSortingChange={setSorting}
      onRowSelectionChange={() => {}}
      getRowId={(a) => a.id}
      isLoading={isLoading || isFetching}
      isError={isError}
      onRetry={() => refetch()}
      toolbar={toolbar}
      emptyTitle={hasFilters ? t("empty.filteredTitle") : t("empty.title")}
      emptyDescription={hasFilters ? t("empty.filteredDescription") : t("empty.description")}
      emptyAction={hasFilters ? <Button variant="outline" size="sm" onClick={clearFilters}>{t("clearFilters")}</Button> : undefined}
    />
  );
}
