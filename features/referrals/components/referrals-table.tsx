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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReferralUsages } from "../hooks";
import type { ReferralQuery, ReferralStatus, ReferralUsage } from "../types";
import { getReferralColumns } from "./referrals-columns";

const STATUSES: ReferralStatus[] = ["Successful", "Pending", "Expired"];

export function ReferralsTable() {
  const t = useTranslations("referrals");
  const locale = useLocale();

  // Query state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Debounce search
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const query: ReferralQuery = useMemo(
    () => ({
      page,
      perPage: pageSize,
      search: search || undefined,
      status: status === "all" ? undefined : (status as ReferralStatus),
      sortBy: (sorting[0]?.id as keyof ReferralUsage) ?? undefined,
      sortDir: sorting[0] ? (sorting[0].desc ? "desc" : "asc") : undefined,
    }),
    [page, pageSize, search, status, sorting],
  );

  const { data, isLoading, isError, refetch, isFetching } = useReferralUsages(query);

  const columns = useMemo(
    () =>
      getReferralColumns({
        locale,
        labels: {
          school: t("columns.school"),
          date: t("columns.date"),
          discount: t("columns.discount"),
          earnings: t("columns.earnings"),
          status: t("columns.status"),
        },
      }),
    [locale, t],
  );

  const hasFilters = search !== "" || status !== "all";

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
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        >
          <SelectTrigger size="sm" className="w-[9.5rem]">
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
