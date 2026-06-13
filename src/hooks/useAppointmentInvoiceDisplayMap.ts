"use client";

import { useMemo } from "react";
import { usePayments } from "@/hooks/usePayments";
import { buildAppointmentInvoiceDisplayMap } from "@/lib/appointment-invoice-lookup";
import type { InvoiceDisplayStatus } from "@/lib/billing-appointment-eligibility";

/**
 * Client-side map appointmentId → invoice display status from cached invoice list.
 * Map logic lives in `buildAppointmentInvoiceDisplayMap` (shared with tests + SSR paths).
 */
export function useAppointmentInvoiceDisplayMap(
  appointmentIds: string[]
): Map<string, InvoiceDisplayStatus> {
  const { invoices } = usePayments();
  const idsKey = useMemo(
    () => [...new Set(appointmentIds.filter(Boolean))].sort().join(","),
    [appointmentIds]
  );

  return useMemo(() => {
    if (!idsKey) return new Map<string, InvoiceDisplayStatus>();
    return buildAppointmentInvoiceDisplayMap(invoices, idsKey.split(","));
  }, [invoices, idsKey]);
}
