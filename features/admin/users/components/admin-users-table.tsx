"use client";

import { useEffect, useMemo, useState } from "react";
import type { RowSelectionState, SortingState } from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Download, Search, Trash2, X } from "lucide-react";
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
import { formatDate } from "@/lib/format";
import { useAdminUsers, useBulkDeleteUsers, useDeleteUser } from "../hooks";
import { adminUsersService } from "../api/admin-users.service";
import type { AdminUser, AdminUserQuery, Role } from "../types";
import { getAdminUserColumns } from "./admin-users-columns";

const ROLES: Role[] = ["owner", "teacher", "parent", "admin"];

export function AdminUsersTable() {
  const t = useTranslations("adminUsers");
  const locale = useLocale();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  const remove = useDeleteUser();
  const bulkRemove = useBulkDeleteUsers();

  useEffect(() => {
    const id = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const query: AdminUserQuery = useMemo(
    () => ({
      page,
      perPage: pageSize,
      search: search || undefined,
      role: role === "all" ? undefined : (role as Role),
      sortBy: (sorting[0]?.id as keyof AdminUser) ?? undefined,
      sortDir: sorting[0] ? (sorting[0].desc ? "desc" : "asc") : undefined,
    }),
    [page, pageSize, search, role, sorting],
  );

  const { data, isLoading, isFetching, isError, refetch } = useAdminUsers(query);

  const columns = useMemo(
    () =>
      getAdminUserColumns({
        locale,
        labels: {
          user: t("columns.user"),
          role: t("columns.role"),
          phone: t("columns.phone"),
          joined: t("columns.joined"),
          actions: t("columns.actions"),
          delete: t("actions.delete"),
          roles: { owner: t("roles.owner"), teacher: t("roles.teacher"), parent: t("roles.parent"), admin: t("roles.admin") },
        },
        onDelete: (u) => setDeleteTarget(u),
      }),
    [t, locale],
  );

  const hasFilters = search || role !== "all";
  function clearFilters() { setSearchInput(""); setSearch(""); setRole("all"); setPage(1); }

  async function exportCsv() {
    const all = await adminUsersService.list({ ...query, page: 1, perPage: data?.total || 1000 });
    const header = ["Name", "Email", "Phone", "Role", "Joined"];
    const rows = all.items.map((u) => [u.name, u.email, u.phone, u.role, formatDate(u.joinedAt, locale)]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("toasts.exported"));
  }

  const toolbar = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder={t("searchPlaceholder")} className="pl-9" aria-label={t("searchPlaceholder")} />
        </div>
        <Select value={role} onValueChange={(v) => { setRole(v); setPage(1); }}>
          <SelectTrigger size="sm" className="w-[8.5rem]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allRoles")}</SelectItem>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r}>{t(`roles.${r}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}><X /> {t("clearFilters")}</Button>
        )}
      </div>
      <Button variant="outline" size="sm" onClick={exportCsv} disabled={!data?.total}>
        <Download /> {t("export")}
      </Button>
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
        onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        onSortingChange={setSorting}
        onRowSelectionChange={setRowSelection}
        getRowId={(u) => u.id}
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
    </>
  );
}
