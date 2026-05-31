/**
 * TanStack invalidation helpers — insights bust matrix (prefix queryKeys.insights.root):
 *   invalidateAfterAppointmentMutation, invalidateEntityAffectingAppointments,
 *   invalidateInvoicesAndOverview, invalidateUsersAndAuth, invalidateAppointmentTypeDerived,
 *   invalidateSharingAndAppointments, invalidateAssigneesActivitiesAppointment,
 *   invalidateQueriesForRoute (/insights, /analytics)
 */
import { QueryClient } from "@tanstack/react-query";
import {
  CROSS_TAB_SCOPES,
  publishQueryCacheCrossTab,
  type QueryCacheCrossTabScope,
} from "@/lib/query-cache-cross-tab";
import { queryKeys } from "./query-keys";
import {
  getCategoryIdFromAppointmentCache,
  getPatientIdFromAppointmentCache,
} from "./appointment-cache-read";
export {
  getCategoryIdFromAppointmentCache,
  getPatientIdFromAppointmentCache,
} from "./appointment-cache-read";
export type { CachedAppointmentRow } from "./appointment-cache-read";
import {
  invalidateCategoryDetailAndSnapshot,
  invalidatePatientDetailAndSnapshot,
} from "./entity-snapshot-invalidation";
export {
  invalidateCategoryDetailAndSnapshot,
  invalidatePatientDetailAndSnapshot,
} from "./entity-snapshot-invalidation";
import {
  type AppointmentMutationInvalidationOpts,
  invalidateAppointmentEntitySnapshots,
  resolveAppointmentMutationTargets,
} from "./appointment-mutation-invalidation";

export type { AppointmentMutationInvalidationOpts } from "./appointment-mutation-invalidation";
export {
  invalidateAppointmentEntitySnapshots,
  resolveAppointmentMutationTargets,
} from "./appointment-mutation-invalidation";

/** Appointment rows in cache — see `appointment-cache-read.ts`. */
type CachedAppointmentRow = { id: string; patient?: string | null; category?: string | null };

type CachedInvoiceRow = { id: string; appointment_id?: string | null };

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
  publishQueryCacheCrossTab(CROSS_TAB_SCOPES.APP_ROOT);
}

export async function invalidateAppointmentData(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
}

export async function invalidateNotificationsData(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
}

/** SSE + cross-tab — use when server pushes new rows outside client mutations. */
export async function invalidateNotificationsAndCrossTab(queryClient: QueryClient) {
  await invalidateNotificationsData(queryClient);
  publishQueryCacheCrossTab(["notifications"]);
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
  publishQueryCacheCrossTab(
    resource === "patients" ? CROSS_TAB_SCOPES.ENTITY_PATIENTS : CROSS_TAB_SCOPES.ENTITY_CATEGORIES
  );
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
  publishQueryCacheCrossTab(CROSS_TAB_SCOPES.SHARING);
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
  publishQueryCacheCrossTab(CROSS_TAB_SCOPES.USERS_AND_AUTH);
}

/** Organizations — lists and nested member queries */
export async function invalidateOrganizations(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
  publishQueryCacheCrossTab(CROSS_TAB_SCOPES.ORGANIZATIONS);
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
  publishQueryCacheCrossTab(CROSS_TAB_SCOPES.INVOICES);
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
  publishQueryCacheCrossTab(CROSS_TAB_SCOPES.APPOINTMENT_TYPE_DERIVED);
}

/**
 * After appointment create/update/import — pass `patientId` when known for cheaper patient cache updates.
 * Also invalidates insights/analytics since all charts aggregate appointment data.
 * Portal caches (doctor, secretary, admin) are included because all portals show appointment counts and lists.
 */
export async function invalidateAfterAppointmentMutation(
  queryClient: QueryClient,
  opts?: AppointmentMutationInvalidationOpts
) {
  const targets = resolveAppointmentMutationTargets(queryClient, opts);

  await Promise.all([
    invalidateAppointmentData(queryClient),
    invalidateNotificationsData(queryClient),
    invalidateAppointmentTypeDerived(queryClient),
    invalidateInvoicesAndOverview(queryClient, {
      patientId: opts?.patientId ?? targets.patientIds[0] ?? undefined,
    }),
    invalidateInsightsAndAnalytics(queryClient),
    invalidatePatientPortal(queryClient),
    invalidateDoctorPortal(queryClient),
    invalidateAdminPortal(queryClient),
    invalidateAppointmentEntitySnapshots(queryClient, targets),
  ]);
  publishQueryCacheCrossTab(CROSS_TAB_SCOPES.APPOINTMENT_MUTATION);
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
  publishQueryCacheCrossTab(CROSS_TAB_SCOPES.DOCTOR_SCHEDULE);
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
    publishQueryCacheCrossTab([
      "appointmentTypes",
      ...CROSS_TAB_SCOPES.USERS_AND_AUTH,
    ] satisfies QueryCacheCrossTabScope[]);
    return;
  }
  if (path === "/doctor-portal") {
    await Promise.all([invalidateDoctorPortal(queryClient), invalidateDashboardOverview(queryClient)]);
    publishQueryCacheCrossTab(["doctorPortal", "dashboard"]);
    return;
  }
  if (path === "/patient-portal") {
    await Promise.all([invalidatePatientPortal(queryClient), invalidateDashboardOverview(queryClient)]);
    publishQueryCacheCrossTab(["patientPortal", "dashboard"]);
    return;
  }
  if (path === "/dashboard" || path === "/dashboard-overview") {
    await invalidateDashboardOverview(queryClient);
    publishQueryCacheCrossTab(["dashboard"]);
    return;
  }
  if (path === "/insights" || path === "/analytics") {
    await invalidateInsightsAndAnalytics(queryClient);
    publishQueryCacheCrossTab(CROSS_TAB_SCOPES.INSIGHTS_ONLY);
    return;
  }
  if (path === "/control-panel/patient-management") {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.all }),
      invalidateDashboardOverview(queryClient),
    ]);
    publishQueryCacheCrossTab(["patients", "dashboard"]);
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
    publishQueryCacheCrossTab(["appointments", "dashboard"]);
    return;
  }
  if (path === "/control-panel/category-management") {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all }),
      invalidateDashboardOverview(queryClient),
    ]);
    publishQueryCacheCrossTab(["categories", "dashboard"]);
    return;
  }
  if (path === "/control-panel" || path.startsWith("/control-panel/")) {
    await invalidateDashboardOverview(queryClient);
    publishQueryCacheCrossTab(["dashboard"]);
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
  publishQueryCacheCrossTab(CROSS_TAB_SCOPES.ASSIGNEES);
}
