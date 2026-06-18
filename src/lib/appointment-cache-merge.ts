/**
 * Cache-first appointment writes — merge list + detail from mutation payloads before
 * selective background sync (mirrors `billing-invoice-map.ts` for invoices).
 *
 * - enrichAppointmentToFullRow — preserve assignees/portal denorm from warm list cache
 * - mergeAppointmentIntoAllCaches — synchronous paint on current tab
 * - syncAfterAppointmentWrite — merge/remove → syncAppointmentsAfterWrite → cross-tab
 */
import type { QueryClient } from "@tanstack/react-query";
import type { FullAppointment } from "@/hooks/useAppointments";
import type { AppointmentDetailApiPayload, AppointmentWritePayload } from "@/lib/appointment-detail-api";
import type { AppointmentDetailViewModel } from "@/lib/appointment-detail-view-model";
import { patchAppointmentDetailCache } from "@/lib/appointment-detail-cache";
import type { AppointmentMutationInvalidationOpts } from "@/lib/appointment-mutation-invalidation";
import {
  publishAppointmentMergeCrossTab,
  publishAppointmentRemoveCrossTab,
} from "@/lib/query-cache-cross-tab";
import { syncAppointmentsAfterWrite } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import type { Appointment, Category, Patient } from "@/types/types";

/** Build calendar list row — re-resolve patient/category FKs from warm list caches. */
export function enrichAppointmentToFullRow(
  queryClient: QueryClient,
  appointment: Appointment,
  existing?: FullAppointment | null
): FullAppointment {
  const fromApi = appointment as FullAppointment;
  const patients = queryClient.getQueryData<Patient[]>(queryKeys.patients.all);
  const categories = queryClient.getQueryData<Category[]>(queryKeys.categories.all);

  const patientId = appointment.patient ?? existing?.patient ?? null;
  const categoryId = appointment.category ?? existing?.category ?? null;

  const patient_data =
    fromApi.patient_data ??
    existing?.patient_data ??
    (patientId ? patients?.find((p) => p.id === patientId) : undefined);

  const category_data =
    fromApi.category_data ??
    existing?.category_data ??
    (categoryId ? categories?.find((c) => c.id === categoryId) : undefined);

  return {
    ...existing,
    ...appointment,
    id: appointment.id,
    patient_data,
    category_data,
    appointment_assignee: fromApi.appointment_assignee ?? existing?.appointment_assignee,
    portal_owner: fromApi.portal_owner ?? existing?.portal_owner,
    portal_treating_physician:
      fromApi.portal_treating_physician ?? existing?.portal_treating_physician,
    treating_physician_directory_seed: existing?.treating_physician_directory_seed,
    appointment_type_visit_seed: existing?.appointment_type_visit_seed,
  };
}

/** Pure upsert — used by list cache merge and tests. */
export function upsertAppointmentInList(
  list: FullAppointment[],
  row: FullAppointment
): FullAppointment[] {
  const idx = list.findIndex((a) => a.id === row.id);
  if (idx === -1) return [...list, row];
  const next = [...list];
  next[idx] = row;
  return next;
}

/** Patch `appointments.all` when API returns a single appointment row. */
export function mergeAppointmentIntoListCache(
  queryClient: QueryClient,
  appointment: Appointment
): void {
  const existing = queryClient
    .getQueryData<FullAppointment[]>(queryKeys.appointments.all)
    ?.find((a) => a.id === appointment.id);
  const row = enrichAppointmentToFullRow(queryClient, appointment, existing);
  queryClient.setQueryData<FullAppointment[]>(queryKeys.appointments.all, (old) => {
    const list = old ?? [];
    return upsertAppointmentInList(list, row);
  });
}

/** Detail panel — PATCH response paints immediately without GET /api/appointments/:id. */
export function mergeAppointmentIntoDetailCache(
  queryClient: QueryClient,
  appointmentId: string,
  detail: AppointmentDetailApiPayload["detail"]
): void {
  patchAppointmentDetailCache(queryClient, appointmentId, detail);
}

/** Cache-first appointment write — list + detail in one synchronous pass. */
export function mergeAppointmentIntoAllCaches(
  queryClient: QueryClient,
  payload: AppointmentDetailApiPayload
): void {
  mergeAppointmentIntoListCache(queryClient, payload.appointment);
  mergeAppointmentIntoDetailCache(queryClient, payload.appointment.id, payload.detail);
}

/** Apply list and/or detail merge depending on payload shape. */
export function mergeAppointmentWritePayload(
  queryClient: QueryClient,
  payload: AppointmentWritePayload
): void {
  if ("detail" in payload && payload.detail) {
    mergeAppointmentIntoAllCaches(queryClient, payload as AppointmentDetailApiPayload);
    return;
  }
  mergeAppointmentIntoListCache(queryClient, payload.appointment);
}

/** Remove row from warm list + drop detail cache after DELETE. */
export function removeAppointmentFromListCache(
  queryClient: QueryClient,
  appointmentId: string
): void {
  queryClient.setQueryData<FullAppointment[]>(queryKeys.appointments.all, (old) => {
    if (old == null) return old;
    return old.filter((a) => a.id !== appointmentId);
  });
  queryClient.removeQueries({ queryKey: queryKeys.appointments.detail(appointmentId) });
}

export type AppointmentWriteOrchestratorOpts = AppointmentMutationInvalidationOpts & {
  deleted?: boolean;
};

/**
 * Cache-first path for client mutations — merge/remove locally, selective sync, cross-tab row broadcast.
 * Bulk/external callers (ICS import, GCal) should keep `invalidateAfterAppointmentMutation`.
 */
export async function syncAfterAppointmentWrite(
  queryClient: QueryClient,
  payload: AppointmentWritePayload | null,
  opts: AppointmentWriteOrchestratorOpts
): Promise<void> {
  const scope = opts.scope ?? "schedule";
  const patientId = opts.patientId ?? undefined;

  if (opts.deleted && opts.appointmentId) {
    removeAppointmentFromListCache(queryClient, opts.appointmentId);
    await syncAppointmentsAfterWrite(queryClient, {
      ...opts,
      scope,
      cachesMerged: true,
      deleted: true,
    });
    publishAppointmentRemoveCrossTab(opts.appointmentId, { scope, patientId });
    return;
  }

  if (payload) {
    mergeAppointmentWritePayload(queryClient, payload);
  }

  await syncAppointmentsAfterWrite(queryClient, {
    ...opts,
    scope,
    cachesMerged: true,
  });

  if (payload) {
    publishAppointmentMergeCrossTab(payload, { scope, patientId });
  }
}
