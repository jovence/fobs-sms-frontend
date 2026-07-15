"use client";

import { useEffect, useMemo, useState } from "react";
import type { RowSelectionState, SortingState } from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
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
import { useAdminSchools, useSetTier, useToggleDemo } from "../hooks";
import type { AdminSchool, AdminSchoolQuery, SubscriptionTier } from "../types";
import { getAdminSchoolColumns } from "./admin-schools-columns";

export function AdminSchoolsTable() {
  const t = useTranslations("adminSchools");
  const locale = useLocale();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [subscription, setSubscription] = useState("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const setTier = useSetTier();
  const toggleDemo = useToggleDemo();

  useEffect(() => {
    const id = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const query: AdminSchoolQuery = useMemo(
    () => ({
      page,
      perPage: pageSize,
      search: search || undefined,
      subscription: subscription === "all" ? undefined : (subscription as SubscriptionTier),
      sortBy: (sorting[0]?.id as keyof AdminSchool) ?? undefined,
      sortDir: sorting[0] ? (sorting[0].desc ? "desc" : "asc") : undefined,
    }),
    [page, pageSize, search, subscription, sorting],
  );

  const { data, isLoading, isFetching, isError, refetch } = useAdminSchools(query);

  const columns = useMemo(
    () =>
      getAdminSchoolColumns({
        locale,
        labels: {
          school: t("columns.school"),
          owner: t("columns.owner"),
          subscription: t("columns.subscription"),
          students: t("columns.students"),
          actions: t("columns.actions"),
          demo: t("demo"),
          upgrade: t("actions.upgradeBasic"),
          downgrade: t("actions.downgradeFree"),
          toggleDemo: t("actions.toggleDemo"),
          tiers: { free: t("tiers.free"), basic: t("tiers.basic"), pro: t("tiers.pro") },
        },
        onSetTier: async (s, tier) => {
          await setTier.mutateAsync({ id: s.id, tier });
          toast.success(t("toasts.tierChanged"));
        },
        onToggleDemo: async (s) => {
          await toggleDemo.mutateAsync(s.id);
          toast.success(t("toasts.demoToggled"));
        },
      }),
    [t, locale, setTier, toggleDemo],
  );

  const hasFilters = search || subscription !== "all";
  function clearFilters() { setSearchInput(""); setSearch(""); setSubscription("all"); setPage(1); }

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-full sm:w-64">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder={t("searchPlaceholder")} className="pl-9" aria-label={t("searchPlaceholder")} />
      </div>
      <Select value={subscription} onValueChange={(v) => { setSubscription(v); setPage(1); }}>
        <SelectTrigger size="sm" className="w-[8.5rem]"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allTiers")}</SelectItem>
          <SelectItem value="free">{t("tiers.free")}</SelectItem>
          <SelectItem value="basic">{t("tiers.basic")}</SelectItem>
          <SelectItem value="pro">{t("tiers.pro")}</SelectItem>
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
      emptyAction={hasFilters ? <Button variant="outline" size="sm" onClick={clearFilters}>{t("clearFilters")}</Button> : undefined}
    />
  );
}
