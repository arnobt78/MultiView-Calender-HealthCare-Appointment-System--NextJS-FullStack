"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import { InvoiceAdminActionsMenu } from "@/components/shared/billing/InvoiceAdminActionsMenu";
import {
  InvoiceCreatedTableCell,
  InvoiceDueTableCell,
  InvoiceManagementIdentityCell,
} from "@/components/shared/billing/invoice-table-cells";
import { InvoiceVisitListCell } from "@/components/control-panel/InvoiceVisitListCell";
import type { Invoice } from "@/hooks/usePayments";
import { getInvoiceListSortKey } from "@/lib/invoice-list-display";
import {
  clinicalTableColumnWrapShellClass,
} from "@/lib/table-display-styles";
import {
  cpClinicalListActionsColumnShellClass,
  cpClinicalListIdentityColumnShellClass,
  cpClinicalListInvoiceColumnShellClass,
  cpClinicalListInvoiceCreatedColumnShellClass,
  cpClinicalListInvoiceDueColumnShellClass,
} from "@/lib/cp-clinical-list-table-classes";
import { cn } from "@/lib/utils";

export type BuildInvoiceManagementColumnsOpts = {
  viewerRole: "admin" | "doctor";
  /** Patient portal detail — identity links only, no row menu. */
  includeActionsColumn?: boolean;
  onEdit: (invoice: Invoice) => void;
  onPay: (id: string) => void;
  onSend: (id: string) => void;
  onMarkPaid: (id: string) => void;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void | Promise<void>;
  onRefund: (id: string) => void;
  isPaying?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
};

/** CP invoice list — same DataTable chrome as patient/category management. */
export function buildInvoiceManagementColumns(
  opts: BuildInvoiceManagementColumnsOpts
): ColumnDef<Invoice>[] {
  const {
    viewerRole,
    includeActionsColumn = true,
    onEdit,
    onPay,
    onSend,
    onMarkPaid,
    onCancel,
    onDelete,
    onRefund,
    isPaying,
    isUpdating,
    isDeleting,
  } = opts;

  const columns: ColumnDef<Invoice>[] = [
    {
      id: "invoice",
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Invoice" />
      ),
      meta: { shellClassName: cpClinicalListInvoiceColumnShellClass },
      cell: ({ row }) => (
        <InvoiceManagementIdentityCell
          invoice={row.original}
          viewerRole={viewerRole}
          listIndex={row.index + 1}
        />
      ),
    },
    {
      id: "description",
      accessorFn: (row) => getInvoiceListSortKey(row),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      meta: {
        shellClassName: cn(
          clinicalTableColumnWrapShellClass,
          cpClinicalListIdentityColumnShellClass
        ),
      },
      cell: ({ row }) => (
        <InvoiceVisitListCell invoice={row.original} viewerRole={viewerRole} />
      ),
    },
    {
      id: "due",
      accessorFn: (row) => row.due_date ?? "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Due" />
      ),
      meta: { shellClassName: cpClinicalListInvoiceDueColumnShellClass },
      cell: ({ row }) => <InvoiceDueTableCell invoice={row.original} />,
    },
    {
      id: "created",
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      meta: { shellClassName: cpClinicalListInvoiceCreatedColumnShellClass },
      cell: ({ row }) => (
        <InvoiceCreatedTableCell invoice={row.original} viewerRole={viewerRole} />
      ),
    },
  ];

  if (includeActionsColumn) {
    columns.push({
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Actions" className="text-right" />
      ),
      enableSorting: false,
      meta: { shellClassName: cpClinicalListActionsColumnShellClass },
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
            isDeleting={isDeleting}
          />
        );
      },
    });
  }

  return columns;
}
