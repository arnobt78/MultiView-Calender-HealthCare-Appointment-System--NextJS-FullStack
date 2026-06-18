"use client";

/**
 * Scoped invoice list + KPI totals for CP invoice hub (all / org / doctor scope).
 * Cache keys: queryKeys.invoices.all + viewerTotals | byOrganization | byDoctor (+ totals).
 */

import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Invoice } from "@/hooks/usePayments";
import { queryKeys } from "@/lib/query-keys";
import {
  fetchInvoiceBillingTotalsClient,
  fetchInvoicesListClient,
  INVOICES_LIST_STALE_MS,
} from "@/lib/invoices-list-client";
import type { InvoiceBillingTotalsPayload } from "@/lib/invoice-billing-totals";
import type { InvoiceManagementFilterKey } from "@/lib/invoice-management-scope";
import { EMPTY_INVOICES } from "@/lib/stable-query-fallbacks";

type ScopedListCache = { invoices: Invoice[] };

export function useInvoiceScopedBilling(filter: InvoiceManagementFilterKey) {
  const queryClient = useQueryClient();

  const orgId = filter.scope === "org" ? filter.orgId : undefined;
  const doctorId = filter.scope === "doctor" ? filter.doctorId : undefined;

  const orgListKey = orgId != null ? queryKeys.invoices.byOrganization(orgId) : null;
  const orgTotalsKey =
    orgId != null ? queryKeys.invoices.byOrganizationTotals(orgId) : null;
  const doctorListKey = doctorId != null ? queryKeys.invoices.byDoctor(doctorId) : null;
  const doctorTotalsKey =
    doctorId != null ? queryKeys.invoices.byDoctorTotals(doctorId) : null;
  const viewerTotalsKey = queryKeys.invoices.viewerTotals;

  const orgListInitial = orgListKey
    ? queryClient.getQueryData<ScopedListCache>(orgListKey)
    : undefined;
  const orgTotalsInitial = orgTotalsKey
    ? queryClient.getQueryData<InvoiceBillingTotalsPayload>(orgTotalsKey)
    : undefined;
  const doctorListInitial = doctorListKey
    ? queryClient.getQueryData<ScopedListCache>(doctorListKey)
    : undefined;
  const doctorTotalsInitial = doctorTotalsKey
    ? queryClient.getQueryData<InvoiceBillingTotalsPayload>(doctorTotalsKey)
    : undefined;
  const viewerTotalsInitial = queryClient.getQueryData<InvoiceBillingTotalsPayload>(
    viewerTotalsKey
  );

  const orgListQuery = useQuery({
    queryKey: orgListKey ?? ["app", "invoices", "org", "disabled"],
    queryFn: async () => {
      const invoices = await fetchInvoicesListClient({ organizationId: orgId! });
      return { invoices };
    },
    initialData: orgListInitial,
    enabled: filter.scope === "org" && orgId != null,
    staleTime: INVOICES_LIST_STALE_MS,
    refetchOnMount: orgListInitial !== undefined ? false : true,
  });

  const orgTotalsQuery = useQuery({
    queryKey: orgTotalsKey ?? ["app", "invoices", "org", "totals", "disabled"],
    queryFn: () => fetchInvoiceBillingTotalsClient({ organizationId: orgId! }),
    initialData: orgTotalsInitial,
    enabled: filter.scope === "org" && orgId != null,
    staleTime: INVOICES_LIST_STALE_MS,
    refetchOnMount: orgTotalsInitial !== undefined ? false : true,
  });

  const doctorListQuery = useQuery({
    queryKey: doctorListKey ?? ["app", "invoices", "doctor", "disabled"],
    queryFn: async () => {
      const invoices = await fetchInvoicesListClient({ doctorId: doctorId! });
      return { invoices };
    },
    initialData: doctorListInitial,
    enabled: filter.scope === "doctor" && doctorId != null,
    staleTime: INVOICES_LIST_STALE_MS,
    refetchOnMount: doctorListInitial !== undefined ? false : true,
  });

  const doctorTotalsQuery = useQuery({
    queryKey: doctorTotalsKey ?? ["app", "invoices", "doctor", "totals", "disabled"],
    queryFn: () => fetchInvoiceBillingTotalsClient({ doctorId: doctorId! }),
    initialData: doctorTotalsInitial,
    enabled: filter.scope === "doctor" && doctorId != null,
    staleTime: INVOICES_LIST_STALE_MS,
    refetchOnMount: doctorTotalsInitial !== undefined ? false : true,
  });

  const viewerTotalsQuery = useQuery({
    queryKey: viewerTotalsKey,
    queryFn: () => fetchInvoiceBillingTotalsClient(),
    initialData: viewerTotalsInitial,
    enabled: filter.scope === "all",
    staleTime: INVOICES_LIST_STALE_MS,
    refetchOnMount: viewerTotalsInitial !== undefined ? false : true,
  });

  const scopedInvoices = useMemo(() => {
    if (filter.scope === "org") {
      return orgListQuery.data?.invoices ?? EMPTY_INVOICES;
    }
    if (filter.scope === "doctor") {
      return doctorListQuery.data?.invoices ?? EMPTY_INVOICES;
    }
    return EMPTY_INVOICES;
  }, [filter.scope, orgListQuery.data?.invoices, doctorListQuery.data?.invoices]);

  const scopedTotals =
    filter.scope === "org"
      ? orgTotalsQuery.data?.totals
      : filter.scope === "doctor"
        ? doctorTotalsQuery.data?.totals
        : viewerTotalsQuery.data?.totals;

  const scopedStatusTotals =
    filter.scope === "org"
      ? orgTotalsQuery.data?.statusTotals
      : filter.scope === "doctor"
        ? doctorTotalsQuery.data?.statusTotals
        : viewerTotalsQuery.data?.statusTotals;

  const listQueryKey =
    filter.scope === "org" && orgListKey
      ? orgListKey
      : filter.scope === "doctor" && doctorListKey
        ? doctorListKey
        : queryKeys.invoices.all;

  const listLoading =
    filter.scope === "org"
      ? orgListQuery.isLoading
      : filter.scope === "doctor"
        ? doctorListQuery.isLoading
        : false;

  const statsLoading =
    filter.scope === "org"
      ? orgTotalsQuery.isLoading
      : filter.scope === "doctor"
        ? doctorTotalsQuery.isLoading
        : viewerTotalsQuery.isLoading;

  return {
    scopedInvoices,
    scopedTotals,
    scopedStatusTotals,
    listQueryKey,
    listLoading,
    statsLoading,
  };
}
