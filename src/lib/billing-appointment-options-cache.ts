import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { InvoiceAppointmentOptionRow } from "@/lib/billing-types";

export type BillingAppointmentOptionsCache = {
  options: InvoiceAppointmentOptionRow[];
};

/** Seed picker list — key must match `useQuery` in InvoiceAppointmentPickerField. */
export function seedBillingAppointmentOptionsCache(
  queryClient: QueryClient,
  search: string,
  includeBilled: boolean,
  data: BillingAppointmentOptionsCache
): void {
  queryClient.setQueryData(
    queryKeys.billing.appointmentOptions(search, includeBilled),
    data
  );
}
