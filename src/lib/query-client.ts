import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";

/** Appointment rows in cache — `patient` is FK to patients.id */
type CachedAppointmentRow = { id: string; patient?: string | null };

type CachedInvoiceRow = { id: string; appointment_id?: string | null };

/** Resolve patient UUID from the appointments list cache (no extra fetch). */
export function getPatientIdFromAppointmentCache(
  queryClient: QueryClient,
  appointmentId: string | null | undefined
): string | undefined {
  if (!appointmentId) return undefined;
  const data = queryClient.getQueryData<CachedAppointmentRow[]>(queryKeys.appointments.all);
  return data?.find((a) => a.id === appointmentId)?.patient ?? undefined;
}

/** Invoice list cache → appointment → patient (for targeted invalidation after invoice CRUD). */
export function getPatientIdFromInvoiceCache(
  queryClient: QueryClient,
  invoiceId: string
): string | undefined {
  const invoices = queryClient.getQueryData<CachedInvoiceRow[]>(queryKeys.invoices.all);
  const inv = invoices?.find((i) => i.id === invoiceId);
  if (!inv?.appointment_id) return undefined;
  return getPatientIdFromAppointmentCache(queryClient, inv.appointment_id);
}

/** Narrow invalidation: detail + snapshot only (avoids refetching full patient list when not needed). */
export async function invalidatePatientDetailAndSnapshot(
  queryClient: QueryClient,
  patientId: string | null | undefined
) {
  if (!patientId) return;
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.patients.detail(patientId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.patients.snapshot(patientId) }),
  ]);
}

/**
 * Creates and configures the default QueryClient for the application.
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 3 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

/** Full app sweep — use on session reset / logout only */
export async function invalidateAllForCrud(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.root });
}

export async function invalidateAppointmentData(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
}

export async function invalidateNotificationsData(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
}

export async function invalidateActivitiesList(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.activities.list });
}

export async function invalidateAssigneesData(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.assignees.all });
}

export async function invalidateDashboardAccessData(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.dashboardAccess.all });
}

export async function invalidateGoogleCalendarData(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.googleCalendar.root });
}

export async function invalidateDashboardOverview(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview });
}

export async function invalidateInsightsAndAnalytics(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.insights.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all }),
  ]);
}

/**
 * After patient / relative / category CRUD — denormalized appointment list must refetch.
 *
 * Also invalidates `dashboard.overview` because:
 * - patients: "Total Patients" + "Active Patients" overview cards track patient counts.
 * - categories: "Total Categories" overview card tracks category count.
 * - relatives: not tracked in overview but the extra invalidation is a <1ms no-op (TanStack
 *   cache miss) and keeps the chain consistent without adding conditional branching.
 */
export async function invalidateEntityAffectingAppointments(
  queryClient: QueryClient,
  resource: "patients" | "relatives" | "categories"
) {
  const key =
    resource === "patients"
      ? queryKeys.patients.all
      : resource === "relatives"
        ? queryKeys.relatives.all
        : queryKeys.categories.all;
  // Activities list + appointments read denormalized labels; invalidate together so UI updates without navigation.
  // Insights charts aggregate by patient/category — must refetch when those entities change.
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: key }),
    queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all }),
    invalidateActivitiesList(queryClient),
    invalidateDashboardOverview(queryClient),
    invalidateInsightsAndAnalytics(queryClient),
  ]);
}

/** Invitations, dashboard access, assignees — shared calendar semantics */
export async function invalidateSharingAndAppointments(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboardAccess.all }),
    invalidateAssigneesData(queryClient),
    queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all }),
  ]);
}

/** Users list/detail + doctors cache (specialty/bio/role changes must reflect in /services + DoctorManagement) */
export async function invalidateUsersAndAuth(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.me }),
    queryClient.invalidateQueries({ queryKey: queryKeys.doctors.all }),
  ]);
}

/** Organizations — lists and nested member queries */
export async function invalidateOrganizations(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
}

/**
 * Invoices + dashboard KPIs + patient UI tied to billing/appointments.
 * When `patientId` is known, only that patient’s detail/snapshot refetch (fewer calls than `patients.all`).
 */
export async function invalidateInvoicesAndOverview(
  queryClient: QueryClient,
  opts?: { patientId?: string | null }
) {
  const patientId = opts?.patientId;
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all }),
    invalidateDashboardOverview(queryClient),
    patientId
      ? invalidatePatientDetailAndSnapshot(queryClient, patientId)
      : queryClient.invalidateQueries({ queryKey: queryKeys.patients.all }),
  ]);
}

export async function invalidateAvailabilitySlots(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.availability.root });
}

/**
 * After appointment create/update/import — pass `patientId` when known for cheaper patient cache updates.
 * Also invalidates insights/analytics since all charts aggregate appointment data.
 */
export async function invalidateAfterAppointmentMutation(
  queryClient: QueryClient,
  opts?: { patientId?: string | null }
) {
  await Promise.all([
    invalidateAppointmentData(queryClient),
    invalidateActivitiesList(queryClient),
    invalidateNotificationsData(queryClient),
    invalidateAvailabilitySlots(queryClient),
    invalidateInvoicesAndOverview(queryClient, { patientId: opts?.patientId ?? undefined }),
    // Insights / analytics charts aggregate appointment data — must refetch after any mutation.
    invalidateInsightsAndAnalytics(queryClient),
  ]);
}

/** Assignee or per-appointment activity changes — resolves patient from cache when possible */
export async function invalidateAssigneesActivitiesAppointment(
  queryClient: QueryClient,
  appointmentId?: string | null
) {
  const patientId =
    getPatientIdFromAppointmentCache(queryClient, appointmentId ?? undefined) ?? undefined;
  await Promise.all([
    invalidateAssigneesData(queryClient),
    invalidateAppointmentData(queryClient),
    invalidateActivitiesList(queryClient),
    invalidateAvailabilitySlots(queryClient),
    patientId
      ? invalidatePatientDetailAndSnapshot(queryClient, patientId)
      : queryClient.invalidateQueries({ queryKey: queryKeys.patients.all }),
  ]);
  if (appointmentId) {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.activities.byAppointment(appointmentId),
    });
  }
}
