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
import { useInvoices } from "../hooks";
import type { Invoice, InvoiceQuery, InvoiceStatus } from "../types";
import { getInvoiceColumns } from "./invoices-columns";

const STATUSES: InvoiceStatus[] = ["paid", "pending"];

export function InvoicesTable() {
  const t = useTranslations("billing");
  const ti = useTranslations("billing.invoices");
  const locale = useLocale();

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

  const query: InvoiceQuery = useMemo(
    () => ({
      page,
      perPage: pageSize,
      search: search || undefined,
      status: status === "all" ? undefined : (status as InvoiceStatus),
      sortBy: (sorting[0]?.id as keyof Invoice) ?? undefined,
      sortDir: sorting[0] ? (sorting[0].desc ? "desc" : "asc") : undefined,
    }),
    [page, pageSize, search, status, sorting],
  );

  const { data, isLoading, isError, refetch, isFetching } = useInvoices(query);

  function describe(inv: Invoice): string {
    if (inv.kind === "subscription" && inv.planTier) {
      return t("invoices.descriptions.subscription", {
        plan: t(`plans.tiers.${inv.planTier}.name`),
      });
    }
    if (inv.kind === "smsTopup" && inv.quantity != null) {
      return t("invoices.descriptions.smsTopup", { count: inv.quantity });
    }
    return t("invoices.descriptions.setupFee");
  }

  const columns = useMemo(
    () =>
      getInvoiceColumns({
        locale,
        describe,
        labels: {
          invoice: ti("columns.invoice"),
          date: ti("columns.date"),
          description: ti("columns.description"),
          amount: ti("columns.amount"),
          status: ti("columns.status"),
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, ti, t],
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
            placeholder={ti("searchPlaceholder")}
            className="pl-9"
            aria-label={ti("searchPlaceholder")}
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        >
          <SelectTrigger size="sm" className="w-[9rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{ti("allStatuses")}</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {ti(`status.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X /> {ti("clearFilters")}
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
      emptyTitle={hasFilters ? ti("empty.filteredTitle") : ti("empty.title")}
      emptyDescription={
        hasFilters ? ti("empty.filteredDescription") : ti("empty.description")
      }
      emptyAction={
        hasFilters ? (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            {ti("clearFilters")}
          </Button>
        ) : undefined
      }
    />
  );
}
