import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, handleApiError } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import {
  invalidateAfterAppointmentMutation,
  invalidateActivitiesList,
  invalidateNotificationsData,
} from "@/lib/query-client";
import {
  fetchAssignees,
  fetchCategories,
  fetchActivitiesList,
  fetchPatients,
  fetchDashboardAccessAccepted,
} from "@/lib/query-fetchers";
import { Appointment, Category, Patient, AppointmentAssignee, Activity } from "@/types/types";
import { notify } from "@/lib/notify";
import { useAuth } from "./useAuth";
import { format } from "date-fns";

// This matches what the API returns natively in the app
export type FullAppointment = Appointment & {
  category_data?: Category;
  patient_data?: Patient;
  appointment_assignee?: (AppointmentAssignee & { invited_email?: string })[];
  invited_email?: string;
  activities?: Activity[];
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

function getUpdatedFieldLabels(updateData: Partial<Appointment>) {
  const labels: Array<{ key: keyof Partial<Appointment>; label: string }> = [
    { key: "title", label: "Title" },
    { key: "start", label: "Start" },
    { key: "end", label: "End" },
    { key: "patient", label: "Client" },
    { key: "category", label: "Category" },
    { key: "location", label: "Location" },
    { key: "notes", label: "Notes" },
    { key: "status", label: "Status" },
    { key: "attachements", label: "Attachments" },
  ];
  return labels
    .filter(({ key }) => key in updateData)
    .map(({ label }) => label);
}

export function useAppointments() {
  const queryClient = useQueryClient();

  const { user, isLoading: isAuthLoading } = useAuth();

  const query = useQuery({
    queryKey: queryKeys.appointments.all,
    queryFn: async () => {
      if (!user) return [];

      const [categories, patients, allAssignees, allActivities, ownedRes] = await Promise.all([
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
        queryClient.ensureQueryData({
          queryKey: queryKeys.activities.list,
          queryFn: fetchActivitiesList,
        }),
        apiClient<{ appointments: Appointment[] }>("/api/appointments"),
      ]);

      await queryClient.ensureQueryData({
        queryKey: queryKeys.dashboardAccess.accepted,
        queryFn: fetchDashboardAccessAccepted,
      });

      const owned = ownedRes.appointments || [];

      // 2. Join for owned appointments
      const ownedWithDetails: FullAppointment[] = owned.map((appt) => ({
        ...appt,
        category_data: categories.find((c) => c.id === appt.category),
        patient_data: patients.find((p) => p.id === appt.patient),
        appointment_assignee: allAssignees.filter((a) => a.appointment === appt.id),
        activities: allActivities.filter((act) => act.appointment === appt.id),
      }));

      // 3. Find assigned appointments (user id or email)
      const assignedByUser = allAssignees.filter(
        (a) => a.user === user.id && a.status === "accepted"
      );
      const assignedByEmail = user.email
        ? allAssignees.filter((a) => a.invited_email === user.email && a.status === "accepted")
        : [];

      const assignedAppointmentIds = [
        ...assignedByUser.map((a) => a.appointment),
        ...assignedByEmail.map((a) => a.appointment),
      ].filter(Boolean);
      const uniqueAppointmentIds = [...new Set(assignedAppointmentIds)];

      // Fetch the actual assigned appointment details
      const assignedAppointmentsData = await Promise.all(
        uniqueAppointmentIds.map(async (apptId) => {
          try {
            const res = await apiClient<{ appointment: Appointment }>(`/api/appointments/${apptId}`);
            return res.appointment;
          } catch {
            return null;
          }
        })
      );

      const assignedAppointments: FullAppointment[] = assignedAppointmentsData
        .filter((a): a is Appointment => a !== null)
        .map((appt) => {
          const relatedAssignees = [
            ...assignedByUser.filter((a) => a.appointment === appt.id),
            ...assignedByEmail.filter((a) => a.appointment === appt.id),
          ].filter(
            (a) =>
              typeof a.permission === "string" && ["read", "write", "full"].includes(a.permission)
          );

          return {
            ...appt,
            category_data: categories.find((c) => c.id === appt.category),
            patient_data: patients.find((p) => p.id === appt.patient),
            appointment_assignee: relatedAssignees,
            activities: allActivities.filter((act) => act.appointment === appt.id),
          };
        });

      // 4. Merge and deduplicate
      const allAppointments = [...ownedWithDetails, ...assignedAppointments];
      
      const deduped = allAppointments.reduce((acc: FullAppointment[], curr) => {
        if (!curr || !curr.id) return acc;
        const existing = acc.find((a) => a.id === curr.id);
        if (existing) {
          existing.appointment_assignee = [
            ...(existing.appointment_assignee || []),
            ...(curr.appointment_assignee || [])
          ].filter((v, i, arr) => v && v.id && arr.findIndex((b) => b.id === v.id) === i);
        } else {
          acc.push({ ...curr });
        }
        return acc;
      }, []);

      return deduped;
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (newAppointment: Partial<Appointment>) => 
      apiClient<{ appointment: FullAppointment }>("/api/appointments", {
        method: "POST",
        body: JSON.stringify(newAppointment),
      }),
    onSuccess: async (data) => {
      const appointment = data.appointment;
      await invalidateAfterAppointmentMutation(queryClient);
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
      apiClient<{ appointment: FullAppointment }>(`/api/appointments/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updateData),
      }),
    onSuccess: async (data, variables) => {
      const appointment = data.appointment;
      const updatedLabels = getUpdatedFieldLabels(variables);
      await invalidateAfterAppointmentMutation(queryClient);
      notify.crud({
        action: "updated",
        entity: "Appointment",
        detail:
          updatedLabels.length > 0
            ? `"${getSafeAppointmentTitle(appointment)}" updated fields: ${updatedLabels.join(", ")}.`
            : `"${getSafeAppointmentTitle(appointment)}" has been saved.`,
      });
    },
    onError: (error) => handleApiError(error, "Failed to update appointment"),
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
      queryClient.setQueryData<FullAppointment[]>(queryKeys.appointments.all, (old) =>
        old ? old.filter((appt) => appt.id !== deletedId) : []
      );
      await Promise.all([
        invalidateActivitiesList(queryClient),
        invalidateNotificationsData(queryClient),
      ]);
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
      apiClient<{ appointment: FullAppointment }>(`/api/appointments/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onMutate: async ({ id, status }) => {
      // Cancel any outgoing refetches to avoid overwriting optimisitic update
      await queryClient.cancelQueries({ queryKey: queryKeys.appointments.all });
      
      // Snapshot previous value
      const previousAppointments = queryClient.getQueryData<FullAppointment[]>(queryKeys.appointments.all);
      
      // Optimistically update
      if (previousAppointments) {
        queryClient.setQueryData<FullAppointment[]>(queryKeys.appointments.all, 
          previousAppointments.map((appt) => 
            appt.id === id ? { ...appt, status } : appt
          )
        );
      }
      return { previousAppointments };
    },
    onSuccess: (data) => {
      const appt = data.appointment;
      queryClient.setQueryData<FullAppointment[]>(queryKeys.appointments.all, (old = []) =>
        old.map((item) => (item.id === appt.id ? { ...item, ...appt } : item))
      );
      notify.success({
        title: "Status updated",
        subtitle: `"${getSafeAppointmentTitle(appt)}" is now marked as ${getStatusLabel(
          appt?.status
        )} (${formatAppointmentRange(appt?.start, appt?.end)}).`,
      });
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousAppointments) {
        queryClient.setQueryData(queryKeys.appointments.all, context.previousAppointments);
      }
      handleApiError(error, "Failed to update status");
    },
  });

  return {
    appointments: query.data || [],
    isLoading:
      isAuthLoading ||
      (!!user && (query.isLoading || (query.isFetching && !query.data?.length))),
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    // Mutations
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
