"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { InvoiceAppointmentOptionRow } from "@/lib/billing-types";

type Options = {
  /** Admin-only: include visits with blocking invoices. */
  includeBilled?: boolean;
  enabled?: boolean;
};

/**
 * Load a single visit row for invoice preset create — UUID search on appointment-options API.
 * Cache key matches InvoiceAppointmentPickerField for SSR seed + invalidation parity.
 */
export function useBillingAppointmentOptionById(
  appointmentId: string | null | undefined,
  options?: Options
) {
  const includeBilled = Boolean(options?.includeBilled);
  const id = appointmentId?.trim() ?? "";
  const enabled = (options?.enabled ?? true) && id.length > 0;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.billing.appointmentOptions(id, includeBilled),
    queryFn: async () => {
      const params = new URLSearchParams({ search: id });
      if (includeBilled) params.set("includeBilled", "1");
      return apiClient<{ options: InvoiceAppointmentOptionRow[] }>(
        `/api/billing/appointment-options?${params.toString()}`
      );
    },
    enabled,
    staleTime: 20_000,
  });

  const option = useMemo(
    () => data?.options.find((o) => o.id === id) ?? data?.options[0] ?? null,
    [data?.options, id]
  );

  return { option, isLoading, isError, error };
}
