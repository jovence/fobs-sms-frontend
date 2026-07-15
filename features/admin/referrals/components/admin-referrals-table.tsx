"use client";

import { useEffect, useMemo, useState } from "react";
import type { RowSelectionState, SortingState } from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Gift, Search, Trash2, Users, Wallet, X } from "lucide-react";
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
import { Stagger, StaggerItem } from "@/components/common/motion";
import { formatCurrency } from "@/lib/format";
import {
  useBulkDeleteReferrers,
  useDeleteReferrer,
  useReferralStats,
  useReferrers,
  useToggleReferrer,
} from "../hooks";
import type { AdminReferralQuery, AdminReferrer } from "../types";
import { getReferrerColumns } from "./admin-referrals-columns";

export function AdminReferralsTable() {
  const t = useTranslations("adminReferrals");
  const locale = useLocale();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [deleteTarget, setDeleteTarget] = useState<AdminReferrer | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  const toggle = useToggleReferrer();
  const remove = useDeleteReferrer();
  const bulkRemove = useBulkDeleteReferrers();
  const { data: stats } = useReferralStats();

  useEffect(() => {
    const id = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const query: AdminReferralQuery = useMemo(
    () => ({
      page,
      perPage: pageSize,
      search: search || undefined,
      status: status === "all" ? undefined : (status as "active" | "inactive"),
      sortBy: (sorting[0]?.id as keyof AdminReferrer) ?? undefined,
      sortDir: sorting[0] ? (sorting[0].desc ? "desc" : "asc") : undefined,
    }),
    [page, pageSize, search, status, sorting],
  );

  const { data, isLoading, isFetching, isError, refetch } = useReferrers(query);

  const columns = useMemo(
    () =>
      getReferrerColumns({
        locale,
        labels: {
          referrer: t("columns.referrer"),
          code: t("columns.code"),
          residence: t("columns.residence"),
          referrals: t("columns.referrals"),
          earnings: t("columns.earnings"),
          status: t("columns.status"),
          actions: t("columns.actions"),
          active: t("status.active"),
          inactive: t("status.inactive"),
          activate: t("actions.activate"),
          deactivate: t("actions.deactivate"),
          delete: t("actions.delete"),
        },
        onToggle: async (r) => {
          await toggle.mutateAsync(r.id);
          toast.success(t("toasts.statusChanged"));
        },
        onDelete: (r) => setDeleteTarget(r),
      }),
    [t, locale, toggle],
  );

  const hasFilters = search || status !== "all";
  function clearFilters() { setSearchInput(""); setSearch(""); setStatus("all"); setPage(1); }

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-full sm:w-64">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder={t("searchPlaceholder")} className="pl-9" aria-label={t("searchPlaceholder")} />
      </div>
      <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
        <SelectTrigger size="sm" className="w-[8.5rem]"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allStatuses")}</SelectItem>
          <SelectItem value="active">{t("status.active")}</SelectItem>
          <SelectItem value="inactive">{t("status.inactive")}</SelectItem>
        </SelectContent>
      </Select>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}><X /> {t("clearFilters")}</Button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <Stagger className="grid gap-4 sm:grid-cols-3">
        <StaggerItem>
          <StatCard label={t("stats.referrers")} value={stats?.referrers ?? 0} icon={Users} accent="primary" />
        </StaggerItem>
        <StaggerItem>
          <StatCard label={t("stats.earnings")} value={stats?.totalEarnings ?? 0} icon={Wallet} accent="success" format={(n) => formatCurrency(n, locale)} />
        </StaggerItem>
        <StaggerItem>
          <StatCard label={t("stats.referrals")} value={stats?.totalReferrals ?? 0} icon={Gift} accent="info" />
        </StaggerItem>
      </Stagger>

      <p className="text-xs text-muted-foreground">{t("caption")}</p>

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
        getRowId={(r) => r.id}
        isLoading={isLoading || isFetching}
        isError={isError}
        onRetry={() => refetch()}
        toolbar={toolbar}
        emptyTitle={hasFilters ? t("empty.filteredTitle") : t("empty.title")}
        emptyDescription={hasFilters ? t("empty.filteredDescription") : t("empty.description")}
        emptyAction={hasFilters ? <Button variant="outline" size="sm" onClick={clearFilters}>{t("clearFilters")}</Button> : undefined}
        bulkActions={(ids) => (
          <Button variant="destructive" size="sm" onClick={() => setBulkOpen(true)}>
            <Trash2 /> {t("actions.delete")} ({ids.length})
          </Button>
        )}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={t("delete.title")}
        description={t("delete.description", { name: deleteTarget?.name ?? "" })}
        confirmLabel={t("actions.delete")}
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
