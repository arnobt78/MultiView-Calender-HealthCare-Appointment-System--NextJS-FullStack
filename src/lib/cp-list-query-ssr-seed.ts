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
import type { GoogleCalendarStatus } from "@/types/google-calendar";
import {
  CP_ADMIN_USERS_FILTERS,
  CP_DOCTOR_USERS_FILTERS,
} from "@/lib/control-panel-users-filters";

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
  overview: import("@/hooks/useDashboardOverview").DashboardOverview | null | undefined,
  /** SSR prefetch timestamp — when set, always writes cache so hydrate matches server subtitle metric. */
  updatedAt?: number
): void {
  if (overview == null) return;
  const key = queryKeys.dashboard.overview;
  if (updatedAt != null) {
    queryClient.setQueryData(key, overview, { updatedAt });
    return;
  }
  seedIfAbsent(queryClient, key, overview);
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
  notifications: import("@/lib/server-prefetch").NotificationsPrefetch | null | undefined,
  /** SSR prefetch timestamp — when set, always writes cache so hydrate matches server subtitle metric. */
  updatedAt?: number
): void {
  if (notifications == null) return;
  const key = queryKeys.notifications.all;
  if (updatedAt != null) {
    queryClient.setQueryData(key, notifications, { updatedAt });
    return;
  }
  seedIfAbsent(queryClient, key, notifications);
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
  status: GoogleCalendarStatus | null | undefined
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
  seedScopedInvoiceBillingCacheFromSsr(queryClient, orgBillingInvoicesByOrgId, null);
}

/** Org + doctor scoped billing SSR seeds for invoice hub and org panels. */
export function seedScopedInvoiceBillingCacheFromSsr(
  queryClient: QueryClient,
  orgBillingInvoicesByOrgId:
    | Record<string, import("@/lib/org-billing-prefetch").OrgBillingCachePayload>
    | null
    | undefined,
  doctorBillingByDoctorId:
    | Record<string, import("@/lib/org-billing-prefetch").OrgBillingCachePayload>
    | null
    | undefined
): void {
  if (orgBillingInvoicesByOrgId != null) {
    for (const [orgId, payload] of Object.entries(orgBillingInvoicesByOrgId)) {
      seedIfAbsent(queryClient, queryKeys.invoices.byOrganization(orgId), {
        invoices: payload.invoices,
      });
      seedIfAbsent(queryClient, queryKeys.invoices.byOrganizationTotals(orgId), payload.billingKpi);
    }
  }
  if (doctorBillingByDoctorId != null) {
    for (const [doctorId, payload] of Object.entries(doctorBillingByDoctorId)) {
      seedIfAbsent(queryClient, queryKeys.invoices.byDoctor(doctorId), {
        invoices: payload.invoices,
      });
      seedIfAbsent(queryClient, queryKeys.invoices.byDoctorTotals(doctorId), payload.billingKpi);
    }
  }
}

/** Viewer-scoped invoice hub KPI totals — seeds queryKeys.invoices.viewerTotals. */
export function seedInvoiceViewerBillingTotalsFromSsr(
  queryClient: QueryClient,
  payload: import("@/lib/invoice-billing-totals").InvoiceBillingTotalsPayload | null | undefined
): void {
  if (payload == null) return;
  seedIfAbsent(queryClient, queryKeys.invoices.viewerTotals, payload);
}

/** Org detail + members — seeds TanStack before detail screen hooks subscribe. */
export function seedOrganizationDetailCacheFromSsr(
  queryClient: QueryClient,
  orgId: string,
  payload: import("@/lib/organization-detail-load").OrganizationDetailPayload | null | undefined
): void {
  if (payload == null) return;
  seedIfAbsent(queryClient, queryKeys.organizations.detail(orgId), payload.org);
  seedIfAbsent(queryClient, queryKeys.organizations.members(orgId), payload.members);
}

/**
 * Single CP section SSR seed — seedIfAbsent only (no layout-effect overwrite).
 * Keys must stay aligned with useDashboardOverview, usePayments, useInvoiceScopedBilling, etc.
 */
export function seedControlPanelSectionCacheFromSsr(
  queryClient: QueryClient,
  initial: import("@/lib/control-panel-section-prefetch").ControlPanelSectionPrefetchPayload
): void {
  if (initial.invoices != null) {
    seedIfAbsent(queryClient, queryKeys.invoices.all, initial.invoices);
  }
  if (initial.patients != null) {
    seedPatientsListCacheFromSsr(queryClient, initial.patients);
  }
  if (initial.categories != null) {
    seedCategoriesListCacheFromSsr(queryClient, initial.categories);
  }
  if (initial.doctorsDirectory != null) {
    seedDoctorsDirectoryCacheFromSsr(queryClient, initial.doctorsDirectory);
  }
  if (initial.doctorUsers != null) {
    seedUsersListCacheFromSsr(queryClient, CP_DOCTOR_USERS_FILTERS, initial.doctorUsers);
  }
  if (initial.adminUsers != null) {
    seedUsersListCacheFromSsr(queryClient, CP_ADMIN_USERS_FILTERS, initial.adminUsers);
  }
  if (initial.dashboardOverview != null) {
    seedDashboardOverviewCacheFromSsr(
      queryClient,
      initial.dashboardOverview,
      initial.dashboardOverviewUpdatedAt
    );
  }
  if (initial.organizations != null) {
    seedOrganizationsListCacheFromSsr(queryClient, initial.organizations);
  }
  if (initial.notifications != null) {
    seedNotificationsCacheFromSsr(
      queryClient,
      initial.notifications,
      initial.notificationsPrefetchUpdatedAt
    );
  }
  if (initial.appointments != null) {
    seedAppointmentsListCacheFromSsr(queryClient, initial.appointments);
  }
  if (initial.assignees != null) {
    seedIfAbsent(queryClient, queryKeys.assignees.all, initial.assignees);
  }
  if (initial.dashboardAccessAccepted != null) {
    seedDashboardAccessAcceptedCacheFromSsr(queryClient, initial.dashboardAccessAccepted);
  }
  if (initial.adminAllAppointmentTypes != null) {
    seedAdminAllAppointmentTypesCacheFromSsr(queryClient, initial.adminAllAppointmentTypes);
  }
  if (initial.globalAppointmentTypes != null) {
    seedIfAbsent(queryClient, queryKeys.appointmentTypes.global, {
      types: initial.globalAppointmentTypes,
    });
  }
  if (initial.billingAppointmentOptions != null) {
    seedIfAbsent(
      queryClient,
      queryKeys.billing.appointmentOptions("", false),
      initial.billingAppointmentOptions
    );
  }
  if (initial.appointmentInvitations != null) {
    seedInvitationsCacheFromSsr(queryClient, "appointment", initial.appointmentInvitations);
  }
  if (initial.dashboardInvitations != null) {
    seedInvitationsCacheFromSsr(queryClient, "dashboard", initial.dashboardInvitations);
  }
  if (initial.googleCalendarStatus != null) {
    seedGoogleCalendarStatusCacheFromSsr(queryClient, initial.googleCalendarStatus);
  }
  if (initial.orgBillingInvoicesByOrgId != null || initial.doctorBillingByDoctorId != null) {
    seedScopedInvoiceBillingCacheFromSsr(
      queryClient,
      initial.orgBillingInvoicesByOrgId,
      initial.doctorBillingByDoctorId
    );
  }
  if (initial.invoiceViewerBillingTotals != null) {
    seedInvoiceViewerBillingTotalsFromSsr(queryClient, initial.invoiceViewerBillingTotals);
  }
}
