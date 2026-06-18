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
import type { GoogleCalendarStatus } from "@/types/google-calendar";
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
  invalidateDoctorDetailAndSnapshot,
  invalidateDoctorsAffectedByPatientWrite,
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

import { resolveDoctorIdsFromInvoice } from "@/lib/invoice-doctor-scope";
import type { InvoiceVisitSummary } from "@/lib/billing-types";

type CachedInvoiceRow = {
  id: string;
  user_id?: string;
  appointment_id?: string | null;
  organization_id?: string | null;
  visit_summary?: InvoiceVisitSummary | null;
};

/** Resolve org id from global invoice list cache — for org billing/list aggregate bust. */
export function getOrganizationIdFromInvoiceCache(
  queryClient: QueryClient,
  invoiceId: string
): string | undefined {
  const invoices = queryClient.getQueryData<CachedInvoiceRow[]>(queryKeys.invoices.all);
  const inv = invoices?.find((i) => i.id === invoiceId);
  return inv?.organization_id ?? undefined;
}

/** Doctor ids from cached invoice row — issuer + visit treating/calendar owner. */
export function getDoctorIdsFromInvoiceCache(
  queryClient: QueryClient,
  invoiceId: string
): string[] {
  const invoices = queryClient.getQueryData<CachedInvoiceRow[]>(queryKeys.invoices.all);
  const inv = invoices?.find((i) => i.id === invoiceId);
  if (!inv) return [];
  return resolveDoctorIdsFromInvoice(inv);
}

/** Bust scoped org/doctor/viewer list + KPI totals caches after invoice CRUD. */
export async function invalidateInvoiceScopedBilling(
  queryClient: QueryClient,
  opts?: { organizationId?: string | null; doctorIds?: readonly string[] }
) {
  const tasks: Promise<void>[] = [
    queryClient.invalidateQueries({ queryKey: queryKeys.invoices.viewerTotals }),
  ];
  const orgId = opts?.organizationId?.trim();
  if (orgId) {
    tasks.push(
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.byOrganization(orgId) }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.invoices.byOrganizationTotals(orgId),
      })
    );
  }
  for (const rawId of opts?.doctorIds ?? []) {
    const doctorId = rawId.trim();
    if (!doctorId) continue;
    tasks.push(
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.byDoctor(doctorId) }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.invoices.byDoctorTotals(doctorId),
      })
    );
  }
  if (tasks.length > 0) await Promise.all(tasks);
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

/** Connect/disconnect/sync — bust status in other tabs. */
export async function invalidateGoogleCalendarAndCrossTab(queryClient: QueryClient) {
  await invalidateGoogleCalendarData(queryClient);
  publishQueryCacheCrossTab(["googleCalendar"]);
}

/** After cancel/delete removed a remote Google event — refresh pulled events when connected. */
export async function maybeInvalidateGoogleCalendarIfConnected(
  queryClient: QueryClient
): Promise<void> {
  const statusKey = [...queryKeys.googleCalendar.root, "status"] as const;
  const status = queryClient.getQueryData<GoogleCalendarStatus>(statusKey);
  if (status?.connected) {
    await invalidateGoogleCalendarAndCrossTab(queryClient);
  }
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
    ...(resource === "patients"
      ? [
          invalidatePatientPortal(queryClient),
          invalidateDoctorAssignedPatients(queryClient),
          queryClient.invalidateQueries({ queryKey: queryKeys.doctors.all }),
        ]
      : []),
  ]);
  publishQueryCacheCrossTab(
    resource === "patients" ? CROSS_TAB_SCOPES.ENTITY_PATIENTS : CROSS_TAB_SCOPES.ENTITY_CATEGORIES
  );
}

/**
 * After category list/detail cache patch — bust appointments + analytics only (not categories.all).
 */
export async function syncAppointmentsAfterCategoryWrite(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all }),
    invalidateDashboardOverview(queryClient),
    invalidateInsightsAndAnalytics(queryClient),
    invalidateDoctorPortal(queryClient),
    invalidateAdminPortal(queryClient),
  ]);
  publishQueryCacheCrossTab(CROSS_TAB_SCOPES.ENTITY_CATEGORIES);
}

/**
 * After patient list/detail cache patch — bust appointments + portals without re-fetching patients.all.
 */
export async function syncAppointmentsAfterPatientWrite(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all }),
    invalidateDashboardOverview(queryClient),
    invalidateInsightsAndAnalytics(queryClient),
    invalidateDoctorPortal(queryClient),
    invalidateAdminPortal(queryClient),
    invalidatePatientPortal(queryClient),
    invalidateDoctorAssignedPatients(queryClient),
    queryClient.invalidateQueries({ queryKey: queryKeys.doctors.all }),
  ]);
  publishQueryCacheCrossTab(CROSS_TAB_SCOPES.ENTITY_PATIENTS);
}

/** Doctor detail primary-doctor roster — bust on patient CRUD / primary_doctor_id changes. */
export async function invalidateDoctorAssignedPatients(queryClient: QueryClient) {
  await queryClient.invalidateQueries({
    predicate: (query) =>
      query.queryKey[0] === "app" &&
      query.queryKey[1] === "doctors" &&
      query.queryKey[3] === "assigned-patients",
  });
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

/** Org detail + per-org billing caches — call on member/org/invoice mutations scoped to org. */
export async function invalidateOrganizationDetail(
  queryClient: QueryClient,
  orgId: string
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.organizations.detail(orgId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.organizations.members(orgId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.invoices.byOrganization(orgId) }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.invoices.byOrganizationTotals(orgId),
    }),
  ]);
  publishQueryCacheCrossTab(CROSS_TAB_SCOPES.ORGANIZATIONS);
  publishQueryCacheCrossTab(CROSS_TAB_SCOPES.INVOICES_BILLING);
}

/**
 * Lighter bust after draft create / metadata PATCH — skips insights + doctors directory.
 * Prefer `mergeInvoiceIntoAllCaches` in mutation `onSuccess`, then `syncInvoicesAfterWrite`.
 */
export async function invalidateInvoicesBilling(
  queryClient: QueryClient,
  opts?: { patientId?: string | null; invoiceId?: string | null; organizationId?: string | null }
) {
  const patientId = opts?.patientId;
  const invoiceId = opts?.invoiceId;
  const organizationId =
    opts?.organizationId ??
    (invoiceId ? getOrganizationIdFromInvoiceCache(queryClient, invoiceId) : undefined);
  const doctorIds = invoiceId ? getDoctorIdsFromInvoiceCache(queryClient, invoiceId) : [];
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.billing.root }),
    ...(invoiceId
      ? [
          queryClient.invalidateQueries({
            queryKey: queryKeys.invoices.detail(invoiceId),
          }),
        ]
      : []),
    invalidateDashboardOverview(queryClient),
    invalidatePatientPortal(queryClient),
    invalidateDoctorPortal(queryClient),
    invalidateAdminPortal(queryClient),
    patientId
      ? invalidatePatientDetailAndSnapshot(queryClient, patientId)
      : [],
    ...(organizationId
      ? [
          invalidateOrganizationDetail(queryClient, organizationId),
          invalidateOrganizations(queryClient),
        ]
      : []),
    invalidateInvoiceScopedBilling(queryClient, { doctorIds }),
  ]);
  publishQueryCacheCrossTab(CROSS_TAB_SCOPES.INVOICES_BILLING);
}

/**
 * Invoices + dashboard KPIs + patient UI tied to billing/appointments.
 * When `patientId` is known, only that patient’s detail/snapshot refetch (fewer calls than `patients.all`).
 */
export async function invalidateInvoicesAndOverview(
  queryClient: QueryClient,
  opts?: { patientId?: string | null; invoiceId?: string | null; organizationId?: string | null }
) {
  const patientId = opts?.patientId;
  const invoiceId = opts?.invoiceId;
  const organizationId =
    opts?.organizationId ??
    (invoiceId ? getOrganizationIdFromInvoiceCache(queryClient, invoiceId) : undefined);
  const doctorIds = invoiceId ? getDoctorIdsFromInvoiceCache(queryClient, invoiceId) : [];
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.billing.root }),
    ...(invoiceId
      ? [
          queryClient.invalidateQueries({
            queryKey: queryKeys.invoices.detail(invoiceId),
          }),
        ]
      : []),
    queryClient.invalidateQueries({ queryKey: queryKeys.doctors.all }),
    invalidateDashboardOverview(queryClient),
    invalidateInsightsAndAnalytics(queryClient),
    invalidatePatientPortal(queryClient),
    invalidateDoctorPortal(queryClient),
    invalidateAdminPortal(queryClient),
    patientId
      ? invalidatePatientDetailAndSnapshot(queryClient, patientId)
      : queryClient.invalidateQueries({ queryKey: queryKeys.patients.all }),
    ...(organizationId
      ? [
          invalidateOrganizationDetail(queryClient, organizationId),
          invalidateOrganizations(queryClient),
        ]
      : []),
    invalidateInvoiceScopedBilling(queryClient, { doctorIds }),
  ]);
  publishQueryCacheCrossTab(CROSS_TAB_SCOPES.INVOICES);
}

/** Options for cache-first invoice writes — lists/detail merged before this runs. */
export type InvoiceWriteSyncOpts = {
  invoiceId: string;
  patientId?: string;
  organizationId?: string;
  doctorIds?: string[];
  scope: "billing" | "full";
  /** Status or amount changed — dashboard KPI tiles need server totals. */
  totalsChanged?: boolean;
  status?: string;
  /** False when cold tab has no merged caches (falls back to list/detail invalidation). */
  cachesMerged?: boolean;
  /** DELETE path — row removed from warm caches; still bust billing pickers. */
  deleted?: boolean;
};

function invoiceStatusAffectsDashboardTotals(
  status?: string,
  totalsChanged?: boolean
): boolean {
  if (totalsChanged) return true;
  return status === "paid" || status === "cancelled" || status === "refunded";
}

/**
 * Selective background sync after invoice CRUD when TanStack caches were patched first.
 * Skips invoices.all / detail / scoped lists when `cachesMerged` — UI already fresh.
 */
export async function syncInvoicesAfterWrite(
  queryClient: QueryClient,
  opts: InvoiceWriteSyncOpts
): Promise<void> {
  const organizationId =
    opts.organizationId ??
    getOrganizationIdFromInvoiceCache(queryClient, opts.invoiceId);
  const doctorIds =
    opts.doctorIds ?? getDoctorIdsFromInvoiceCache(queryClient, opts.invoiceId);
  const cachesMerged = opts.cachesMerged !== false && !opts.deleted;

  const tasks: Promise<void>[] = [
    queryClient.invalidateQueries({ queryKey: queryKeys.billing.root }),
    invalidatePatientPortal(queryClient),
    invalidateDoctorPortal(queryClient),
    invalidateAdminPortal(queryClient),
  ];

  if (!cachesMerged) {
    tasks.push(
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.invoices.detail(opts.invoiceId),
      }),
      invalidateInvoiceScopedBilling(queryClient, { organizationId, doctorIds })
    );
  }

  if (invoiceStatusAffectsDashboardTotals(opts.status, opts.totalsChanged)) {
    tasks.push(invalidateDashboardOverview(queryClient));
  }

  if (opts.patientId) {
    tasks.push(invalidatePatientDetailAndSnapshot(queryClient, opts.patientId));
  }

  if (opts.scope === "full") {
    tasks.push(
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors.all }),
      invalidateInsightsAndAnalytics(queryClient)
    );
  }

  await Promise.all(tasks);
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
 * - `appointments.all` calendar cards (denormalized type name / visit fee on list rows)
 */
export async function invalidateAppointmentTypeDerived(queryClient: QueryClient) {
  await Promise.all([
    invalidateAppointmentTypesData(queryClient),
    invalidateAvailabilitySlots(queryClient),
    /** Cards denormalize type name/fee from joined rows — bust calendar list after type CRUD. */
    invalidateAppointmentData(queryClient),
    queryClient.invalidateQueries({ queryKey: queryKeys.doctors.all }),
    invalidateDoctorPortal(queryClient),
    invalidateInsightsAndAnalytics(queryClient),
  ]);
  publishQueryCacheCrossTab(CROSS_TAB_SCOPES.APPOINTMENT_TYPE_DERIVED);
}

/**
 * After appointment create/update/import — pass `patientId` when known for cheaper patient cache updates.
 * Also invalidates insights/analytics since all charts aggregate appointment data.
 * Portal caches (doctor, admin, patient) are included because portals show appointment counts and lists.
 *
 * Prefer `mergeAppointmentIntoAllCaches` + `syncAfterAppointmentWrite` for client mutations (C51).
 */
export type AppointmentWriteSyncOpts = AppointmentMutationInvalidationOpts & {
  /** True when list + detail were patched locally — skips appointments.all + detail bust. */
  cachesMerged?: boolean;
  /** DELETE path — list row removed; detail query dropped instead of invalidated. */
  deleted?: boolean;
};

/**
 * Selective background sync after appointment CRUD when TanStack caches were patched first.
 * Skips appointments.all / detail when `cachesMerged` — UI already fresh on current tab.
 */
export async function syncAppointmentsAfterWrite(
  queryClient: QueryClient,
  opts: AppointmentWriteSyncOpts
): Promise<void> {
  const scope = opts.scope ?? "schedule";
  const targets = resolveAppointmentMutationTargets(queryClient, opts);
  const cachesMerged = opts.cachesMerged === true;
  const deleted = opts.deleted === true;

  const appointmentListTasks: Promise<void>[] = [];
  if (!cachesMerged) {
    appointmentListTasks.push(invalidateAppointmentData(queryClient));
    if (opts.appointmentId) {
      appointmentListTasks.push(
        queryClient
          .invalidateQueries({ queryKey: queryKeys.appointments.detail(opts.appointmentId) })
          .then(() => undefined)
      );
    }
  } else if (deleted && opts.appointmentId) {
    queryClient.removeQueries({ queryKey: queryKeys.appointments.detail(opts.appointmentId) });
  }

  const sharedTasks: Promise<void>[] = [
    ...appointmentListTasks,
    invalidateNotificationsData(queryClient),
    invalidatePatientPortal(queryClient),
    invalidateDoctorPortal(queryClient),
    invalidateAdminPortal(queryClient),
    invalidateAppointmentEntitySnapshots(queryClient, targets),
  ];

  if (scope === "status") {
    await Promise.all([
      ...sharedTasks,
      invalidateDashboardOverview(queryClient),
      invalidateInsightsAndAnalytics(queryClient),
    ]);
    return;
  }

  if (scope === "schedule") {
    await Promise.all([
      ...sharedTasks,
      invalidateAvailabilitySlots(queryClient),
      invalidateAppointmentTypesData(queryClient),
      invalidateDashboardOverview(queryClient),
      invalidateInsightsAndAnalytics(queryClient),
    ]);
    return;
  }

  await Promise.all([
    ...appointmentListTasks,
    invalidateNotificationsData(queryClient),
    invalidateAppointmentTypeDerived(queryClient),
    invalidateInvoicesAndOverview(queryClient, {
      patientId: opts.patientId ?? targets.patientIds[0] ?? undefined,
    }),
    invalidateAppointmentEntitySnapshots(queryClient, targets),
  ]);
}

export async function invalidateAfterAppointmentMutation(
  queryClient: QueryClient,
  opts?: AppointmentMutationInvalidationOpts
) {
  const scope = opts?.scope ?? "schedule";
  await syncAppointmentsAfterWrite(queryClient, { ...opts, scope, cachesMerged: false });

  if (scope === "status") {
    publishQueryCacheCrossTab(CROSS_TAB_SCOPES.APPOINTMENT_STATUS);
    return;
  }

  if (scope === "schedule") {
    publishQueryCacheCrossTab(CROSS_TAB_SCOPES.APPOINTMENT_SCHEDULE);
    return;
  }

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
  if (path === "/control-panel/user-admin-management") {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
      invalidateDashboardOverview(queryClient),
    ]);
    publishQueryCacheCrossTab(["users", "dashboard"]);
    return;
  }
  if (path === "/control-panel/organization-management") {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all }),
      invalidateDashboardOverview(queryClient),
    ]);
    publishQueryCacheCrossTab(["organizations", "dashboard"]);
    return;
  }
  if (path === "/control-panel/invoice-management") {
    await Promise.all([
      invalidateInvoicesAndOverview(queryClient),
      invalidateDashboardOverview(queryClient),
    ]);
    publishQueryCacheCrossTab(["invoices", "dashboard"]);
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
