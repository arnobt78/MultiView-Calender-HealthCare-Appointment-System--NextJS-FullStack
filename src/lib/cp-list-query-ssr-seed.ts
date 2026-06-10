/**
 * Synchronous TanStack seeds for CP entity list queries — parent useMemo runs
 * before child hooks subscribe (invoice parity; avoids empty-table flash on refresh).
 */

import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { Patient, Category } from "@/types/types";
import type { DoctorsDirectoryResponse } from "@/lib/doctor-directory";
import type { DoctorPrefetchRow } from "@/lib/server-prefetch";

type DoctorsDirectoryCachePayload =
  | DoctorsDirectoryResponse
  | { doctors: DoctorPrefetchRow[] };
import type { UserListFilters, UsersListResponse } from "@/hooks/useUsers";

/** Seed only when cache has no data yet (safe under React strict double-render). */
function seedIfAbsent<T>(queryClient: QueryClient, key: QueryKey, data: T): void {
  const state = queryClient.getQueryState(key);
  if (state?.data !== undefined) return;
  queryClient.setQueryData(key, data);
}

export function seedPatientsListCacheFromSsr(
  queryClient: QueryClient,
  patients: Patient[] | null | undefined
): void {
  if (patients == null) return;
  seedIfAbsent(queryClient, queryKeys.patients.all, patients);
}

export function seedCategoriesListCacheFromSsr(
  queryClient: QueryClient,
  categories: Category[] | null | undefined
): void {
  if (categories == null) return;
  seedIfAbsent(queryClient, queryKeys.categories.all, categories);
}

export function seedDoctorsDirectoryCacheFromSsr(
  queryClient: QueryClient,
  directory: DoctorsDirectoryCachePayload | null | undefined
): void {
  if (directory == null) return;
  seedIfAbsent(queryClient, queryKeys.doctors.all, directory);
}

export function seedUsersListCacheFromSsr(
  queryClient: QueryClient,
  filters: UserListFilters,
  data: UsersListResponse | null | undefined
): void {
  if (data == null) return;
  seedIfAbsent(queryClient, [...queryKeys.users.all, filters], data);
}

export function seedDashboardOverviewCacheFromSsr(
  queryClient: QueryClient,
  overview: import("@/hooks/useDashboardOverview").DashboardOverview | null | undefined
): void {
  if (overview == null) return;
  seedIfAbsent(queryClient, queryKeys.dashboard.overview, overview);
}

export function seedOrganizationsListCacheFromSsr(
  queryClient: QueryClient,
  organizations: import("@/hooks/useOrganization").Organization[] | null | undefined
): void {
  if (organizations == null) return;
  seedIfAbsent(queryClient, queryKeys.organizations.all, organizations);
}

export function seedNotificationsCacheFromSsr(
  queryClient: QueryClient,
  notifications: import("@/lib/server-prefetch").NotificationsPrefetch | null | undefined
): void {
  if (notifications == null) return;
  seedIfAbsent(queryClient, queryKeys.notifications.all, notifications);
}

export function seedAppointmentsListCacheFromSsr(
  queryClient: QueryClient,
  appointments: import("@/hooks/useAppointments").FullAppointment[] | null | undefined
): void {
  if (appointments == null) return;
  seedIfAbsent(queryClient, queryKeys.appointments.all, appointments);
}

export function seedAdminAllAppointmentTypesCacheFromSsr(
  queryClient: QueryClient,
  data:
    | {
        globalTypes: import("@/hooks/useAppointmentTypes").AdminAllTypeRow[];
        customTypes: import("@/hooks/useAppointmentTypes").AdminAllTypeRow[];
      }
    | null
    | undefined
): void {
  if (data == null) return;
  seedIfAbsent(queryClient, queryKeys.appointmentTypes.all, data);
}

export function seedInvitationsCacheFromSsr(
  queryClient: QueryClient,
  type: "appointment" | "dashboard",
  invitations: import("@/hooks/useInvitations").Invitation[] | null | undefined
): void {
  if (invitations == null) return;
  seedIfAbsent(queryClient, queryKeys.invitations.byType(type), invitations);
}

export function seedGoogleCalendarStatusCacheFromSsr(
  queryClient: QueryClient,
  status: { connected: boolean; events: unknown[] } | null | undefined
): void {
  if (status == null) return;
  seedIfAbsent(queryClient, [...queryKeys.googleCalendar.root, "status"] as const, status);
}

export function seedDashboardAccessAcceptedCacheFromSsr(
  queryClient: QueryClient,
  rows: import("@/lib/query-fetchers").DashboardAccessRow[] | null | undefined
): void {
  if (rows == null) return;
  seedIfAbsent(queryClient, queryKeys.dashboardAccess.accepted, rows);
}

/** Per-org billing payloads — seeds byOrganization + byOrganizationTotals before billing panel mounts. */
export function seedOrgBillingCacheFromSsr(
  queryClient: QueryClient,
  orgBillingInvoicesByOrgId:
    | Record<string, import("@/lib/org-billing-prefetch").OrgBillingCachePayload>
    | null
    | undefined
): void {
  if (orgBillingInvoicesByOrgId == null) return;
  for (const [orgId, payload] of Object.entries(orgBillingInvoicesByOrgId)) {
    seedIfAbsent(queryClient, queryKeys.invoices.byOrganization(orgId), {
      invoices: payload.invoices,
    });
    seedIfAbsent(queryClient, queryKeys.invoices.byOrganizationTotals(orgId), {
      totals: payload.totals,
      statusTotals: payload.statusTotals,
    });
  }
}
