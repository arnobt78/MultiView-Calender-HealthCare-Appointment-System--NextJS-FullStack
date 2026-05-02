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

type DataTableColumnMeta = {
  headClassName?: string;
  cellClassName?: string;
};

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  /** Single-column filter (legacy). Omit when using `globalFilterFn`. */
  searchColumnId?: string;
  /** Multi-field search — drives TanStack `globalFilter` (name + email, etc.). */
  globalFilterFn?: (row: TData, filterValue: string) => boolean;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  /** Enable pagination (default true) */
  pagination?: boolean;
  /** Page size (default 10) */
  pageSize?: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Search...",
  searchColumnId,
  globalFilterFn,
  isLoading,
  emptyMessage = "No results.",
  className,
  pagination = true,
  pageSize = 10,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const useGlobal = typeof globalFilterFn === "function";

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

  const showSearch = useGlobal || searchColumnId != null;

  return (
    <div className={cn("space-y-2", className)}>
      {showSearch && (
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
      <div className="rounded-2xl border">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const columnMeta = header.column.columnDef.meta as DataTableColumnMeta | undefined;
                  const columnId = header.column.id;
                  const compactEdgeColumn = columnId === "image" || columnId === "actions";
                  return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      compactEdgeColumn && "w-12 min-w-12 px-2",
                      columnMeta?.headClassName
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                )})}
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
                    const compactEdgeColumn = columnId === "image" || columnId === "actions";
                    return (
                      <TableCell
                        key={`skeleton-cell-${rowIdx}-${column.id}`}
                        className={cn(
                          compactEdgeColumn && "px-2",
                          columnId === "actions" && "text-right",
                          columnMeta?.cellClassName
                        )}
                      >
                        {columnId === "image" ? (
                          <div className="flex items-center">
                            <Skeleton className="h-9 w-9 rounded-full" />
                          </div>
                        ) : columnId === "name" || columnId === "display_name" ? (
                          <Skeleton className="h-4 w-28 rounded-sm" />
                        ) : columnId === "email" ? (
                          <Skeleton className="h-4 w-36 rounded-sm" />
                        ) : columnId === "role" || columnId === "active" ? (
                          <Skeleton className="h-5 w-16 rounded-full" />
                        ) : columnId === "created_at" ? (
                          <Skeleton className="h-4 w-20 rounded-sm" />
                        ) : columnId === "actions" ? (
                          <div className="flex justify-end">
                            <Skeleton className="h-4 w-4 rounded-sm" />
                          </div>
                        ) : (
                          <Skeleton className="h-4 w-24 rounded-sm" />
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
                    const compactEdgeColumn = columnId === "image" || columnId === "actions";
                    return (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        compactEdgeColumn && "px-2",
                        columnId === "actions" && "text-right",
                        columnMeta?.cellClassName
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  )})}
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
