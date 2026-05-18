"use client";

/**
 * Read-only / snapshot tables — same TanStack `DataTable` shell as patient management
 * with defaults suited to detail pages (no pagination, auto column layout).
 */
import { DataTable, type DataTableProps } from "@/components/shared/DataTable";

export type ClinicalDataTableProps<TData, TValue> = Omit<
  DataTableProps<TData, TValue>,
  "pagination" | "tableLayout"
> &
  Partial<Pick<DataTableProps<TData, TValue>, "pagination" | "tableLayout">>;

export function ClinicalDataTable<TData, TValue>({
  pagination = false,
  tableLayout = "auto",
  ...rest
}: ClinicalDataTableProps<TData, TValue>) {
  return (
    <DataTable<TData, TValue>
      pagination={pagination}
      tableLayout={tableLayout}
      {...rest}
    />
  );
}
