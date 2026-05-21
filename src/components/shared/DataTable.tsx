"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export type DataTableColumnMeta = {
  /** One class string for both `<th>` and `<td>` — preferred when head/cell widths match (avoids load vs data drift). */
  shellClassName?: string;
  headClassName?: string;
  cellClassName?: string;
};

function resolveColumnShellMeta(meta: DataTableColumnMeta | undefined, slot: "head" | "cell") {
  if (meta?.shellClassName) return meta.shellClassName;
  return slot === "head" ? meta?.headClassName : meta?.cellClassName;
}

/** Padding comes only from `TableHead`/`TableCell` (`p-2` / `px-2 py-2`) — no extra horizontal padding here. */
function dataTableHeadShellClass(columnId: string, meta?: DataTableColumnMeta) {
  return cn(
    columnId === "image" && "w-12 min-w-12 shrink-0",
    columnId === "actions" && "text-right",
    resolveColumnShellMeta(meta, "head"),
    "align-middle"
  );
}

function dataTableCellShellClass(columnId: string, meta?: DataTableColumnMeta) {
  return cn(
    columnId === "image" && "w-12 min-w-12 shrink-0",
    columnId === "actions" && "text-right",
    resolveColumnShellMeta(meta, "cell"),
    "align-middle"
  );
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  /** Single-column filter (legacy). Omit when using `globalFilterFn`. */
  searchColumnId?: string;
  /** Multi-field search — drives TanStack `globalFilter` (name + email, etc.). */
  globalFilterFn?: (row: TData, filterValue: string) => boolean;
  /** Parent-owned filter string — hides built-in search row (toolbar above table). */
  externalGlobalFilter?: { value: string; onChange: (value: string) => void };
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  /** Enable pagination (default true) */
  pagination?: boolean;
  /** Page size (default 10) */
  pageSize?: number;
  /**
   * Extra classes on the inner `<table>` (e.g. `min-w-[880px]`).
   * With `table-fixed`, a min-width wider than the viewport lets the built-in `overflow-x-auto` on `Table` show a horizontal scrollbar only when needed.
   */
  tableClassName?: string;
  /** Merged onto the rounded card around the table (border, shadow, bg). */
  tableFrameClassName?: string;
  /**
   * `fixed` (default): predictable widths from meta classes.
   * `auto`: browser sizes from content + `min-w-*` / `w-[1%]` hints — better for name/email stacks and tight status/date columns.
   */
  tableLayout?: "fixed" | "auto";
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Search...",
  searchColumnId,
  globalFilterFn,
  externalGlobalFilter,
  isLoading,
  emptyMessage = "No results.",
  className,
  pagination = true,
  pageSize = 10,
  tableClassName,
  tableFrameClassName,
  tableLayout = "fixed",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [internalGlobalFilter, setInternalGlobalFilter] = React.useState("");
  const useGlobal = typeof globalFilterFn === "function";
  const globalFilter = externalGlobalFilter ? externalGlobalFilter.value : internalGlobalFilter;
  const setGlobalFilter = externalGlobalFilter ? externalGlobalFilter.onChange : setInternalGlobalFilter;

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      ...(useGlobal ? { globalFilter } : {}),
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: useGlobal ? setGlobalFilter : undefined,
    globalFilterFn: useGlobal
      ? (row, _columnId, filterValue) => globalFilterFn!(row.original, String(filterValue ?? ""))
      : undefined,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: pagination ? { pagination: { pageSize } } : undefined,
  });

  const showBuiltInSearch =
    (useGlobal && !externalGlobalFilter) || (!useGlobal && searchColumnId != null);

  return (
    <div className={cn("space-y-2", className)}>
      {showBuiltInSearch && (
        <div className="flex items-center gap-2">
          <Input
            placeholder={searchPlaceholder}
            value={
              useGlobal
                ? (globalFilter as string)
                : ((table.getColumn(searchColumnId!)?.getFilterValue() as string) ?? "")
            }
            onChange={(e) => {
              const v = e.target.value;
              if (useGlobal) setGlobalFilter(v);
              else table.getColumn(searchColumnId!)?.setFilterValue(v);
            }}
            className="max-w-sm"
          />
        </div>
      )}
      <div
        className={cn(
          "max-w-full min-w-0",
          tableFrameClassName ?? "rounded-2xl border border-gray-200 bg-white"
        )}
      >
        <Table
          className={cn(
            tableLayout === "auto" ? "table-auto w-full" : "table-fixed",
            tableClassName
          )}
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const columnMeta = header.column.columnDef.meta as DataTableColumnMeta | undefined;
                  const columnId = header.column.id;
                  return (
                    <TableHead
                      key={header.id}
                      className={dataTableHeadShellClass(columnId, columnMeta)}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Keep headers static and render fixed-size inline row skeletons.
              Array.from({ length: 5 }).map((_, rowIdx) => (
                <TableRow key={`skeleton-row-${rowIdx}`}>
                  {table.getAllLeafColumns().map((column) => {
                    const columnMeta = column.columnDef.meta as DataTableColumnMeta | undefined;
                    const columnId = column.id;
                    return (
                      <TableCell
                        key={`skeleton-cell-${rowIdx}-${column.id}`}
                        className={dataTableCellShellClass(columnId, columnMeta)}
                      >
                        {columnId === "image" ? (
                          <div className="flex min-h-[2.75rem] items-center">
                            <Skeleton className="h-9 w-9 rounded-full" />
                          </div>
                        ) : columnId === "name" ? (
                          // Patient list: avatar + lines grouped like the loaded cell (avoids a wide empty band on large screens).
                          <div className="flex min-h-[2.75rem] w-full min-w-0 flex-row items-center gap-2">
                            <Skeleton className="h-9 w-9 shrink-0 rounded-full" aria-hidden />
                            <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                              <Skeleton className="h-4 w-full max-w-[14rem] rounded-sm" />
                              <Skeleton className="h-3 w-full max-w-[16rem] rounded-sm" />
                            </div>
                          </div>
                        ) : columnId === "display_name" ? (
                          <div className="flex min-h-[2.75rem] w-full min-w-0 flex-col justify-center gap-1">
                            <Skeleton className="h-4 w-full max-w-[14rem] rounded-sm" />
                            <Skeleton className="h-3 w-full max-w-[16rem] rounded-sm" />
                          </div>
                        ) : columnId === "email" ? (
                          <div className="flex min-h-[2.75rem] w-full min-w-0 flex-col justify-center">
                            <Skeleton className="h-4 w-full max-w-xs rounded-sm" />
                          </div>
                        ) : columnId === "care_level" ? (
                          <div className="flex min-h-[2.75rem] w-full min-w-0 flex-col justify-center">
                            <Skeleton className="h-4 w-full max-w-[14rem] rounded-sm" />
                          </div>
                        ) : columnId === "primary_doctor_display" ? (
                          <div className="flex min-h-[2.75rem] w-full min-w-0 flex-col justify-center gap-1">
                            <Skeleton className="h-4 w-full max-w-[14rem] rounded-sm" />
                            <Skeleton className="h-3 w-full max-w-[16rem] rounded-sm" />
                          </div>
                        ) : columnId === "role" || columnId === "active" ? (
                          <div className="flex min-h-[2.75rem] w-full min-w-0 flex-col justify-center">
                            <Skeleton className="h-5 w-[7.25rem] shrink-0 rounded-full" />
                          </div>
                        ) : columnId === "created_at" ? (
                          <div className="flex min-h-[2.75rem] w-full min-w-0 flex-col justify-center">
                            <Skeleton className="h-4 w-[8.75rem] shrink-0 rounded-sm" />
                          </div>
                        ) : columnId === "actions" ? (
                          // Action buttons are static chrome — no skeleton placeholder needed;
                          // an empty-height div keeps the row height consistent during load.
                          <div className="flex min-h-[2.75rem] items-center justify-end" />
                        ) : (
                          <div className="flex min-h-[2.75rem] w-full min-w-0 flex-col justify-center">
                            <Skeleton className="h-4 w-full max-w-[10rem] rounded-sm" />
                          </div>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => {
                    const columnMeta = cell.column.columnDef.meta as DataTableColumnMeta | undefined;
                    const columnId = cell.column.id;
                    return (
                      <TableCell
                        key={cell.id}
                        className={dataTableCellShellClass(columnId, columnMeta)}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {pagination && table.getPageCount() > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}.
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
