"use client";

/**
 * InvoiceManagement — CP billing hub: amber entity shell, scope filters, KPI + shared invoice table.
 * SSR seeds queryKeys.invoices.all (+ org scope when ?orgId=) via invoice-management/page.tsx.
 */

import { useCallback } from "react";
import { ControlPanelPageChrome } from "@/components/control-panel/ControlPanelPageChrome";
import { ControlPanelHeaderGlassButton } from "@/components/control-panel/ControlPanelHeaderGlassButton";
import { ControlPanelEntityListShell } from "@/components/control-panel/ControlPanelEntityListShell";
import { GlassResetFilterButton } from "@/components/shared/GlassResetFilterButton";
import { DoctorFilterSelect } from "@/components/shared/filters/DoctorFilterSelect";
import { ScopeFilterInlineRow } from "@/components/shared/filters/ScopeFilterInlineRow";
import {
  OrganizationFilterSelect,
  ORGANIZATION_FILTER_ALL_VALUE,
} from "@/components/shared/filters/OrganizationFilterSelect";
import { AppSectionErrorBanner } from "@/components/shared/AppSectionErrorBanner";
import { InvoiceBillingStatsRow } from "@/components/shared/billing/InvoiceBillingStatsRow";
import { InvoiceClinicalListTable } from "@/components/shared/billing/InvoiceClinicalListTable";
import { InvoiceClinicalListToolbar } from "@/components/shared/billing/InvoiceClinicalListToolbar";
import { InvoiceManagementBillingSectionHeading } from "@/components/control-panel/InvoiceManagementBillingSectionHeading";
import { useInvoiceFormDialog } from "@/context/InvoiceFormDialogContext";
import {
  InvoiceManagementScopeProvider,
  useInvoiceManagementScope,
} from "@/components/control-panel/InvoiceManagementScopeContext";
import { controlPanelSectionRootClass } from "@/lib/control-panel-section-layout";
import { billingCreateInvoiceTriggerAdmin } from "@/lib/billing-ui-presets";
import { usePayments } from "@/hooks/usePayments";
import { useInvoiceListToolbarFilters } from "@/hooks/useInvoiceListToolbarFilters";

const CreateInvoiceIcon = billingCreateInvoiceTriggerAdmin.triggerIcon;

type InvoiceManagementInnerProps = {
  viewerRole?: string | null;
};

function InvoiceManagementInner(_props: InvoiceManagementInnerProps) {
  const { isError, error } = usePayments();

  const {
    filter,
    setScopeFilter,
    scopedInvoices,
    scopedTotals,
    scopedStatusTotals,
    allInvoices,
    listBodyLoading,
    statsLoading,
    hasScopeFilters,
    resetScope,
    organizations,
    organizationsLoading,
    doctors,
    doctorsLoading,
    selectedOrganizationName,
    selectedDoctorDisplayName,
  } = useInvoiceManagementScope();

  const { openCreate } = useInvoiceFormDialog();
  const toolbarState = useInvoiceListToolbarFilters(scopedInvoices);

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
              <ScopeFilterInlineRow>
                <OrganizationFilterSelect
                  value={orgSelectValue}
                  onValueChange={handleOrgFilterChange}
                  organizations={organizations}
                  allInvoices={allInvoices}
                  disabled={organizationsLoading}
                />
                <DoctorFilterSelect
                  value={doctorSelectValue}
                  onValueChange={handleDoctorFilterChange}
                  doctors={doctors}
                  disabled={doctorsLoading}
                  allLabel="All doctors"
                  ariaLabel="Filter by doctor"
                />
                {hasScopeFilters ? (
                  <GlassResetFilterButton onClick={resetScope} />
                ) : null}
              </ScopeFilterInlineRow>
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
        <InvoiceClinicalListToolbar
          listSearch={toolbarState.listSearch}
          setListSearch={toolbarState.setListSearch}
          status={toolbarState.status}
          setStatus={toolbarState.setStatus}
          hasToolbarFilters={toolbarState.hasToolbarFilters}
          resetToolbar={toolbarState.resetToolbar}
          sticky
        />
      }
      tableSlot={
        <InvoiceClinicalListTable
          invoices={scopedInvoices}
          viewerRole="admin"
          isLoading={listBodyLoading}
          showToolbar={false}
          toolbarPlacement="external"
          toolbarState={toolbarState}
          emptyMessage="No invoices yet. Create your first invoice to track payments."
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
