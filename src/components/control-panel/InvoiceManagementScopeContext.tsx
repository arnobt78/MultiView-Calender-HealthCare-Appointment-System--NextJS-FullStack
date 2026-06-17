"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Invoice } from "@/hooks/usePayments";
import { usePayments } from "@/hooks/usePayments";
import { useOrganization } from "@/hooks/useOrganization";
import { useUsers } from "@/hooks/useUsers";
import { useInvoiceScopedBilling } from "@/hooks/useInvoiceScopedBilling";
import { CP_DOCTOR_USERS_FILTERS } from "@/lib/control-panel-users-filters";
import { queryKeys } from "@/lib/query-keys";
import { useCpListBodyLoading } from "@/lib/cp-list-body-loading";
import {
  buildInvoiceManagementQueryString,
  invoiceManagementFilterKeyStable,
  parseInvoiceManagementScopeFromSearchParams,
  type InvoiceManagementFilterKey,
} from "@/lib/invoice-management-scope";
import type { User } from "@/types/types";
import type {
  InvoiceBillingStatusTotals,
  InvoiceBillingTotals,
} from "@/lib/invoice-billing-totals";

type Ctx = {
  filter: InvoiceManagementFilterKey;
  setScopeFilter: (next: InvoiceManagementFilterKey) => void;
  scopedInvoices: Invoice[];
  scopedTotals?: InvoiceBillingTotals;
  scopedStatusTotals?: InvoiceBillingStatusTotals;
  allInvoices: Invoice[];
  listBodyLoading: boolean;
  statsLoading: boolean;
  hasScopeFilters: boolean;
  resetScope: () => void;
  organizations: ReturnType<typeof useOrganization>["organizations"];
  organizationsLoading: boolean;
  doctors: User[];
  doctorsLoading: boolean;
  selectedOrganizationName: string | null;
  selectedDoctorDisplayName: string | null;
};

const InvoiceManagementScopeContext = createContext<Ctx | null>(null);

type ProviderProps = {
  children: ReactNode;
  viewerRole?: string | null;
};

export function InvoiceManagementScopeProvider({
  children,
  viewerRole = null,
}: ProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filter = useMemo(
    () =>
      invoiceManagementFilterKeyStable(
        parseInvoiceManagementScopeFromSearchParams(searchParams, viewerRole)
      ),
    [searchParams, viewerRole]
  );

  const syncUrl = useCallback(
    (next: InvoiceManagementFilterKey) => {
      const stable = invoiceManagementFilterKeyStable(next);
      const qs = buildInvoiceManagementQueryString(stable);
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  const setScopeFilter = useCallback(
    (next: InvoiceManagementFilterKey) => {
      syncUrl(invoiceManagementFilterKeyStable(next));
    },
    [syncUrl]
  );

  const resetScope = useCallback(() => {
    syncUrl({ scope: "all" });
  }, [syncUrl]);

  const { invoices: allInvoices, isLoading: allLoading } = usePayments();

  const {
    scopedInvoices: scopedListFromQuery,
    scopedTotals,
    scopedStatusTotals,
    listQueryKey,
    listLoading: scopedListLoading,
    statsLoading,
  } = useInvoiceScopedBilling(filter);

  const scopedInvoices =
    filter.scope === "all" ? allInvoices : scopedListFromQuery;

  const listBodyLoading = useCpListBodyLoading(
    filter.scope === "all" ? queryKeys.invoices.all : listQueryKey,
    filter.scope === "all" ? allLoading : scopedListLoading
  );

  const { organizations, isLoading: organizationsLoading } = useOrganization();
  const { data: doctorsData, isLoading: doctorsLoading } = useUsers(
    CP_DOCTOR_USERS_FILTERS
  );
  const doctors = useMemo(
    () => doctorsData?.users ?? [],
    [doctorsData?.users]
  );

  const selectedOrganizationName = useMemo(() => {
    if (filter.scope !== "org" || !filter.orgId) return null;
    return organizations.find((o) => o.id === filter.orgId)?.name ?? null;
  }, [filter, organizations]);

  const selectedDoctorDisplayName = useMemo(() => {
    if (filter.scope !== "doctor" || !filter.doctorId) return null;
    const doc = doctors.find((d) => d.id === filter.doctorId);
    return doc?.display_name?.trim() || doc?.email?.trim() || null;
  }, [filter, doctors]);

  const hasScopeFilters = filter.scope !== "all";

  const value = useMemo(
    (): Ctx => ({
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
    }),
    [
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
    ]
  );

  return (
    <InvoiceManagementScopeContext.Provider value={value}>
      {children}
    </InvoiceManagementScopeContext.Provider>
  );
}

export function useInvoiceManagementScope() {
  const ctx = useContext(InvoiceManagementScopeContext);
  if (!ctx) {
    throw new Error(
      "useInvoiceManagementScope must be used within InvoiceManagementScopeProvider"
    );
  }
  return ctx;
}
