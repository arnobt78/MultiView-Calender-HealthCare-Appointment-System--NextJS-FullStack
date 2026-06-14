"use client";

import { useMemo, useState } from "react";
import { Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePayments, type Invoice } from "@/hooks/usePayments";
import { PortalPanelSection } from "@/components/shared/PortalPanelSection";
import { DoctorPortalInvoiceListRow } from "@/components/shared/billing/DoctorPortalInvoiceListRow";
import { ClinicalListFilterToolbar } from "@/components/shared/filters/ClinicalListFilterToolbar";
import { FilterSelect } from "@/components/shared/filters/FilterSelect";
import { Skeleton } from "@/components/ui/skeleton";
import { doctorPortalBillingPanelClass } from "@/lib/doctor-portal-layout";
import { InvoiceStatusCountInlineRow } from "@/components/shared/billing/InvoiceStatusCountInlineRow";
import {
  countDoctorPortalInvoicesByStatus,
  doctorPortalBillingSectionTitle,
  DOCTOR_PORTAL_BILLING_SHOW_MANUAL_CREATE,
  DOCTOR_PORTAL_BILLING_SUBTITLE,
} from "@/lib/doctor-portal-billing-display";
import { useInvoiceFormDialog } from "@/context/InvoiceFormDialogContext";
import { billingCreateInvoiceTriggerDoctor } from "@/lib/billing-ui-presets";
import {
  filterDoctorPortalInvoices,
  type DoctorPortalInvoiceStatusFilter,
} from "@/lib/invoice-list-display";
import { queryKeys } from "@/lib/query-keys";
import { useQueryBodyLoading } from "@/lib/query-body-loading";
import {
  findFilterOptionLabel,
  invoiceStatusFilterOptions,
} from "@/lib/filter-select-option-presets";

const CreateDraftIcon = billingCreateInvoiceTriggerDoctor.triggerIcon;

type Props = {
  /** Signed-in doctor display name — drives possessive panel title. */
  doctorDisplayName?: string | null;
  /** Pulse list + filters only — panel chrome stays mounted. */
  listBodyLoading?: boolean;
  /** SSR seed — pairs with DoctorPortalPage sync cache seed; skips mount refetch in usePayments. */
  invoicesInitialData?: Invoice[];
  /** Signed-in doctor id — issuer-only mutate actions in row menu. */
  sessionUserId?: string;
};

const STATUS_OPTIONS = invoiceStatusFilterOptions();

/**
 * Doctor-scoped invoices — same stacked header as Weekly Hours / visit types:
 * one title row: name · count · status chip (Today KPI); muted subtitle below.
 */
export function DoctorPortalInvoicesCard({
  doctorDisplayName,
  listBodyLoading,
  invoicesInitialData,
  sessionUserId,
}: Props) {
  const {
    invoices,
    isLoading,
    updateInvoice,
    deleteInvoiceAsync,
    isUpdating,
    isDeleting,
  } = usePayments({ invoicesInitialData });

  const { openCreate, openEdit } = useInvoiceFormDialog();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DoctorPortalInvoiceStatusFilter>("all");

  const cacheBodyLoading = useQueryBodyLoading(queryKeys.invoices.all, isLoading);
  const listLoading = listBodyLoading || cacheBodyLoading;
  const statusCounts = useMemo(
    () => countDoctorPortalInvoicesByStatus(invoices),
    [invoices]
  );

  const filtered = useMemo(
    () => filterDoctorPortalInvoices(invoices, { search, status: statusFilter }),
    [invoices, search, statusFilter]
  );

  const statusChip = useMemo(
    () => <InvoiceStatusCountInlineRow counts={statusCounts} />,
    [statusCounts]
  );

  const showReset = search.trim().length > 0 || statusFilter !== "all";

  return (
    <>
      <PortalPanelSection
        id="dp-invoices-heading"
        title={doctorPortalBillingSectionTitle(doctorDisplayName)}
        subtitle={DOCTOR_PORTAL_BILLING_SUBTITLE}
        headerVariant="stacked"
        icon={Receipt}
        iconClassName="border-sky-100 bg-sky-50 [&_svg]:text-sky-600"
        count={invoices.length}
        countSkeleton={listLoading}
        statusChip={statusChip}
        statusChipSkeleton={listLoading}
        className={doctorPortalBillingPanelClass}
        headerActions={
          DOCTOR_PORTAL_BILLING_SHOW_MANUAL_CREATE ? (
            <Button
              type="button"
              size="sm"
              className={billingCreateInvoiceTriggerDoctor.triggerClassName}
              onClick={openCreate}
            >
              <CreateDraftIcon className="h-4 w-4" aria-hidden />{" "}
              {billingCreateInvoiceTriggerDoctor.triggerLabel}
            </Button>
          ) : undefined
        }
      >
        <ClinicalListFilterToolbar
          search={{
            value: search,
            onChange: setSearch,
            placeholder: "Search invoices…",
            ariaLabel: "Search invoices",
          }}
          showReset={showReset}
          onReset={() => {
            setSearch("");
            setStatusFilter("all");
          }}
          className="mb-3"
        >
          <FilterSelect
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as DoctorPortalInvoiceStatusFilter)}
            displayLabel={findFilterOptionLabel(STATUS_OPTIONS, statusFilter, "All Statuses")}
            size="toolbar"
            options={STATUS_OPTIONS}
            ariaLabel="Filter by invoice status"
          />
        </ClinicalListFilterToolbar>

        {listLoading ? (
          <ul className="space-y-3" aria-hidden>
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i}>
                <Skeleton className="h-24 w-full rounded-xl" />
              </li>
            ))}
          </ul>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {invoices.length === 0 ? "No invoices yet." : "No invoices match your filters."}
          </p>
        ) : (
          <ul className="space-y-3">
            {filtered.slice(0, 12).map((inv, index) => (
              <DoctorPortalInvoiceListRow
                key={inv.id}
                invoice={inv}
                listIndex={index + 1}
                viewerUserId={sessionUserId}
                onEdit={openEdit}
                onSend={(id) => updateInvoice({ invoiceId: id, body: { status: "sent" } })}
                onDelete={async (id) => {
                  await deleteInvoiceAsync(id);
                }}
                isUpdating={isUpdating}
                isDeleting={isDeleting}
              />
            ))}
          </ul>
        )}
      </PortalPanelSection>
    </>
  );
}
