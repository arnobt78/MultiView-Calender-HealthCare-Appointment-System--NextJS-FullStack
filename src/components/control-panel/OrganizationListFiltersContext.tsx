"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Organization } from "@/hooks/useOrganization";

export type OrganizationRoleFilter = "all" | "admin" | "doctor" | "patient";

export type OrganizationMemberSizeFilter = "all" | "solo" | "small" | "large";

export type OrganizationInvoiceFilter = "all" | "has_invoices" | "outstanding" | "none";

type Ctx = {
  roleFilter: OrganizationRoleFilter;
  setRoleFilter: (r: OrganizationRoleFilter) => void;
  memberSizeFilter: OrganizationMemberSizeFilter;
  setMemberSizeFilter: (s: OrganizationMemberSizeFilter) => void;
  invoiceFilter: OrganizationInvoiceFilter;
  setInvoiceFilter: (f: OrganizationInvoiceFilter) => void;
  filterOrganizations: (list: Organization[]) => Organization[];
};

const OrganizationListFiltersContext = createContext<Ctx | null>(null);

export function OrganizationListFiltersProvider({ children }: { children: ReactNode }) {
  const [roleFilter, setRoleFilter] = useState<OrganizationRoleFilter>("all");
  const [memberSizeFilter, setMemberSizeFilter] =
    useState<OrganizationMemberSizeFilter>("all");
  const [invoiceFilter, setInvoiceFilter] = useState<OrganizationInvoiceFilter>("all");

  const filterOrganizations = useCallback(
    (list: Organization[]) => {
      let out = list;
      if (roleFilter !== "all") {
        out = out.filter((o) => o.role === roleFilter);
      }
      if (memberSizeFilter === "solo") {
        out = out.filter((o) => o.member_count <= 1);
      } else if (memberSizeFilter === "small") {
        out = out.filter((o) => o.member_count >= 2 && o.member_count <= 5);
      } else if (memberSizeFilter === "large") {
        out = out.filter((o) => o.member_count > 5);
      }
      if (invoiceFilter === "has_invoices") {
        out = out.filter((o) => o.invoice_count > 0);
      } else if (invoiceFilter === "outstanding") {
        out = out.filter((o) => o.outstanding_cents > 0);
      } else if (invoiceFilter === "none") {
        out = out.filter((o) => o.invoice_count === 0);
      }
      return out;
    },
    [roleFilter, memberSizeFilter, invoiceFilter]
  );

  const value = useMemo(
    () => ({
      roleFilter,
      setRoleFilter,
      memberSizeFilter,
      setMemberSizeFilter,
      invoiceFilter,
      setInvoiceFilter,
      filterOrganizations,
    }),
    [roleFilter, memberSizeFilter, invoiceFilter, filterOrganizations]
  );

  return (
    <OrganizationListFiltersContext.Provider value={value}>
      {children}
    </OrganizationListFiltersContext.Provider>
  );
}

export function useOrganizationListFilters() {
  const ctx = useContext(OrganizationListFiltersContext);
  if (!ctx) {
    throw new Error("useOrganizationListFilters requires OrganizationListFiltersProvider");
  }
  return ctx;
}
