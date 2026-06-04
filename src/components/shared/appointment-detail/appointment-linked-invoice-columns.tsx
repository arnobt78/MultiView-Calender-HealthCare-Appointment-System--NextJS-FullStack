"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import { InvoiceAmountDisplay } from "@/components/shared/billing/InvoiceAmountDisplay";
import { InvoiceStatusBadge } from "@/components/shared/billing/InvoiceStatusBadge";
import {
  InvoiceCreatedTableCell,
  InvoiceDescriptionTableCell,
  InvoiceNumberTableCell,
} from "@/components/shared/billing/invoice-table-cells";
import type { Invoice } from "@/hooks/usePayments";
import type { EntityRole } from "@/lib/entity-routes";
import { clinicalTableCellMinRowClass } from "@/lib/table-display-styles";

/** Linked invoice table on appointment detail — read-only, no row menu. */
export function buildAppointmentLinkedInvoiceColumns(
  viewerRole: EntityRole
): ColumnDef<Invoice>[] {
  return [
    {
      id: "invoice_number",
      accessorFn: (row) => row.id,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Invoice #" />,
      cell: ({ row }) => (
        <InvoiceNumberTableCell invoice={row.original} viewerRole={viewerRole} />
      ),
    },
    {
      id: "amount",
      accessorKey: "amount",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
      cell: ({ row }) => (
        <div className={clinicalTableCellMinRowClass}>
          <InvoiceAmountDisplay
            amountCents={row.original.amount}
            currency={row.original.currency}
            invoice={row.original}
          />
        </div>
      ),
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <div className={clinicalTableCellMinRowClass}>
          <InvoiceStatusBadge invoice={row.original} />
        </div>
      ),
    },
    {
      id: "created",
      accessorKey: "created_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ row }) => <InvoiceCreatedTableCell invoice={row.original} />,
    },
    {
      id: "description",
      accessorFn: (row) => row.description ?? "",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
      cell: ({ row }) => (
        <InvoiceDescriptionTableCell invoice={row.original} viewerRole={viewerRole} />
      ),
    },
  ];
}
