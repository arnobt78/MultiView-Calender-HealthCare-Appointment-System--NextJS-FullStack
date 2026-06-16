/**
 * SSR prefetch for `/telehealth-queue` — same appointments bundle as CP telehealth tab
 * plus doctors directory (identity rows) and invoices.all (visit-meta billing badges).
 */

import type { QueryClient } from "@tanstack/react-query";
import type { Invoice } from "@/hooks/usePayments";
import {
  prefetchCalendarAppointmentsBundle,
  prefetchDoctors,
  prefetchInvoices,
  type CalendarAppointmentsPrefetchBundle,
} from "@/lib/server-prefetch";
import { seedControlPanelSectionCacheFromSsr } from "@/lib/cp-list-query-ssr-seed";

export type TelehealthQueuePortalPrefetch = CalendarAppointmentsPrefetchBundle & {
  doctorsDirectory: Awaited<ReturnType<typeof prefetchDoctors>>;
  /** Viewer-scoped invoice list — seeds queryKeys.invoices.all before badge row mounts. */
  invoices: Invoice[] | null;
};

/** Parallel SSR — appointments bundle + doctors + invoices (no serial blocking). */
export async function prefetchTelehealthQueuePortal(
  userId: string,
  email: string,
  role: string | null
): Promise<TelehealthQueuePortalPrefetch> {
  const [bundle, doctorsDirectory, invoices] = await Promise.all([
    prefetchCalendarAppointmentsBundle(userId, email),
    prefetchDoctors(),
    prefetchInvoices(userId, role, email),
  ]);

  return {
    ...bundle,
    doctorsDirectory,
    invoices,
  };
}

/**
 * Seed TanStack before portal telehealth queue client hooks subscribe.
 * Reuses CP section seeder — same keys as telehealth tab prefetch.
 */
export function seedTelehealthQueuePortalCacheFromSsr(
  queryClient: QueryClient,
  initial: TelehealthQueuePortalPrefetch | null | undefined
): void {
  if (initial == null) return;
  seedControlPanelSectionCacheFromSsr(queryClient, {
    appointments: initial.appointments,
    patients: initial.patients,
    categories: initial.categories,
    assignees: initial.assignees,
    dashboardAccessAccepted: initial.dashboardAccessAccepted,
    doctorsDirectory: initial.doctorsDirectory,
    invoices: initial.invoices,
  });
}
