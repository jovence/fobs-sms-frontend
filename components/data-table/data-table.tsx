"use client";

import { useEffect, type ReactNode } from "react";
import {
  type ColumnDef,
  type OnChangeFn,
  type Row,
  type RowSelectionState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/common/states";
import { DataTablePagination } from "./data-table-pagination";
import { cn } from "@/lib/utils";

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  total: number;
  page: number;
  pageSize: number;
  sorting: SortingState;
  rowSelection: RowSelectionState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSortingChange: OnChangeFn<SortingState>;
  onRowSelectionChange: OnChangeFn<RowSelectionState>;
  getRowId: (row: TData) => string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  toolbar?: ReactNode;
  bulkActions?: (selectedIds: string[], clear: () => void) => ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  /** Restrict which rows can be selected (e.g. protect admin rows). */
  enableRowSelection?: (row: Row<TData>) => boolean;
}

export function DataTable<TData>({
  columns,
  data,
  total,
  page,
  pageSize,
  sorting,
  rowSelection,
  onPageChange,
  onPageSizeChange,
  onSortingChange,
  onRowSelectionChange,
  getRowId,
  isLoading,
  isError,
  onRetry,
  toolbar,
  bulkActions,
  emptyTitle = "No results",
  emptyDescription,
  emptyAction,
  enableRowSelection,
}: DataTableProps<TData>) {
  const t = useTranslations("table");
  const table = useReactTable({
    data,
    columns,
    getRowId,
    state: { sorting, rowSelection },
    onSortingChange,
    onRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    enableRowSelection: enableRowSelection ?? true,
    rowCount: total,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Clamp the page when the result set shrinks (e.g. deleting the last row on the last page),
  // so users are never stranded on an out-of-range page that reads as "no data".
  useEffect(() => {
    if (page > totalPages) onPageChange(totalPages);
  }, [page, totalPages, onPageChange]);

  const selectedIds = Object.keys(rowSelection).filter((k) => rowSelection[k]);
  // Only show skeletons on the FIRST load (no data yet). Background refetches keep the
  // previous rows visible (keepPreviousData) instead of flashing the skeleton.
  const firstLoad = !!isLoading && data.length === 0;
  const showError = !!isError && data.length === 0;
  const showEmpty = !firstLoad && !showError && data.length === 0;
  const skeletonRows = Math.min(pageSize, 8);

  return (
    <div className="space-y-3">
      {toolbar}

      {/* Bulk action bar */}
      <AnimatePresence initial={false}>
        {selectedIds.length > 0 && bulkActions && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => table.resetRowSelection()}
                aria-label={t("clearSelection")}
              >
                <X />
              </Button>
              <span className="text-sm font-medium tabular-nums">
                {t("selected", { count: selectedIds.length })}
              </span>
              <div className="ml-auto flex items-center gap-2">
                {bulkActions(selectedIds, () => table.resetRowSelection())}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="overflow-hidden rounded-xl border bg-card shadow-[var(--shadow-sm)]">
        <div className="max-h-[calc(100dvh-20rem)] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur">
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="hover:bg-transparent">
                  {hg.headers.map((header) => {
                    const sorted = header.column.getIsSorted();
                    return (
                      <TableHead
                        key={header.id}
                        scope="col"
                        aria-sort={
                          header.column.getCanSort()
                            ? sorted === "asc"
                              ? "ascending"
                              : sorted === "desc"
                                ? "descending"
                                : "none"
                            : undefined
                        }
                        className="h-11 whitespace-nowrap"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {firstLoad ? (
                Array.from({ length: skeletonRows }).map((_, i) => (
                  <TableRow key={i} className="hover:bg-transparent">
                    {columns.map((_c, ci) => (
                      <TableCell key={ci} className="py-3">
                        <div className="skeleton h-4 w-full max-w-[8rem] rounded" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : showError ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columns.length} className="p-0">
                    <ErrorState
                      title={t("errorTitle")}
                      description={t("errorDescription")}
                      onRetry={onRetry}
                      retryLabel={t("retry")}
                      className="border-0"
                    />
                  </TableCell>
                </TableRow>
              ) : showEmpty ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columns.length} className="p-0">
                    <EmptyState
                      title={emptyTitle}
                      description={emptyDescription}
                      action={emptyAction}
                      className="border-0"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                    className={cn(
                      "transition-colors",
                      row.getIsSelected() && "bg-primary/[0.04]",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <DataTablePagination
        page={page}
        pageSize={pageSize}
        total={total}
        selectedCount={selectedIds.length}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
