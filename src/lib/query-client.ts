/**
 * TanStack invalidation helpers — insights bust matrix (prefix queryKeys.insights.root):
 *   invalidateAfterAppointmentMutation, invalidateEntityAffectingAppointments,
 *   invalidateInvoicesAndOverview, invalidateUsersAndAuth, invalidateAppointmentTypeDerived,
 *   invalidateSharingAndAppointments, invalidateAssigneesActivitiesAppointment,
 *   invalidateQueriesForRoute (/insights, /analytics)
 */
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

/** Linked patient profile + portal appointment list — invalidate when staff edits patient or appointments change. */
export async function invalidatePatientPortal(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.patientPortal.all });
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
    queryClient.invalidateQueries({ queryKey: queryKeys.insights.root }),
    queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all }),
  ]);
}

/**
 * After patient / category CRUD — denormalized appointment list must refetch.
 * Insights charts aggregate by patient/category — must refetch when those entities change.
 * Portal caches depend on patient/category counts and appointment lists.
 */
export async function invalidateEntityAffectingAppointments(
  queryClient: QueryClient,
  resource: "patients" | "categories"
) {
  const key = resource === "patients" ? queryKeys.patients.all : queryKeys.categories.all;
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: key }),
    queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all }),
    invalidateDashboardOverview(queryClient),
    invalidateInsightsAndAnalytics(queryClient),
    invalidateDoctorPortal(queryClient),
    invalidateAdminPortal(queryClient),
    ...(resource === "patients" ? [invalidatePatientPortal(queryClient)] : []),
  ]);
}

/** Invitations, dashboard access, assignees — shared calendar semantics */
export async function invalidateSharingAndAppointments(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.invitations.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboardAccess.all }),
    invalidateAssigneesData(queryClient),
    queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all }),
    invalidateInsightsAndAnalytics(queryClient),
  ]);
}

/** Users list/detail + doctors cache (specialty/bio/role changes must reflect in /services + DoctorManagement) */
export async function invalidateUsersAndAuth(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.me }),
    queryClient.invalidateQueries({ queryKey: queryKeys.doctors.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.appointmentTypes.catalog }),
    invalidateInsightsAndAnalytics(queryClient),
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
    invalidateInsightsAndAnalytics(queryClient),
    patientId
      ? invalidatePatientDetailAndSnapshot(queryClient, patientId)
      : queryClient.invalidateQueries({ queryKey: queryKeys.patients.all }),
  ]);
}

export async function invalidateAvailabilitySlots(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.availability.root });
}

/** Doctor's own portal — invalidate after appointment mutations or type config changes */
export async function invalidateDoctorPortal(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.doctorPortal.all });
}

/** Admin portal — invalidate after major mutations that affect global KPIs */
export async function invalidateAdminPortal(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.adminPortal.all });
}

/**
 * Busts all `GET /api/appointment-types?doctorId=*` caches plus `global` — keeps slot pickers / portal /
 * services page in sync after any appointment mutation (overlap rules depend on persisted appointments).
 */
export async function invalidateAppointmentTypesData(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.appointmentTypes.all });
}

/**
 * Single choke-point after **AppointmentType** row changes (REST CRUD, doctor-config toggles, overlap shifts):
 * - `appointmentTypes.*` lists (portal, compose dialog, global cards, `/services` catalog)
 * - `availability` slot math (duration / buffers / intervals)
 * - `doctors.all` directory (`GET /api/doctors` embeds `appointment_types` for /services + Doctor Management)
 * - `doctorPortal.all` visit-type checkboxes (CP `DoctorGlobalTypeConfigEditor` + `/doctor-portal` toggles)
 */
export async function invalidateAppointmentTypeDerived(queryClient: QueryClient) {
  await Promise.all([
    invalidateAppointmentTypesData(queryClient),
    invalidateAvailabilitySlots(queryClient),
    queryClient.invalidateQueries({ queryKey: queryKeys.doctors.all }),
    invalidateDoctorPortal(queryClient),
    invalidateInsightsAndAnalytics(queryClient),
  ]);
}

/**
 * After appointment create/update/import — pass `patientId` when known for cheaper patient cache updates.
 * Also invalidates insights/analytics since all charts aggregate appointment data.
 * Portal caches (doctor, secretary, admin) are included because all portals show appointment counts and lists.
 */
export async function invalidateAfterAppointmentMutation(
  queryClient: QueryClient,
  opts?: { patientId?: string | null }
) {
  await Promise.all([
    invalidateAppointmentData(queryClient),
    invalidateNotificationsData(queryClient),
    invalidateAppointmentTypeDerived(queryClient),
    invalidateInvoicesAndOverview(queryClient, { patientId: opts?.patientId ?? undefined }),
    // Insights / analytics charts aggregate appointment data — must refetch after any mutation.
    invalidateInsightsAndAnalytics(queryClient),
    invalidatePatientPortal(queryClient),
    // Role-specific portals show appointment counts and today's schedule.
    invalidateDoctorPortal(queryClient),
    invalidateAdminPortal(queryClient),
  ]);
}

/**
 * After assignee rows are mutated outside the main appointment PATCH.
 * Resolves `patientId` from the appointments list cache so patient detail/snapshot refetch without navigation.
 *
 * When `patientId` is known, also invalidates `patientPortal.all`: the portal timeline is keyed to that
 * patient’s appointments; sharing edits can change labels or counts the patient should see on
 * the next fetch (TanStack marks stale → refetch in background; no full page reload).
 */
/**
 * After DoctorAvailability or DoctorTimeOff rows are created/deleted:
 * - bust the CRUD list caches on the doctor detail editor
 * - bust the slot picker cache so AppointmentDialog and PatientPortalPage show fresh chips
 * - bust doctors.all so the management table's availability pills update
 */
export async function invalidateDoctorSchedule(
  queryClient: QueryClient,
  doctorId: string
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.doctors.availability(doctorId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.doctors.timeOff(doctorId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.availability.root }),
    queryClient.invalidateQueries({ queryKey: queryKeys.doctors.all }),
    invalidateDoctorPortal(queryClient),
    // Doctors insights charts (weekly hours, time off) read schedule tables.
    invalidateInsightsAndAnalytics(queryClient),
  ]);
}

/**
 * Bust list/overview caches when navigating back from a detail screen — keeps stale
 * TanStack data fresh without changing global `refetchOnMount`.
 */
export async function invalidateQueriesForRoute(queryClient: QueryClient, href: string) {
  const path = (href.split("?")[0] ?? href).replace(/\/$/, "") || "/";

  if (path === "/services") {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.appointmentTypes.catalog }),
      invalidateUsersAndAuth(queryClient),
    ]);
    return;
  }
  if (path === "/doctor-portal") {
    await Promise.all([invalidateDoctorPortal(queryClient), invalidateDashboardOverview(queryClient)]);
    return;
  }
  if (path === "/patient-portal") {
    await Promise.all([invalidatePatientPortal(queryClient), invalidateDashboardOverview(queryClient)]);
    return;
  }
  if (path === "/dashboard" || path === "/dashboard-overview") {
    await invalidateDashboardOverview(queryClient);
    return;
  }
  if (path === "/insights" || path === "/analytics") {
    await invalidateInsightsAndAnalytics(queryClient);
    return;
  }
  if (path === "/control-panel/patient-management") {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.all }),
      invalidateDashboardOverview(queryClient),
    ]);
    return;
  }
  if (path === "/control-panel/doctor-management") {
    await invalidateUsersAndAuth(queryClient);
    return;
  }
  if (path === "/control-panel/appointment-management") {
    await Promise.all([
      invalidateAppointmentData(queryClient),
      invalidateDashboardOverview(queryClient),
    ]);
    return;
  }
  if (path === "/control-panel/category-management") {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all }),
      invalidateDashboardOverview(queryClient),
    ]);
    return;
  }
  if (path === "/control-panel" || path.startsWith("/control-panel/")) {
    await invalidateDashboardOverview(queryClient);
  }
}

export async function invalidateAssigneesActivitiesAppointment(
  queryClient: QueryClient,
  appointmentId?: string | null
) {
  const patientId =
    getPatientIdFromAppointmentCache(queryClient, appointmentId ?? undefined) ?? undefined;
  // Role portals embed appointment-derived metrics; keep them in sync with
  // assignee mutations without requiring a full page navigation or manual refresh.
  await Promise.all([
    invalidateAssigneesData(queryClient),
    invalidateAppointmentData(queryClient),
    invalidateAppointmentTypeDerived(queryClient),
    invalidateInsightsAndAnalytics(queryClient),
    invalidateDoctorPortal(queryClient),
    invalidateAdminPortal(queryClient),
    patientId
      ? invalidatePatientDetailAndSnapshot(queryClient, patientId)
      : queryClient.invalidateQueries({ queryKey: queryKeys.patients.all }),
    ...(patientId ? [invalidatePatientPortal(queryClient)] : []),
  ]);
}
