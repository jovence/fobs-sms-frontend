"use client";

import { type ReactNode } from "react";
import {
  type ColumnDef,
  type OnChangeFn,
  type RowSelectionState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { AnimatePresence, motion } from "motion/react";
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
}: DataTableProps<TData>) {
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
    enableRowSelection: true,
    rowCount: total,
  });

  const selectedIds = Object.keys(rowSelection).filter((k) => rowSelection[k]);
  const showEmpty = !isLoading && !isError && data.length === 0;

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
                aria-label="Clear selection"
              >
                <X />
              </Button>
              <span className="text-sm font-medium tabular-nums">
                {selectedIds.length} selected
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
                  {hg.headers.map((header) => (
                    <TableHead key={header.id} className="h-11 whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="hover:bg-transparent">
                    {columns.map((_c, ci) => (
                      <TableCell key={ci} className="py-3">
                        <div className="skeleton h-4 w-full max-w-[8rem] rounded" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columns.length} className="p-0">
                    <ErrorState
                      title="Couldn't load data"
                      description="Something went wrong while fetching. Please try again."
                      onRetry={onRetry}
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
