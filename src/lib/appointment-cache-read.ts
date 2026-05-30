/**
 * Read appointment FK ids from TanStack list cache — single source for invalidation resolvers
 * and query-client helpers (no circular imports with query-client).
 */
import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

/** Appointment rows in cache — `patient` / `category` are FK ids on serialized JSON. */
export type CachedAppointmentRow = {
  id: string;
  patient?: string | null;
  category?: string | null;
};

/** Resolve patient UUID from the appointments list cache (no extra fetch). */
export function getPatientIdFromAppointmentCache(
  queryClient: QueryClient,
  appointmentId: string | null | undefined
): string | undefined {
  if (!appointmentId) return undefined;
  const data = queryClient.getQueryData<CachedAppointmentRow[]>(queryKeys.appointments.all);
  return data?.find((a) => a.id === appointmentId)?.patient ?? undefined;
}

/** Resolve category UUID from the appointments list cache (no extra fetch). */
export function getCategoryIdFromAppointmentCache(
  queryClient: QueryClient,
  appointmentId: string | null | undefined
): string | undefined {
  if (!appointmentId) return undefined;
  const data = queryClient.getQueryData<CachedAppointmentRow[]>(queryKeys.appointments.all);
  return data?.find((a) => a.id === appointmentId)?.category ?? undefined;
}
