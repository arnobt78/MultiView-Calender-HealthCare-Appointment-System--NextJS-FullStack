"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import { InvoiceAmountDisplay } from "@/components/shared/billing/InvoiceAmountDisplay";
import { PaymentStatusBadge } from "@/components/shared/billing/PaymentStatusBadge";
import type { InvoicePaymentRow } from "@/lib/billing-types";
import {
  formatPaymentReferenceLabel,
  paymentAmountTextClassForStatus,
} from "@/lib/payment-status-display";
import { clinicalCellMutedTextClass, clinicalTableCellMinRowClass } from "@/lib/table-display-styles";
import { cn } from "@/lib/utils";

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
            className={cn(
              "font-semibold",
              paymentAmountTextClassForStatus(row.original.status)
            )}
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
          <PaymentStatusBadge status={row.original.status} />
        </div>
      ),
    },
    {
      id: "stripe_id",
      accessorFn: (row) => row.stripe_payment_id ?? "",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Payment reference" />,
      meta: { cellClassName: "align-middle" },
      cell: ({ row }) => {
        const { label, title } = formatPaymentReferenceLabel(row.original.stripe_payment_id);
        return (
          <div className={cn(clinicalTableCellMinRowClass, "flex items-center")}>
            {label === "—" ? (
              <span className={clinicalCellMutedTextClass}>—</span>
            ) : (
              <span className="text-sm text-foreground" title={title}>
                {label}
              </span>
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
