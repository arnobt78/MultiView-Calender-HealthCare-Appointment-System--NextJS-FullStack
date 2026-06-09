"use client";

/**
 * InvoiceManagement — CP list: amber KPI strip + ClinicalListFilterToolbar + shared DataTable.
 * SSR seeds queryKeys.invoices.all via ControlPanelSectionServerPage (tab invoices).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { ListFilter, Receipt } from "lucide-react";
import { usePayments, type Invoice } from "@/hooks/usePayments";
import { Button } from "@/components/ui/button";
import { ControlPanelPageChrome } from "@/components/control-panel/ControlPanelPageChrome";
import { DataTable } from "@/components/shared/DataTable";
import { ClinicalListFilterToolbar } from "@/components/shared/filters/ClinicalListFilterToolbar";
import { FilterSelect } from "@/components/shared/filters/FilterSelect";
import { AppSectionErrorBanner } from "@/components/shared/AppSectionErrorBanner";
import { InvoiceBillingStatsRow } from "@/components/shared/billing/InvoiceBillingStatsRow";
import { useInvoiceFormDialog } from "@/context/InvoiceFormDialogContext";
import { buildInvoiceManagementColumns } from "@/components/control-panel/invoice-management-columns";
import {
  InvoiceListFiltersProvider,
  useInvoiceListFilters,
  type InvoiceStatusFilter,
} from "@/components/control-panel/InvoiceListFiltersContext";
import { controlPanelSectionRootClass } from "@/lib/control-panel-section-layout";
import { billingCreateInvoiceTriggerAdmin } from "@/lib/billing-ui-presets";
import { invoiceManagementTableFrameClass } from "@/lib/invoice-management-toolbar-classes";
import { APP_INNER_SCROLL_STICKY_TOP_CLASS } from "@/lib/portal-z-index";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

const CreateInvoiceIcon = billingCreateInvoiceTriggerAdmin.triggerIcon;

const STATUS_FILTER_LABEL: Record<InvoiceStatusFilter, string> = {
  all: "All Statuses",
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

function InvoiceManagementInner() {
  const queryClient = useQueryClient();
  const {
    invoices,
    isLoading,
    isError,
    error,
    pay,
    isPaying,
    deleteInvoice,
    updateInvoice,
    recordPayment,
    refundInvoice,
    isUpdating,
    isRecording,
    isRefunding,
  } = usePayments(); // SSR: ControlPanelSectionPageClient sync-seeds queryKeys.invoices.all before mount

  const { openCreate, openEdit } = useInvoiceFormDialog();
  const { status, setStatus, filterInvoices } = useInvoiceListFilters();
  const [listSearch, setListSearch] = useState("");

  const hasInvoicesCache = Boolean(
    queryClient.getQueryData<Invoice[]>(queryKeys.invoices.all)?.length
  );
  const listBodyLoading = isLoading && !hasInvoicesCache;

  const filteredInvoices = useMemo(
    () => filterInvoices(invoices),
    [invoices, filterInvoices]
  );

  const busyActions = isUpdating || isRecording || isRefunding;

  const columns = useMemo(
    () =>
      buildInvoiceManagementColumns({
        viewerRole: "admin",
        onEdit: openEdit,
        onPay: pay,
        onSend: (id) => updateInvoice({ invoiceId: id, body: { status: "sent" } }),
        onMarkPaid: recordPayment,
        onCancel: (id) => updateInvoice({ invoiceId: id, body: { status: "cancelled" } }),
        onDelete: deleteInvoice,
        onRefund: refundInvoice,
        isPaying,
        isUpdating: busyActions,
      }),
    [
      openEdit,
      pay,
      updateInvoice,
      recordPayment,
      deleteInvoice,
      refundInvoice,
      isPaying,
      busyActions,
    ]
  );

  const hasToolbarFilters = status !== "all" || listSearch.trim().length > 0;
  const resetToolbar = useCallback(() => {
    setStatus("all");
    setListSearch("");
  }, [setStatus]);

  if (isError) {
    return (
      <div className={controlPanelSectionRootClass}>
        <AppSectionErrorBanner>
          {error?.message ?? "Failed to load invoices"}
        </AppSectionErrorBanner>
      </div>
    );
  }

  return (
    <div className={controlPanelSectionRootClass}>
      <ControlPanelPageChrome
        tab="invoices"
        actions={
          <Button
            type="button"
            size="sm"
            className={billingCreateInvoiceTriggerAdmin.triggerClassName}
            onClick={openCreate}
          >
            <CreateInvoiceIcon className="h-4 w-4" aria-hidden />
            {billingCreateInvoiceTriggerAdmin.triggerLabel}
          </Button>
        }
      />

      <InvoiceBillingStatsRow invoices={invoices} valueSkeleton={listBodyLoading} />

      <ClinicalListFilterToolbar
        stickyClassName={APP_INNER_SCROLL_STICKY_TOP_CLASS}
        search={{
          value: listSearch,
          onChange: setListSearch,
          placeholder: "Search… (patient, visit title, invoice #)",
          ariaLabel: "Search invoices",
        }}
        showReset={hasToolbarFilters}
        onReset={resetToolbar}
      >
        <FilterSelect
          value={status}
          onValueChange={(v) => setStatus(v as InvoiceStatusFilter)}
          displayLabel={STATUS_FILTER_LABEL[status]}
          icon={ListFilter}
          size="toolbar"
          triggerClassName="max-w-[200px]"
          ariaLabel="Filter by invoice status"
          options={(
            Object.keys(STATUS_FILTER_LABEL) as InvoiceStatusFilter[]
          ).map((key) => ({
            value: key,
            label: STATUS_FILTER_LABEL[key],
          }))}
        />
      </ClinicalListFilterToolbar>

      <DataTable<Invoice, unknown>
        columns={columns}
        data={filteredInvoices}
        isLoading={listBodyLoading}
        globalFilterFn={(row, q) => {
          const s = q.trim().toLowerCase();
          if (!s) return true;
          const inv = row;
          const summary = inv.visit_summary;
          const blob = [
            inv.id,
            inv.description ?? "",
            summary?.title ?? "",
            summary?.patient_label ?? "",
            summary?.patient_email ?? "",
            summary?.treating_physician_label ?? "",
            summary?.appointment_type_name ?? "",
          ]
            .join(" ")
            .toLowerCase();
          return blob.includes(s);
        }}
        externalGlobalFilter={{ value: listSearch, onChange: setListSearch }}
        emptyMessage="No invoices yet. Create your first invoice to track payments."
        tableClassName="min-w-[1100px] w-full"
        tableFrameClassName={invoiceManagementTableFrameClass}
        pagination={false}
      />
    </div>
  );
}

export default function InvoiceManagement() {
  return (
    <InvoiceListFiltersProvider>
      <InvoiceManagementInner />
    </InvoiceListFiltersProvider>
  );
}
