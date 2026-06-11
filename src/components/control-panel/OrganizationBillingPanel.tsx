"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ListFilter, Receipt } from "lucide-react";
import { useMemo, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { Invoice } from "@/hooks/usePayments";
import { InvoiceBillingStatsRow } from "@/components/shared/billing/InvoiceBillingStatsRow";
import { InvoicePortalListCard } from "@/components/shared/billing/InvoicePortalListCard";
import { InvoiceStatusCountInlineRow } from "@/components/shared/billing/InvoiceStatusCountInlineRow";
import { PortalPanelCountBadge } from "@/components/shared/PortalPanelCountBadge";
import { ClinicalListFilterToolbar } from "@/components/shared/filters/ClinicalListFilterToolbar";
import { FilterSelect } from "@/components/shared/filters/FilterSelect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { InvoiceBillingTotalsPayload } from "@/lib/invoice-billing-totals";
import { useCpListBodyLoading } from "@/lib/cp-list-body-loading";
import {
  organizationBillingPanelShellClass,
  organizationInvoiceHeaderStripClass,
  organizationInvoiceListItemShellClass,
} from "@/lib/organization-billing-panel-classes";
import { organizationDetailHref } from "@/lib/entity-routes";
import {
  filterDoctorPortalInvoices,
  type DoctorPortalInvoiceStatusFilter,
} from "@/lib/invoice-list-display";
import { countDoctorPortalInvoicesByStatus } from "@/lib/doctor-portal-billing-display";

const COMPACT_INVOICE_LIMIT = 3;

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
      {slice.map((inv) => (
        <li key={inv.id} className="w-full min-w-0">
          <InvoicePortalListCard
            invoice={inv}
            viewerRole="admin"
            shellClassName={organizationInvoiceListItemShellClass}
            headerStripClassName={organizationInvoiceHeaderStripClass}
          />
        </li>
      ))}
    </ul>
  );
}

/** List footer — KPI + top 3 doctor-portal-style invoice cards + link to detail billing. */
export function OrganizationBillingPanelCompact({
  organizationId,
  organizationName,
}: OrgBillingDataProps) {
  const { invoices, totals, statusTotals, listBodyLoading, statsLoading } =
    useOrganizationBillingQueries(organizationId);
  const detailHref = organizationDetailHref("admin", organizationId);

  return (
    <Card className={cn(organizationBillingPanelShellClass, "border-indigo-200/40")}>
      <CardHeader className="space-y-3 pb-2">
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          <Receipt className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden />
          <span>Billing — {organizationName}</span>
          {!listBodyLoading ? (
            <PortalPanelCountBadge>
              {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
            </PortalPanelCountBadge>
          ) : (
            <Skeleton className="h-5 w-20 rounded-full" />
          )}
        </CardTitle>
        <InvoiceBillingStatsRow
          invoices={invoices}
          totals={totals}
          statusTotals={statusTotals}
          valueSkeleton={statsLoading}
        />
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {listBodyLoading ? (
          <ul className="space-y-2" aria-hidden>
            {Array.from({ length: 2 }).map((_, i) => (
              <li
                key={i}
                className="rounded-xl border border-indigo-200/40 bg-indigo-50/20 px-3 py-3"
              >
                <Skeleton className="h-4 w-full max-w-md rounded" />
                <Skeleton className="mt-2 h-3 w-full max-w-sm rounded" />
              </li>
            ))}
          </ul>
        ) : invoices.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No invoices tagged for this organization.
          </p>
        ) : (
          <>
            <OrganizationBillingInvoiceCards
              invoices={invoices}
              limit={COMPACT_INVOICE_LIMIT}
            />
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-indigo-100/80 pt-2 text-xs text-muted-foreground">
              <span>
                Showing {Math.min(invoices.length, COMPACT_INVOICE_LIMIT)} of{" "}
                {invoices.length} invoices
              </span>
              {invoices.length > COMPACT_INVOICE_LIMIT ? (
                <Link
                  href={detailHref}
                  className="font-medium text-indigo-700 no-underline hover:underline"
                >
                  View all billing
                </Link>
              ) : null}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

const STATUS_OPTIONS: { value: DoctorPortalInvoiceStatusFilter; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

/** Detail page — full invoice list with status chips + search/filter (doctor portal parity). */
export function OrganizationBillingPanelFull({
  organizationId,
  organizationName,
}: OrgBillingDataProps) {
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

  return (
    <Card className={cn(organizationBillingPanelShellClass, "border-indigo-200/40")}>
      <CardHeader className="space-y-3 pb-2">
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          <Receipt className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden />
          <span>Billing — {organizationName}</span>
          {!listBodyLoading ? (
            <PortalPanelCountBadge>
              {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
            </PortalPanelCountBadge>
          ) : (
            <Skeleton className="h-5 w-20 rounded-full" />
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Invoices tagged to this organisation — counts by payment status.
        </p>
        <InvoiceStatusCountInlineRow counts={statusCounts} />
        <InvoiceBillingStatsRow
          invoices={invoices}
          totals={totals}
          statusTotals={statusTotals}
          valueSkeleton={statsLoading}
        />
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <ClinicalListFilterToolbar
          search={{
            value: search,
            onChange: setSearch,
            placeholder: "Search invoices…",
            ariaLabel: "Search organization invoices",
          }}
          showReset={showReset}
          onReset={() => {
            setSearch("");
            setStatusFilter("all");
          }}
        >
          <FilterSelect
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as DoctorPortalInvoiceStatusFilter)}
            displayLabel={
              STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label ?? "All Statuses"
            }
            icon={ListFilter}
            size="toolbar"
            triggerClassName="max-w-[200px]"
            ariaLabel="Filter invoices by status"
            options={STATUS_OPTIONS}
          />
        </ClinicalListFilterToolbar>

        {listBodyLoading ? (
          <ul className="space-y-2" aria-hidden>
            {Array.from({ length: 3 }).map((_, i) => (
              <li
                key={i}
                className="rounded-xl border border-indigo-200/40 bg-indigo-50/20 px-3 py-3"
              >
                <Skeleton className="h-4 w-full max-w-md rounded" />
              </li>
            ))}
          </ul>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {invoices.length === 0
              ? "No invoices tagged for this organization."
              : "No invoices match your filters."}
          </p>
        ) : (
          <>
            <OrganizationBillingInvoiceCards invoices={filtered} />
            <p className="border-t border-indigo-100/80 pt-2 text-xs text-muted-foreground">
              {filtered.length} of {invoices.length} invoices
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
