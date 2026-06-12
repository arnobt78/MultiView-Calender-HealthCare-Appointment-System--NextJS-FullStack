"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Receipt } from "lucide-react";
import { useMemo, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { Invoice } from "@/hooks/usePayments";
import { InvoiceBillingStatsRow } from "@/components/shared/billing/InvoiceBillingStatsRow";
import { InvoicePortalListCard } from "@/components/shared/billing/InvoicePortalListCard";
import { InvoiceStatusCountInlineRow } from "@/components/shared/billing/InvoiceStatusCountInlineRow";
import { PortalPanelSection } from "@/components/shared/PortalPanelSection";
import { ClinicalListFilterToolbar } from "@/components/shared/filters/ClinicalListFilterToolbar";
import { FilterSelect } from "@/components/shared/filters/FilterSelect";
import { Skeleton } from "@/components/ui/skeleton";
import type { InvoiceBillingTotalsPayload } from "@/lib/invoice-billing-totals";
import { useCpListBodyLoading } from "@/lib/cp-list-body-loading";
import {
  organizationBillingPanelClass,
  organizationInvoiceHeaderStripClass,
  organizationInvoiceListItemShellClass,
} from "@/lib/organization-billing-panel-classes";
import { organizationDetailHref } from "@/lib/entity-routes";
import {
  ORGANIZATION_BILLING_SUBTITLE,
  organizationBillingSectionTitle,
} from "@/lib/organization-billing-display";
import {
  filterDoctorPortalInvoices,
  type DoctorPortalInvoiceStatusFilter,
} from "@/lib/invoice-list-display";
import { countDoctorPortalInvoicesByStatus } from "@/lib/doctor-portal-billing-display";
import {
  findFilterOptionLabel,
  invoiceStatusFilterOptions,
} from "@/lib/filter-select-option-presets";

const COMPACT_INVOICE_LIMIT = 3;

const STATUS_OPTIONS = invoiceStatusFilterOptions();

type OrgBillingDataProps = {
  organizationId: string;
  organizationName: string;
};

function useOrganizationBillingQueries(organizationId: string) {
  const queryClient = useQueryClient();
  const orgBillingQueryKey = queryKeys.invoices.byOrganization(organizationId);
  const orgTotalsQueryKey = queryKeys.invoices.byOrganizationTotals(organizationId);

  const invoicesInitialData = queryClient.getQueryData<{ invoices: Invoice[] }>(
    orgBillingQueryKey
  );
  const totalsInitialData = queryClient.getQueryData<InvoiceBillingTotalsPayload>(
    orgTotalsQueryKey
  );

  const { data, isLoading } = useQuery({
    queryKey: orgBillingQueryKey,
    queryFn: () =>
      apiClient<{ invoices: Invoice[] }>(
        `/api/invoices?organizationId=${encodeURIComponent(organizationId)}`
      ),
    initialData: invoicesInitialData,
    refetchOnMount: invoicesInitialData !== undefined ? false : true,
    staleTime: 30_000,
  });

  const { data: totalsData, isLoading: isTotalsLoading } = useQuery({
    queryKey: orgTotalsQueryKey,
    queryFn: () =>
      apiClient<InvoiceBillingTotalsPayload>(
        `/api/invoices/billing-totals?organizationId=${encodeURIComponent(organizationId)}`
      ),
    initialData: totalsInitialData,
    refetchOnMount: totalsInitialData !== undefined ? false : true,
    staleTime: 30_000,
  });

  const invoices = data?.invoices ?? [];
  const listBodyLoading = useCpListBodyLoading(orgBillingQueryKey, isLoading);
  const statsLoading = useCpListBodyLoading(orgTotalsQueryKey, isTotalsLoading);

  return {
    invoices,
    totals: totalsData?.totals,
    statusTotals: totalsData?.statusTotals,
    listBodyLoading,
    statsLoading,
  };
}

function OrganizationBillingInvoiceCards({
  invoices,
  limit,
}: {
  invoices: Invoice[];
  limit?: number;
}) {
  const slice = limit != null ? invoices.slice(0, limit) : invoices;
  return (
    <ul className="space-y-3">
      {slice.map((inv, index) => (
        <li key={inv.id} className="w-full min-w-0">
          <InvoicePortalListCard
            invoice={inv}
            viewerRole="admin"
            listIndex={index + 1}
            shellClassName={organizationInvoiceListItemShellClass}
            headerStripClassName={organizationInvoiceHeaderStripClass}
          />
        </li>
      ))}
    </ul>
  );
}

type OrganizationBillingPanelBodyProps = OrgBillingDataProps & {
  variant: "compact" | "full";
};

/** Shared billing body — KPI row, doctor-portal filter toolbar, invoice cards. */
function OrganizationBillingPanelBody({
  organizationId,
  organizationName,
  variant,
}: OrganizationBillingPanelBodyProps) {
  const { invoices, totals, statusTotals, listBodyLoading, statsLoading } =
    useOrganizationBillingQueries(organizationId);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DoctorPortalInvoiceStatusFilter>("all");

  const statusCounts = useMemo(
    () => countDoctorPortalInvoicesByStatus(invoices),
    [invoices]
  );

  const filtered = useMemo(
    () => filterDoctorPortalInvoices(invoices, { search, status: statusFilter }),
    [invoices, search, statusFilter]
  );

  const showReset = search.trim().length > 0 || statusFilter !== "all";
  const detailHref = organizationDetailHref("admin", organizationId);
  const listLimit = variant === "compact" ? COMPACT_INVOICE_LIMIT : undefined;
  const visibleInvoices =
    listLimit != null ? filtered.slice(0, listLimit) : filtered;

  const statusChip = useMemo(
    () => <InvoiceStatusCountInlineRow counts={statusCounts} />,
    [statusCounts]
  );

  return (
    <PortalPanelSection
      id={variant === "compact" ? "org-billing-compact-heading" : "org-billing-full-heading"}
      title={organizationBillingSectionTitle(organizationName)}
      subtitle={ORGANIZATION_BILLING_SUBTITLE}
      headerVariant="stacked"
      icon={Receipt}
      iconClassName="border-indigo-100 bg-indigo-50 [&_svg]:text-indigo-600"
      count={invoices.length}
      countSkeleton={listBodyLoading}
      statusChip={statusChip}
      statusChipSkeleton={listBodyLoading}
      className={organizationBillingPanelClass}
    >
      <InvoiceBillingStatsRow
        invoices={invoices}
        totals={totals}
        statusTotals={statusTotals}
        valueSkeleton={statsLoading}
      />

      <ClinicalListFilterToolbar
        search={{
          value: search,
          onChange: setSearch,
          placeholder: "Search invoices…",
          ariaLabel:
            variant === "compact"
              ? "Search organization invoices in list"
              : "Search organization invoices",
        }}
        showReset={showReset}
        onReset={() => {
          setSearch("");
          setStatusFilter("all");
        }}
        className="mb-3 mt-3"
      >
        <FilterSelect
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as DoctorPortalInvoiceStatusFilter)}
          displayLabel={findFilterOptionLabel(STATUS_OPTIONS, statusFilter, "All Statuses")}
          size="toolbar"
          triggerClassName="max-w-[200px]"
          ariaLabel="Filter invoices by status"
          options={STATUS_OPTIONS}
        />
      </ClinicalListFilterToolbar>

      {listBodyLoading ? (
        <ul className="space-y-2" aria-hidden>
          {Array.from({ length: variant === "compact" ? 2 : 3 }).map((_, i) => (
            <li
              key={i}
              className="rounded-xl border border-indigo-200/40 bg-indigo-50/20 px-3 py-3"
            >
              <Skeleton className="h-4 w-full max-w-md rounded" />
              {variant === "compact" ? (
                <Skeleton className="mt-2 h-3 w-full max-w-sm rounded" />
              ) : null}
            </li>
          ))}
        </ul>
      ) : visibleInvoices.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {invoices.length === 0
            ? "No invoices tagged for this organization."
            : "No invoices match your filters."}
        </p>
      ) : (
        <>
          <OrganizationBillingInvoiceCards invoices={visibleInvoices} />
          {variant === "compact" ? (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-muted-foreground">
              <span>
                Showing {visibleInvoices.length} of {filtered.length} matching
                {filtered.length !== invoices.length
                  ? ` (${invoices.length} total)`
                  : ""}{" "}
                invoices
              </span>
              {filtered.length > COMPACT_INVOICE_LIMIT || invoices.length > COMPACT_INVOICE_LIMIT ? (
                <Link
                  href={detailHref}
                  className="font-medium text-indigo-700 no-underline hover:text-indigo-500 flex items-center gap-1 transition-colors duration-300"
                >
                  <ArrowRight className="size-4" />
                  View All Billing
                </Link>
              ) : null}
            </div>
          ) : (
            <p className="pt-2 text-xs text-muted-foreground">
              {filtered.length} of {invoices.length} invoices
            </p>
          )}
        </>
      )}
    </PortalPanelSection>
  );
}

/** List footer — KPI + top 3 doctor-portal-style invoice cards + link to detail billing. */
export function OrganizationBillingPanelCompact(props: OrgBillingDataProps) {
  return <OrganizationBillingPanelBody {...props} variant="compact" />;
}

/** Detail page — full invoice list with status chips + search/filter (doctor portal parity). */
export function OrganizationBillingPanelFull(props: OrgBillingDataProps) {
  return <OrganizationBillingPanelBody {...props} variant="full" />;
}
