import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { UserListFilters, UsersListResponse } from "@/hooks/useUsers";
import type { ControlPanelSectionPrefetchPayload } from "@/lib/control-panel-section-prefetch";
import { CP_ADMIN_USERS_FILTERS } from "@/lib/control-panel-users-filters";
import {
  seedCategoriesListCacheFromSsr,
  seedDoctorsDirectoryCacheFromSsr,
  seedPatientsListCacheFromSsr,
  seedUsersListCacheFromSsr,
} from "@/lib/cp-list-query-ssr-seed";
import { seedInvoicesListCacheFromSsr } from "@/lib/invoices-query-ssr-seed";

/** Seed GET /api/invoices list cache — query key must match `usePayments` / `useInvoice`. */
export function seedInvoicesListCache(
  queryClient: QueryClient,
  invoices: import("@/hooks/usePayments").Invoice[]
): void {
  queryClient.setQueryData(queryKeys.invoices.all, invoices);
}

/** Seed GET /api/users list cache — query key must match `useUsers(filters)`. */
export function seedUsersListCache(
  queryClient: QueryClient,
  filters: UserListFilters,
  data: UsersListResponse
): void {
  queryClient.setQueryData([...queryKeys.users.all, filters], data);
}

/**
 * Seed TanStack cache from CP section SSR prefetch before first paint.
 * Keys must stay aligned with useDashboardOverview, usePatients, usePayments, etc.
 */
export function seedControlPanelSectionCache(
  queryClient: QueryClient,
  initial: ControlPanelSectionPrefetchPayload
): void {
  if (initial.dashboardOverview != null) {
    queryClient.setQueryData(queryKeys.dashboard.overview, initial.dashboardOverview);
  }
  if (initial.patients != null) {
    seedPatientsListCacheFromSsr(queryClient, initial.patients);
  }
  if (initial.categories != null) {
    seedCategoriesListCacheFromSsr(queryClient, initial.categories);
  }
  if (initial.organizations != null) {
    queryClient.setQueryData(queryKeys.organizations.all, initial.organizations);
  }
  if (initial.adminAllAppointmentTypes != null) {
    queryClient.setQueryData(
      queryKeys.appointmentTypes.all,
      initial.adminAllAppointmentTypes
    );
  }
  if (initial.globalAppointmentTypes != null) {
    queryClient.setQueryData(queryKeys.appointmentTypes.global, {
      types: initial.globalAppointmentTypes,
    });
  }
  if (initial.invoices != null) {
    seedInvoicesListCacheFromSsr(queryClient, initial.invoices);
  }
  if (initial.billingAppointmentOptions != null) {
    queryClient.setQueryData(
      queryKeys.billing.appointmentOptions("", false),
      initial.billingAppointmentOptions
    );
  }
  if (initial.notifications != null) {
    queryClient.setQueryData(queryKeys.notifications.all, initial.notifications);
  }
  if (initial.appointments != null) {
    queryClient.setQueryData(queryKeys.appointments.all, initial.appointments);
  }
  if (initial.assignees != null) {
    queryClient.setQueryData(queryKeys.assignees.all, initial.assignees);
  }
  if (initial.dashboardAccessAccepted != null) {
    queryClient.setQueryData(
      queryKeys.dashboardAccess.accepted,
      initial.dashboardAccessAccepted
    );
  }
  if (initial.doctorsDirectory != null) {
    seedDoctorsDirectoryCacheFromSsr(queryClient, initial.doctorsDirectory);
  }
  if (initial.adminUsers != null) {
    seedUsersListCacheFromSsr(queryClient, CP_ADMIN_USERS_FILTERS, initial.adminUsers);
  }
  if (initial.orgBillingInvoicesByOrgId) {
    for (const [orgId, payload] of Object.entries(initial.orgBillingInvoicesByOrgId)) {
      queryClient.setQueryData(queryKeys.invoices.byOrganization(orgId), payload);
      queryClient.setQueryData(queryKeys.invoices.byOrganizationTotals(orgId), {
        totals: payload.totals,
        statusTotals: payload.statusTotals,
      });
    }
  }
  if (initial.appointmentInvitations != null) {
    queryClient.setQueryData(
      queryKeys.invitations.byType("appointment"),
      initial.appointmentInvitations
    );
  }
  if (initial.dashboardInvitations != null) {
    queryClient.setQueryData(
      queryKeys.invitations.byType("dashboard"),
      initial.dashboardInvitations
    );
  }
  if (initial.googleCalendarStatus != null) {
    queryClient.setQueryData(
      [...queryKeys.googleCalendar.root, "status"] as const,
      initial.googleCalendarStatus
    );
  }
}
