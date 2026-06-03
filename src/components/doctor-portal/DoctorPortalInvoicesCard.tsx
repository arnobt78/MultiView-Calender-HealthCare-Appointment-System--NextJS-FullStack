"use client";

import { useMemo, useState, useEffect } from "react";
import { ListFilter, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePayments, type Invoice } from "@/hooks/usePayments";
import { PortalPanelSection } from "@/components/shared/PortalPanelSection";
import { DoctorPortalInvoiceListRow } from "@/components/shared/billing/DoctorPortalInvoiceListRow";
import { ClinicalListFilterToolbar } from "@/components/shared/filters/ClinicalListFilterToolbar";
import { FilterSelect } from "@/components/shared/filters/FilterSelect";
import { Skeleton } from "@/components/ui/skeleton";
import { doctorPortalBillingPanelClass } from "@/lib/doctor-portal-layout";
import {
  countDoctorPortalInvoicesByStatus,
  doctorPortalBillingSectionTitle,
  doctorPortalInvoiceStatusBadgeLabel,
  DOCTOR_PORTAL_BILLING_SHOW_MANUAL_CREATE,
  DOCTOR_PORTAL_BILLING_SUBTITLE,
} from "@/lib/doctor-portal-billing-display";
import { useInvoiceFormDialog } from "@/context/InvoiceFormDialogContext";
import { billingCreateInvoiceTriggerDoctor } from "@/lib/billing-ui-presets";
import {
  filterDoctorPortalInvoices,
  type DoctorPortalInvoiceStatusFilter,
} from "@/lib/invoice-list-display";

const CreateDraftIcon = billingCreateInvoiceTriggerDoctor.triggerIcon;

type Props = {
  /** Signed-in doctor display name — drives possessive panel title. */
  doctorDisplayName?: string | null;
  /** Pulse list + filters only — panel chrome stays mounted. */
  listBodyLoading?: boolean;
};

const STATUS_OPTIONS: { value: DoctorPortalInvoiceStatusFilter; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

/**
 * Doctor-scoped invoices — same stacked header as Weekly Hours / visit types:
 * one title row: name · count · status chip (Today KPI); muted subtitle below.
 */
export function DoctorPortalInvoicesCard({
  doctorDisplayName,
  listBodyLoading,
}: Props) {
  const {
    invoices,
    isLoading,
    updateInvoice,
    deleteInvoice,
    isUpdating,
  } = usePayments();

  const { openCreate, openEdit } = useInvoiceFormDialog();

  const [isMounted, setIsMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DoctorPortalInvoiceStatusFilter>("all");

  useEffect(() => {
    requestAnimationFrame(() => setIsMounted(true));
  }, []);

  const listLoading = listBodyLoading || !isMounted || isLoading;
  const statusCounts = useMemo(
    () => countDoctorPortalInvoicesByStatus(invoices),
    [invoices]
  );

  const filtered = useMemo(
    () => filterDoctorPortalInvoices(invoices, { search, status: statusFilter }),
    [invoices, search, statusFilter]
  );

  const statusChip = useMemo(
    () => doctorPortalInvoiceStatusBadgeLabel(statusCounts),
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
            displayLabel={
              STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label ?? "All Statuses"
            }
            icon={ListFilter}
            size="toolbar"
            options={STATUS_OPTIONS}
            ariaLabel="Filter by invoice status"
          />
        </ClinicalListFilterToolbar>

        {listLoading ? (
          <ul className="divide-y divide-border/40" aria-hidden>
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="border-b border-border/40 py-2 last:border-0">
                <Skeleton className="h-4 w-3/4 max-w-md rounded" />
                <Skeleton className="mt-1 h-3 w-1/2 rounded" />
                <Skeleton className="mt-1 h-3 w-2/3 rounded" />
              </li>
            ))}
          </ul>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {invoices.length === 0 ? "No invoices yet." : "No invoices match your filters."}
          </p>
        ) : (
          <ul className="divide-y divide-border/40">
            {filtered.slice(0, 12).map((inv) => (
              <DoctorPortalInvoiceListRow
                key={inv.id}
                invoice={inv}
                onEdit={openEdit}
                onSend={(id) => updateInvoice({ invoiceId: id, body: { status: "sent" } })}
                onDelete={deleteInvoice}
                isUpdating={isUpdating}
              />
            ))}
          </ul>
        )}
      </PortalPanelSection>
    </>
  );
}
