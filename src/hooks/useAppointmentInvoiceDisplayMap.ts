"use client";

import { useMemo } from "react";
import { usePayments } from "@/hooks/usePayments";
import {
  resolveInvoiceDisplayStatus,
  type InvoiceDisplayStatus,
} from "@/lib/billing-appointment-eligibility";

/**
 * Client-side map appointmentId → invoice display status from cached invoice list.
 * Avoids extra API when invoices.all is already seeded (portals / CP).
 */
export function useAppointmentInvoiceDisplayMap(
  appointmentIds: string[]
): Map<string, InvoiceDisplayStatus> {
  const { invoices } = usePayments();
  const stableKey = useMemo(
    () => [...new Set(appointmentIds)].sort().join(","),
    [appointmentIds]
  );

  return useMemo(() => {
    const map = new Map<string, InvoiceDisplayStatus>();
    if (!stableKey) return map;
    const idSet = new Set(stableKey.split(",").filter(Boolean));
    for (const inv of invoices) {
      const aid = inv.appointment_id;
      if (!aid || !idSet.has(aid) || map.has(aid)) continue;
      map.set(aid, resolveInvoiceDisplayStatus(inv));
    }
    return map;
  }, [invoices, stableKey]);
}
