"use client";

/**
 * Shared CP invoice list — same columns, toolbar (search + status), and actions as invoice-management.
 * Entity detail pages pass a pre-scoped `invoices` slice; hub passes scoped list from URL filters.
 */
import { useMemo } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { InvoiceClinicalListToolbar } from "@/components/shared/billing/InvoiceClinicalListToolbar";
import { buildInvoiceManagementColumns } from "@/components/control-panel/invoice-management-columns";
import { usePayments, type Invoice } from "@/hooks/usePayments";
import { useAuth } from "@/hooks/useAuth";
import { useInvoiceFormDialogOptional } from "@/context/InvoiceFormDialogContext";
import type { EntityRole } from "@/lib/entity-routes";
import { useInvoiceListToolbarFilters, type InvoiceListToolbarFilters } from "@/hooks/useInvoiceListToolbarFilters";
import { cpClinicalListTableFrameClassName } from "@/lib/cp-clinical-list-table-classes";
import { getInvoiceListSearchBlob } from "@/lib/invoice-list-display";
import { isAdminRole, isPatientRole } from "@/lib/rbac";
import { cn } from "@/lib/utils";

function resolveInvoiceTablePresentation(viewerRole: EntityRole): {
  columnRole: "admin" | "doctor";
  includeActionsColumn: boolean;
} {
  if (isPatientRole(viewerRole)) {
    return { columnRole: "doctor", includeActionsColumn: false };
  }
  if (isAdminRole(viewerRole)) {
    return { columnRole: "admin", includeActionsColumn: true };
  }
  return { columnRole: "doctor", includeActionsColumn: true };
}

export type InvoiceClinicalListTableProps = {
  invoices: Invoice[];
  viewerRole: EntityRole;
  isLoading?: boolean;
  emptyMessage?: string;
  showToolbar?: boolean;
  /** Hub shell — toolbar renders in `toolbarSlot` above the table frame. */
  toolbarPlacement?: "integrated" | "external";
  toolbarState?: InvoiceListToolbarFilters;
  tableClassName?: string;
  tableFrameClassName?: string;
  className?: string;
};

export function InvoiceClinicalListTable({
  invoices,
  viewerRole,
  isLoading = false,
  emptyMessage = "No invoices yet.",
  showToolbar = true,
  toolbarPlacement = "integrated",
  toolbarState: toolbarStateProp,
  tableClassName = "min-w-[1100px] w-full",
  tableFrameClassName = cpClinicalListTableFrameClassName,
  className,
}: InvoiceClinicalListTableProps) {
  const internalToolbar = useInvoiceListToolbarFilters(invoices);
  const toolbarState = toolbarStateProp ?? internalToolbar;

  const {
    pay,
    isPaying,
    deleteInvoiceAsync,
    isDeleting,
    updateInvoice,
    recordPayment,
    refundInvoice,
    isUpdating,
    isRecording,
    isRefunding,
  } = usePayments();

  const invoiceDialog = useInvoiceFormDialogOptional();
  const { user } = useAuth();
  const openEdit = useMemo(
    () => invoiceDialog?.openEdit ?? (() => {}),
    [invoiceDialog?.openEdit]
  );

  const { columnRole, includeActionsColumn } = useMemo(
    () => resolveInvoiceTablePresentation(viewerRole),
    [viewerRole]
  );

  const busyActions = isUpdating || isRecording || isRefunding;

  const columns = useMemo(
    () =>
      buildInvoiceManagementColumns({
        viewerRole: columnRole,
        viewerUserId: columnRole === "doctor" ? user?.id : undefined,
        includeActionsColumn,
        onEdit: openEdit,
        onPay: pay,
        onSend: (id) => updateInvoice({ invoiceId: id, body: { status: "sent" } }),
        onMarkPaid: recordPayment,
        onCancel: (id) => updateInvoice({ invoiceId: id, body: { status: "cancelled" } }),
        onDelete: async (id) => {
          await deleteInvoiceAsync(id);
        },
        onRefund: refundInvoice,
        isPaying,
        isUpdating: busyActions,
        isDeleting,
      }),
    [
      columnRole,
      user?.id,
      includeActionsColumn,
      openEdit,
      pay,
      updateInvoice,
      recordPayment,
      deleteInvoiceAsync,
      refundInvoice,
      isPaying,
      busyActions,
      isDeleting,
    ]
  );

  const toolbar =
    showToolbar && toolbarPlacement === "integrated" ? (
      <InvoiceClinicalListToolbar
        listSearch={toolbarState.listSearch}
        setListSearch={toolbarState.setListSearch}
        status={toolbarState.status}
        setStatus={toolbarState.setStatus}
        hasToolbarFilters={toolbarState.hasToolbarFilters}
        resetToolbar={toolbarState.resetToolbar}
      />
    ) : null;

  return (
    <div className={cn("space-y-3", className)}>
      {toolbar}
      <DataTable<Invoice, unknown>
        columns={columns}
        data={toolbarState.filteredInvoices}
        isLoading={isLoading}
        globalFilterFn={(row, q) => {
          const s = q.trim().toLowerCase();
          if (!s) return true;
          return getInvoiceListSearchBlob(row).includes(s);
        }}
        externalGlobalFilter={{
          value: toolbarState.listSearch,
          onChange: toolbarState.setListSearch,
        }}
        emptyMessage={emptyMessage}
        tableClassName={tableClassName}
        tableFrameClassName={tableFrameClassName}
        pagination={false}
      />
    </div>
  );
}
