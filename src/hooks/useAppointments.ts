import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, handleApiError } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import {
  invalidateAfterAppointmentMutation,
  invalidateAssigneesData,
} from "@/lib/query-client";
import {
  appointmentDoctorFkOpts,
  appointmentDoctorFkOptsWithPrevious,
} from "@/lib/appointment-invalidation-fk";
import {
  fetchAssignees,
  fetchCategories,
  fetchPatients,
  fetchDashboardAccessAccepted,
  fetchAppointmentsByIds,
} from "@/lib/query-fetchers";
import { resolveExtraAssignedAppointmentIds } from "@/lib/appointments-calendar-assignees";
import { Appointment, Category, Patient, AppointmentAssignee } from "@/types/types";
import type { PortalAppointmentClinicianUser } from "@/lib/serializers";
import { buildFullAppointmentsList } from "@/lib/appointments-list-build";
import type { AppointmentDetailApiPayload } from "@/lib/appointment-detail-api";
import {
  patchAppointmentDetailCache,
  patchAppointmentDetailCacheOptimistic,
} from "@/lib/appointment-detail-cache";
import type { AppointmentDetailViewModel } from "@/lib/appointment-detail-view-model";
import { PAGINATION } from "@/lib/constants";
import { notify } from "@/lib/notify";
import { useAuth } from "./useAuth";
import { format } from "date-fns";

// This matches what the API returns natively in the app
export type FullAppointment = Appointment & {
  category_data?: Category;
  patient_data?: Patient;
  appointment_assignee?: (AppointmentAssignee & { invited_email?: string })[];
  invited_email?: string;
  /** Patient portal joins — staff links without `/api/users/search`. */
  portal_owner?: PortalAppointmentClinicianUser;
  portal_treating_physician?: PortalAppointmentClinicianUser;
};

function formatAppointmentRange(start?: string, end?: string) {
  if (!start || !end) return "Date and time saved.";
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return "Date and time saved.";
  }
  return `${format(startDate, "dd.MM.yyyy")} · ${format(startDate, "HH:mm")} - ${format(endDate, "HH:mm")}`;
}

function getSafeAppointmentTitle(appt?: Partial<Appointment> | null) {
  return appt?.title?.trim() ? appt.title : "Untitled";
}

function getStatusLabel(status?: string | null) {
  if (status === "done") return "done";
  if (status === "alert") return "alert";
  return "pending";
}

/**
 * Human-readable PATCH field names for toast copy. Supports B2 `treating_physician` (wire) and
 * `treating_physician_id` (Prisma-shaped) without duplicate labels.
 */
function getUpdatedFieldLabels(
  updateData: Partial<Appointment> & { treating_physician?: string | null }
) {
  const pairs: Array<[string, string]> = [
    ["title", "Title"],
    ["start", "Start"],
    ["end", "End"],
    ["patient", "Client"],
    ["category", "Category"],
    ["location", "Location"],
    ["notes", "Notes"],
    ["status", "Status"],
    ["attachments", "Attachments"],
    ["treating_physician_id", "Treating physician"],
    ["treating_physician", "Treating physician"],
  ];
  const labels: string[] = [];
  for (const [key, label] of pairs) {
    if (key in updateData && !labels.includes(label)) labels.push(label);
  }
  return labels;
}

export function useAppointments() {
  const queryClient = useQueryClient();

  const { user, isLoading: isAuthLoading } = useAuth();

  const query = useQuery({
    queryKey: queryKeys.appointments.all,
    queryFn: async () => {
      if (!user) return [];

      const [categories, patients, allAssignees, ownedRes] = await Promise.all([
        queryClient.ensureQueryData({
          queryKey: queryKeys.categories.all,
          queryFn: fetchCategories,
        }),
        queryClient.ensureQueryData({
          queryKey: queryKeys.patients.all,
          queryFn: fetchPatients,
        }),
        queryClient.ensureQueryData({
          queryKey: queryKeys.assignees.all,
          queryFn: fetchAssignees,
        }),
        apiClient<{ appointments: Appointment[] }>(
          `/api/appointments?limit=${PAGINATION.CALENDAR_APPOINTMENTS_LIMIT}`
        ),
      ]);

      await queryClient.ensureQueryData({
        queryKey: queryKeys.dashboardAccess.accepted,
        queryFn: fetchDashboardAccessAccepted,
      });

      const owned = ownedRes.appointments || [];

      const extraAssignedIds = resolveExtraAssignedAppointmentIds(
        owned,
        allAssignees,
        user.id,
        user.email
      ).slice(0, PAGINATION.CALENDAR_ASSIGNED_BATCH_LIMIT);

      const assignedAppointmentsData = await fetchAppointmentsByIds(extraAssignedIds);

      return buildFullAppointmentsList({
        userId: user.id,
        userEmail: user.email,
        userRole: user.role ?? "",
        categories,
        patients,
        assignees: allAssignees,
        ownedAppointments: owned,
        assignedAppointmentRows: assignedAppointmentsData,
      });
    },
    enabled: !!user,
    // Appointments are invalidated after every create/update/delete/toggle mutation;
    // 30 s prevents redundant re-fetches on rapid view switches.
    staleTime: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: (newAppointment: Partial<Appointment>) =>
      apiClient<AppointmentDetailApiPayload>("/api/appointments", {
        method: "POST",
        body: JSON.stringify(newAppointment),
      }),
    onSuccess: async (data) => {
      const appointment = data.appointment as FullAppointment;
      if (data.detail && appointment?.id) {
        patchAppointmentDetailCache(queryClient, appointment.id, data.detail);
      }
      await invalidateAfterAppointmentMutation(queryClient, {
        appointmentId: appointment?.id,
        patientId: appointment?.patient ?? undefined,
        categoryId: appointment?.category ?? undefined,
        ...appointmentDoctorFkOpts(appointment),
      });
      notify.crud({
        action: "created",
        entity: "Appointment",
        detail: `"${getSafeAppointmentTitle(appointment)}" scheduled for ${formatAppointmentRange(
          appointment?.start,
          appointment?.end
        )}.`,
      });
    },
    onError: (error) => handleApiError(error, "Failed to create appointment"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...updateData }: Partial<Appointment> & { id: string }) =>
      apiClient<AppointmentDetailApiPayload>(`/api/appointments/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updateData),
      }),
    onMutate: async (variables) => {
      const current = queryClient.getQueryData<FullAppointment[]>(queryKeys.appointments.all) || [];
      const previous = current.find((appt) => appt.id === variables.id) ?? null;
      const previousDetail = queryClient.getQueryData<AppointmentDetailViewModel>(
        queryKeys.appointments.detail(variables.id)
      );
      patchAppointmentDetailCacheOptimistic(queryClient, variables.id, variables);
      return { previous, previousDetail };
    },
    onSuccess: async (data, variables, context) => {
      const appointment = data.appointment as FullAppointment;
      if (data.detail) {
        patchAppointmentDetailCache(queryClient, variables.id, data.detail);
      }
      const updatedLabels = getUpdatedFieldLabels(variables);
      await invalidateAfterAppointmentMutation(queryClient, {
        appointmentId: appointment?.id,
        patientId: appointment?.patient ?? undefined,
        categoryId: appointment?.category ?? undefined,
        previousPatientId: context?.previous?.patient ?? undefined,
        previousCategoryId: context?.previous?.category ?? undefined,
        ...appointmentDoctorFkOptsWithPrevious(appointment, context?.previous),
      });
      notify.crud({
        action: "updated",
        entity: "Appointment",
        detail:
          updatedLabels.length > 0
            ? `"${getSafeAppointmentTitle(appointment)}" updated fields: ${updatedLabels.join(", ")}.`
            : `"${getSafeAppointmentTitle(appointment)}" has been saved.`,
      });
    },
    onError: (error, variables, context) => {
      if (context?.previousDetail) {
        patchAppointmentDetailCache(queryClient, variables.id, context.previousDetail);
      }
      handleApiError(error, "Failed to update appointment");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => 
      apiClient(`/api/appointments/${id}`, { method: "DELETE" }),
    onMutate: async (deletedId) => {
      const current = queryClient.getQueryData<FullAppointment[]>(queryKeys.appointments.all) || [];
      const deleted = current.find((appt) => appt.id === deletedId) || null;
      return { deleted };
    },
    onSuccess: async (_, deletedId, context) => {
      // Dashboard/overview is already busted inside `invalidateAfterAppointmentMutation`
      // (via `invalidateInvoicesAndOverview`); assignee rows are a separate cache tree.
      await Promise.all([
        invalidateAfterAppointmentMutation(queryClient, {
          appointmentId: deletedId,
          patientId: context?.deleted?.patient ?? undefined,
          categoryId: context?.deleted?.category ?? undefined,
          ...appointmentDoctorFkOptsWithPrevious(null, context?.deleted),
        }),
        invalidateAssigneesData(queryClient),
      ]);

      queryClient.setQueryData<FullAppointment[]>(queryKeys.appointments.all, (old) =>
        old ? old.filter((appt) => appt.id !== deletedId) : []
      );

      const deleted = context?.deleted;
      notify.crud({
        action: "deleted",
        entity: "Appointment",
        detail: deleted
          ? `"${getSafeAppointmentTitle(deleted)}" (${formatAppointmentRange(
              deleted.start,
              deleted.end
            )}) was removed from your calendar.`
          : "The selected appointment was removed from your calendar.",
      });
    },
    onError: (error) => handleApiError(error, "Failed to delete appointment"),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "pending" | "done" | "alert" }) =>
      apiClient<AppointmentDetailApiPayload>(`/api/appointments/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.appointments.all });

      const previousAppointments = queryClient.getQueryData<FullAppointment[]>(
        queryKeys.appointments.all
      );
      const previousDetail = queryClient.getQueryData<AppointmentDetailViewModel>(
        queryKeys.appointments.detail(id)
      );

      if (previousAppointments) {
        queryClient.setQueryData<FullAppointment[]>(
          queryKeys.appointments.all,
          previousAppointments.map((appt) => (appt.id === id ? { ...appt, status } : appt))
        );
      }
      patchAppointmentDetailCacheOptimistic(queryClient, id, { id, status });
      return { previousAppointments, previousDetail };
    },
    onSuccess: async (data) => {
      const appt = data.appointment as FullAppointment;
      if (data.detail) {
        patchAppointmentDetailCache(queryClient, appt.id, data.detail);
      }
      queryClient.setQueryData<FullAppointment[]>(queryKeys.appointments.all, (old = []) =>
        old.map((item) => (item.id === appt.id ? { ...item, ...appt } : item))
      );
      // Status changes affect done/pending/alert counters in overview and insights by-status chart.
      // The PATCH handler also creates a notification row — invalidate so the bell reflects it instantly.
      // Portal timeline reads appointment status — invalidate so patient-facing portal refetches without navigation.
      // Status labels can affect scheduling UX copy; also bust slot/type caches so any UI that keys off
      // `invalidateAfterAppointmentMutation` stays on the same invalidation contract as full PATCH flows.
      await invalidateAfterAppointmentMutation(queryClient, {
        appointmentId: appt.id,
        patientId: appt.patient ?? undefined,
        categoryId: appt.category ?? undefined,
        ...appointmentDoctorFkOpts(appt),
      });
      notify.crud({
        action: "updated",
        entity: "Appointment status",
        detail: `"${getSafeAppointmentTitle(appt)}" is now ${getStatusLabel(appt?.status)} (${formatAppointmentRange(appt?.start, appt?.end)}).`,
      });
    },
    onError: (error, variables, context) => {
      if (context?.previousAppointments) {
        queryClient.setQueryData(queryKeys.appointments.all, context.previousAppointments);
      }
      if (context?.previousDetail) {
        patchAppointmentDetailCache(queryClient, variables.id, context.previousDetail);
      }
      handleApiError(error, "Failed to update status");
    },
  });

  return {
    appointments: query.data || [],
    isLoading:
      // Keep skeleton visible while:
      //   1. Auth session is resolving (isAuthLoading)
      //   2. user is null — covers the async localStorage persister window where
      //      isAuthLoading may have flipped false but user data is not yet hydrated
      //   3. user exists and query is loading or first-fetch with no cached rows
      isAuthLoading ||
      !user ||
      (!!user && (query.isLoading || (query.isFetching && !query.data?.length))),
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    // Mutations
    createAppointment: createMutation.mutate,
    createAppointmentAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateAppointment: updateMutation.mutate,
    updateAppointmentAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteAppointment: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    toggleStatus: toggleStatusMutation.mutate,
    isTogglingStatus: toggleStatusMutation.isPending,
  };
}

export function useSearchAppointments(query: string) {
  return useQuery({
    queryKey: queryKeys.appointments.search(query),
    queryFn: async () => {
      if (query.length < 2) return [];
      const response = await apiClient<{ appointments: FullAppointment[] }>(
        `/api/appointments/search?query=${encodeURIComponent(query)}`
      );
      return response.appointments || [];
    },
    enabled: query.length >= 2, // Only run query if 2+ chars
    staleTime: 60 * 1000,
  });
}
