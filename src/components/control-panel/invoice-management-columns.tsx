"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import { InvoiceAdminActionsMenu } from "@/components/shared/billing/InvoiceAdminActionsMenu";
import { InvoiceAmountDisplay } from "@/components/shared/billing/InvoiceAmountDisplay";
import { InvoiceStatusBadge } from "@/components/shared/billing/InvoiceStatusBadge";
import {
  InvoiceCreatedTableCell,
  InvoiceDescriptionTableCell,
  InvoiceDueTableCell,
  InvoiceNumberTableCell,
} from "@/components/shared/billing/invoice-table-cells";
import type { Invoice } from "@/hooks/usePayments";
import {
  clinicalTableCellMinRowClass,
  clinicalTableColumnWrapShellClass,
} from "@/lib/table-display-styles";
import { cn } from "@/lib/utils";

export type BuildInvoiceManagementColumnsOpts = {
  viewerRole: "admin" | "doctor";
  onEdit: (invoice: Invoice) => void;
  onPay: (id: string) => void;
  onSend: (id: string) => void;
  onMarkPaid: (id: string) => void;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
  onRefund: (id: string) => void;
  isPaying?: boolean;
  isUpdating?: boolean;
};

/** CP invoice list — same DataTable chrome as patient/category management. */
export function buildInvoiceManagementColumns(
  opts: BuildInvoiceManagementColumnsOpts
): ColumnDef<Invoice>[] {
  const {
    viewerRole,
    onEdit,
    onPay,
    onSend,
    onMarkPaid,
    onCancel,
    onDelete,
    onRefund,
    isPaying,
    isUpdating,
  } = opts;

  return [
    {
      id: "invoice_number",
      accessorFn: (row) => row.id,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Invoice #" />
      ),
      cell: ({ row }) => (
        <InvoiceNumberTableCell invoice={row.original} viewerRole={viewerRole} />
      ),
    },
    {
      id: "description",
      accessorFn: (row) => row.description ?? row.visit_summary?.title ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      meta: { shellClassName: clinicalTableColumnWrapShellClass },
      cell: ({ row }) => (
        <InvoiceDescriptionTableCell invoice={row.original} viewerRole={viewerRole} />
      ),
    },
    {
      id: "amount",
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({ row }) => {
        const inv = row.original;
        return (
          <div className={cn(clinicalTableCellMinRowClass, "flex items-center")}>
            <InvoiceAmountDisplay
              amountCents={inv.amount}
              currency={inv.currency}
              invoice={inv}
            />
          </div>
        );
      },
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <div className={cn(clinicalTableCellMinRowClass, "flex items-center")}>
          <InvoiceStatusBadge invoice={row.original} />
        </div>
      ),
    },
    {
      id: "due",
      accessorFn: (row) => row.due_date ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Due" />
      ),
      cell: ({ row }) => <InvoiceDueTableCell invoice={row.original} />,
    },
    {
      id: "created",
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      meta: { shellClassName: clinicalTableColumnWrapShellClass },
      cell: ({ row }) => <InvoiceCreatedTableCell invoice={row.original} />,
    },
    {
      id: "actions",
      header: () => null,
      enableSorting: false,
      cell: ({ row }) => {
        const invoice = row.original;
        const busy = isUpdating;
        return (
          <InvoiceAdminActionsMenu
            invoice={invoice}
            viewerRole={viewerRole}
            onEdit={onEdit}
            onPay={onPay}
            onSend={onSend}
            onMarkPaid={onMarkPaid}
            onCancel={onCancel}
            onDelete={onDelete}
            onRefund={onRefund}
            isPaying={isPaying}
            isUpdating={busy}
          />
        );
      },
    },
  ];
}
