import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";

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

/** After patient / relative / category CRUD — denormalized appointment list must refetch */
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
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: key }),
    queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all }),
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

/** Users list/detail — control panel */
export async function invalidateUsersAndAuth(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.me }),
  ]);
}

/** Organizations — lists and nested member queries */
export async function invalidateOrganizations(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
}

/** Invoices + dashboard overview KPIs */
export async function invalidateInvoicesAndOverview(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all }),
    invalidateDashboardOverview(queryClient),
  ]);
}

/** Appointment CRUD, ICS import — calendar + activity log + optional notifications */
export async function invalidateAfterAppointmentMutation(queryClient: QueryClient) {
  await Promise.all([
    invalidateAppointmentData(queryClient),
    invalidateActivitiesList(queryClient),
    invalidateNotificationsData(queryClient),
  ]);
}

/** Assignee or per-appointment activity changes from dialog */
export async function invalidateAssigneesActivitiesAppointment(
  queryClient: QueryClient,
  appointmentId?: string | null
) {
  await Promise.all([
    invalidateAssigneesData(queryClient),
    invalidateAppointmentData(queryClient),
    invalidateActivitiesList(queryClient),
  ]);
  if (appointmentId) {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.activities.byAppointment(appointmentId),
    });
  }
}
