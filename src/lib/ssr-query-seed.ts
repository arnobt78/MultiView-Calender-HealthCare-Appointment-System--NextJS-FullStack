import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { UserListFilters, UsersListResponse } from "@/hooks/useUsers";
import type { ControlPanelSectionPrefetchPayload } from "@/lib/control-panel-section-prefetch";

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
    queryClient.setQueryData(queryKeys.patients.all, initial.patients);
  }
  if (initial.categories != null) {
    queryClient.setQueryData(queryKeys.categories.all, initial.categories);
  }
  if (initial.organizations != null) {
    queryClient.setQueryData(queryKeys.organizations.all, initial.organizations);
  }
  if (initial.globalAppointmentTypes != null) {
    queryClient.setQueryData(queryKeys.appointmentTypes.global, {
      types: initial.globalAppointmentTypes,
    });
  }
  if (initial.invoices != null) {
    queryClient.setQueryData(queryKeys.invoices.all, initial.invoices);
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
    queryClient.setQueryData(queryKeys.doctors.all, initial.doctorsDirectory);
  }
}
