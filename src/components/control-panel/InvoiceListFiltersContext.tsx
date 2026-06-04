"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Invoice } from "@/hooks/usePayments";
import { resolveInvoiceDisplayStatus } from "@/lib/billing-appointment-eligibility";

export type InvoiceStatusFilter =
  | "all"
  | "draft"
  | "sent"
  | "paid"
  | "overdue"
  | "cancelled"
  | "refunded";

type Ctx = {
  status: InvoiceStatusFilter;
  setStatus: (s: InvoiceStatusFilter) => void;
  filterInvoices: (list: Invoice[]) => Invoice[];
};

const InvoiceListFiltersContext = createContext<Ctx | null>(null);

export function InvoiceListFiltersProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<InvoiceStatusFilter>("all");

  const filterInvoices = useCallback(
    (list: Invoice[]) => {
      if (status === "all") return list;
      return list.filter((inv) => resolveInvoiceDisplayStatus(inv) === status);
    },
    [status]
  );

  const value = useMemo(
    () => ({ status, setStatus, filterInvoices }),
    [status, filterInvoices]
  );

  return (
    <InvoiceListFiltersContext.Provider value={value}>
      {children}
    </InvoiceListFiltersContext.Provider>
  );
}

export function useInvoiceListFilters() {
  const ctx = useContext(InvoiceListFiltersContext);
  if (!ctx) {
    throw new Error("useInvoiceListFilters must be used within InvoiceListFiltersProvider");
  }
  return ctx;
}
