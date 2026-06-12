"use client";

/**
 * InvoiceManagement — CP billing hub: amber entity shell, scope filters, KPI + DataTable.
 * SSR seeds queryKeys.invoices.all (+ org scope when ?orgId=) via invoice-management/page.tsx.
 */

import { useCallback, useMemo, useState } from "react";
import { usePayments, type Invoice } from "@/hooks/usePayments";
import { ControlPanelPageChrome } from "@/components/control-panel/ControlPanelPageChrome";
import { ControlPanelHeaderGlassButton } from "@/components/control-panel/ControlPanelHeaderGlassButton";
import { ControlPanelEntityListShell } from "@/components/control-panel/ControlPanelEntityListShell";
import { DataTable } from "@/components/shared/DataTable";
import { ClinicalListFilterToolbar } from "@/components/shared/filters/ClinicalListFilterToolbar";
import { GlassResetFilterButton } from "@/components/shared/GlassResetFilterButton";
import { FilterSelect } from "@/components/shared/filters/FilterSelect";
import { DoctorFilterSelect } from "@/components/shared/filters/DoctorFilterSelect";
import {
  OrganizationFilterSelect,
  ORGANIZATION_FILTER_ALL_VALUE,
} from "@/components/shared/filters/OrganizationFilterSelect";
import { AppSectionErrorBanner } from "@/components/shared/AppSectionErrorBanner";
import { InvoiceBillingStatsRow } from "@/components/shared/billing/InvoiceBillingStatsRow";
import { InvoiceManagementBillingSectionHeading } from "@/components/control-panel/InvoiceManagementBillingSectionHeading";
import { useInvoiceFormDialog } from "@/context/InvoiceFormDialogContext";
import { buildInvoiceManagementColumns } from "@/components/control-panel/invoice-management-columns";
import {
  InvoiceManagementScopeProvider,
  useInvoiceManagementScope,
} from "@/components/control-panel/InvoiceManagementScopeContext";
import type { InvoiceStatusFilter } from "@/lib/invoice-management-filters";
import { controlPanelSectionRootClass } from "@/lib/control-panel-section-layout";
import { billingCreateInvoiceTriggerAdmin } from "@/lib/billing-ui-presets";
import { cpClinicalListTableFrameClassName } from "@/lib/cp-clinical-list-table-classes";
import { APP_INNER_SCROLL_STICKY_TOP_CLASS } from "@/lib/portal-z-index";
import {
  findFilterOptionLabel,
  invoiceStatusFilterOptions,
} from "@/lib/filter-select-option-presets";
import { getInvoiceListSearchBlob } from "@/lib/invoice-list-display";

const CreateInvoiceIcon = billingCreateInvoiceTriggerAdmin.triggerIcon;

const INVOICE_STATUS_OPTIONS = invoiceStatusFilterOptions();

type InvoiceManagementInnerProps = {
  viewerRole?: string | null;
};

function InvoiceManagementInner(_props: InvoiceManagementInnerProps) {
  const {
    pay,
    isPaying,
    deleteInvoice,
    updateInvoice,
    recordPayment,
    refundInvoice,
    isUpdating,
    isRecording,
    isRefunding,
    isError,
    error,
  } = usePayments();

  const {
    filter,
    setScopeFilter,
    activeInvoices,
    scopedInvoices,
    scopedTotals,
    scopedStatusTotals,
    allInvoices,
    listBodyLoading,
    statsLoading,
    status,
    setStatus,
    hasScopeFilters,
    resetScope,
    organizations,
    organizationsLoading,
    doctors,
    doctorsLoading,
    selectedOrganizationName,
    selectedDoctorDisplayName,
  } = useInvoiceManagementScope();

  const { openCreate, openEdit } = useInvoiceFormDialog();
  const [listSearch, setListSearch] = useState("");

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

  const searchFilteredInvoices = useMemo(() => {
    const q = listSearch.trim().toLowerCase();
    if (!q) return activeInvoices;
    return activeInvoices.filter((inv) => getInvoiceListSearchBlob(inv).includes(q));
  }, [activeInvoices, listSearch]);

  const hasToolbarFilters =
    status !== "all" || listSearch.trim().length > 0;

  const resetToolbar = useCallback(() => {
    setStatus("all");
    setListSearch("");
  }, [setStatus]);

  const orgSelectValue =
    filter.scope === "org" && filter.orgId ? filter.orgId : ORGANIZATION_FILTER_ALL_VALUE;

  const doctorSelectValue =
    filter.scope === "doctor" && filter.doctorId ? filter.doctorId : "all";

  const handleOrgFilterChange = useCallback(
    (value: string) => {
      if (value === ORGANIZATION_FILTER_ALL_VALUE) {
        setScopeFilter({ scope: "all" });
        return;
      }
      setScopeFilter({ scope: "org", orgId: value });
    },
    [setScopeFilter]
  );

  const handleDoctorFilterChange = useCallback(
    (value: string) => {
      if (value === "all") {
        setScopeFilter({ scope: "all" });
        return;
      }
      setScopeFilter({ scope: "doctor", doctorId: value });
    },
    [setScopeFilter]
  );

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
    <ControlPanelEntityListShell
      tone="amber"
      headerSlot={
        <ControlPanelPageChrome
          tab="invoices"
          actions={
            <ControlPanelHeaderGlassButton
              glassClassName={billingCreateInvoiceTriggerAdmin.triggerClassName}
              icon={CreateInvoiceIcon}
              onClick={openCreate}
            >
              {billingCreateInvoiceTriggerAdmin.triggerLabel}
            </ControlPanelHeaderGlassButton>
          }
        />
      }
      statsSlot={
        <>
          <InvoiceManagementBillingSectionHeading
            filter={filter}
            invoices={scopedInvoices}
            countSkeleton={listBodyLoading}
            organizationName={selectedOrganizationName}
            doctorDisplayName={selectedDoctorDisplayName}
            headerActions={
              <span className="flex flex-wrap items-center justify-end gap-2">
                <OrganizationFilterSelect
                  value={orgSelectValue}
                  onValueChange={handleOrgFilterChange}
                  organizations={organizations}
                  allInvoices={allInvoices}
                  disabled={organizationsLoading}
                  triggerClassName="min-w-[160px] max-w-[min(42vw,240px)]"
                />
                <DoctorFilterSelect
                  value={doctorSelectValue}
                  onValueChange={handleDoctorFilterChange}
                  doctors={doctors}
                  disabled={doctorsLoading}
                  allLabel="All doctors"
                  triggerClassName="min-w-[160px] max-w-[min(42vw,240px)]"
                  ariaLabel="Filter by doctor"
                />
                {hasScopeFilters ? (
                  <GlassResetFilterButton onClick={resetScope} />
                ) : null}
              </span>
            }
          />
          <InvoiceBillingStatsRow
            invoices={scopedInvoices}
            totals={scopedTotals}
            statusTotals={scopedStatusTotals}
            valueSkeleton={statsLoading}
          />
        </>
      }
      toolbarSlot={
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
            displayLabel={findFilterOptionLabel(INVOICE_STATUS_OPTIONS, status, "All Statuses")}
            size="toolbar"
            triggerClassName="max-w-[200px]"
            ariaLabel="Filter by invoice status"
            options={INVOICE_STATUS_OPTIONS}
          />
        </ClinicalListFilterToolbar>
      }
      tableSlot={
        <DataTable<Invoice, unknown>
          columns={columns}
          data={searchFilteredInvoices}
          isLoading={listBodyLoading}
          globalFilterFn={(row, q) => {
            const s = q.trim().toLowerCase();
            if (!s) return true;
            return getInvoiceListSearchBlob(row).includes(s);
          }}
          externalGlobalFilter={{ value: listSearch, onChange: setListSearch }}
          emptyMessage="No invoices yet. Create your first invoice to track payments."
          tableClassName="min-w-[1100px] w-full"
          tableFrameClassName={cpClinicalListTableFrameClassName}
          pagination={false}
        />
      }
    />
  );
}

type InvoiceManagementProps = {
  viewerRole?: string | null;
};

export default function InvoiceManagement(props: InvoiceManagementProps) {
  return (
    <InvoiceManagementScopeProvider viewerRole={props.viewerRole}>
      <InvoiceManagementInner {...props} />
    </InvoiceManagementScopeProvider>
  );
}
