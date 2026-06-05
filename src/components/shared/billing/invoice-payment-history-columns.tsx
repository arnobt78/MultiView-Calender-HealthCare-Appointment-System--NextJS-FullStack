"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import { InvoiceAmountDisplay } from "@/components/shared/billing/InvoiceAmountDisplay";
import type { InvoicePaymentRow } from "@/lib/billing-types";
import { clinicalCellMutedTextClass, clinicalTableCellMinRowClass } from "@/lib/table-display-styles";
import { cn } from "@/lib/utils";

const PAYMENT_STATUS_CLASS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  succeeded: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-orange-100 text-orange-700",
};

/** Payment history table on invoice detail — read-only ClinicalDataTable columns. */
export function buildInvoicePaymentHistoryColumns(currency: string): ColumnDef<InvoicePaymentRow>[] {
  return [
    {
      id: "payment_id",
      accessorFn: (row) => row.id,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Payment ID" />,
      meta: { cellClassName: "align-middle" },
      cell: ({ row }) => (
        <div className={cn(clinicalTableCellMinRowClass, "flex items-center")}>
          <span className="font-mono text-xs text-foreground" title={row.original.id}>
            #{row.original.id.slice(0, 8)}
          </span>
        </div>
      ),
    },
    {
      id: "amount",
      accessorKey: "amount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
      meta: { cellClassName: "align-middle" },
      cell: ({ row }) => (
        <div className={cn(clinicalTableCellMinRowClass, "flex items-center")}>
          <InvoiceAmountDisplay
            amountCents={row.original.amount}
            currency={currency}
            className="font-semibold"
          />
        </div>
      ),
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      meta: { cellClassName: "align-middle" },
      cell: ({ row }) => (
        <div className={cn(clinicalTableCellMinRowClass, "flex items-center")}>
          <Badge
            className={cn(
              "shrink-0",
              PAYMENT_STATUS_CLASS[row.original.status] ?? "bg-gray-100 text-gray-700"
            )}
          >
            {row.original.status}
          </Badge>
        </div>
      ),
    },
    {
      id: "stripe_id",
      accessorFn: (row) => row.stripe_payment_id ?? "",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Stripe ID" />,
      meta: { cellClassName: "align-middle" },
      cell: ({ row }) => {
        const stripeId = row.original.stripe_payment_id?.trim();
        return (
          <div className={cn(clinicalTableCellMinRowClass, "flex items-center")}>
            {stripeId ? (
              <span className="font-mono text-xs text-muted-foreground" title={stripeId}>
                {stripeId}
              </span>
            ) : (
              <span className={clinicalCellMutedTextClass}>—</span>
            )}
          </div>
        );
      },
    },
    {
      id: "date",
      accessorKey: "created_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      meta: { cellClassName: "align-middle" },
      cell: ({ row }) => (
        <div className={cn(clinicalTableCellMinRowClass, "flex items-center")}>
          <span className={cn("text-sm tabular-nums", clinicalCellMutedTextClass)}>
            {format(new Date(row.original.created_at), "dd MMM yyyy")}
          </span>
        </div>
      ),
    },
  ];
}
