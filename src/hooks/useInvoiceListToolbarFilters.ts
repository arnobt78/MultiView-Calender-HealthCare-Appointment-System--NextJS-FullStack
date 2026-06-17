"use client";

import { useCallback, useMemo, useState } from "react";
import type { Invoice } from "@/hooks/usePayments";
import type { InvoiceStatusFilter } from "@/lib/invoice-management-filters";
import { filterInvoicesForToolbar } from "@/lib/invoice-entity-list-filters";

/** Shared search + status state for CP invoice list toolbar and embedded entity tables. */
export function useInvoiceListToolbarFilters(invoices: readonly Invoice[]) {
  const [listSearch, setListSearch] = useState("");
  const [status, setStatus] = useState<InvoiceStatusFilter>("all");

  const filteredInvoices = useMemo(
    () => filterInvoicesForToolbar(invoices, { status, search: listSearch }),
    [invoices, status, listSearch]
  );

  const hasToolbarFilters = status !== "all" || listSearch.trim().length > 0;

  const resetToolbar = useCallback(() => {
    setStatus("all");
    setListSearch("");
  }, []);

  return {
    listSearch,
    setListSearch,
    status,
    setStatus,
    filteredInvoices,
    hasToolbarFilters,
    resetToolbar,
  };
}

export type InvoiceListToolbarFilters = ReturnType<typeof useInvoiceListToolbarFilters>;
