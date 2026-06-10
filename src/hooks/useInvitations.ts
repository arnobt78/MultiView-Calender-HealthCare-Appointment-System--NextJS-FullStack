import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, handleApiError } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { invalidateSharingAndAppointments } from "@/lib/query-client";
import { AppointmentAssignee } from "@/types/types";
import { notify } from "@/lib/notify";
import type { InvitationRequest } from "@/types/invitation";

export type DashboardInvitation = {
  id?: string;
  owner_user_id: string;
  invited_email: string;
  status?: "pending" | "accepted" | "declined";
  permission?: "read" | "write" | "full";
  invitation_token?: string;
};

export type AppointmentInvitation = AppointmentAssignee & {
  appointment_title?: string;
};

export type Invitation = AppointmentInvitation | DashboardInvitation;

interface InvitationsResponse {
  appointmentInvitations?: AppointmentInvitation[];
  dashboardInvitations?: DashboardInvitation[];
}

export function useInvitations(type: "appointment" | "dashboard") {
  const queryClient = useQueryClient();
  const invitationsKey = queryKeys.invitations.byType(type);
  const invitationsInitialData = queryClient.getQueryData<Invitation[]>(invitationsKey);

  const query = useQuery({
    queryKey: invitationsKey,
    queryFn: async () => {
      const response = await apiClient<InvitationsResponse>("/api/invitations");
      return (type === "appointment" 
        ? response.appointmentInvitations 
        : response.dashboardInvitations) || [];
    },
    initialData: invitationsInitialData,
    refetchOnMount: invitationsInitialData !== undefined ? false : true,
    // Invitations change only on explicit send/discard mutations; 30 s prevents
    // redundant fetches on rapid tab switches or re-mounts.
    staleTime: 30_000,
  });

  const sendInvitationMutation = useMutation({
    mutationFn: (request: InvitationRequest) =>
      apiClient("/api/invitations", {
        method: "POST",
        body: JSON.stringify(request),
      }),
    onSuccess: async (_, variables) => {
      await invalidateSharingAndAppointments(queryClient);
      notify.crud({ action: "created", entity: "Invitation", detail: `An invitation was sent to ${variables.email}.` });
    },
    onError: (error) => handleApiError(error, "Failed to send invitation"),
  });

  const discardAppointmentInvitationMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/appointments/${id}/permissions`, { method: "DELETE" }),
    onSuccess: async () => {
      await invalidateSharingAndAppointments(queryClient);
      notify.crud({ action: "deleted", entity: "Appointment invitation", detail: "The invitation has been removed." });
    },
    onError: (error) => handleApiError(error, "Failed to discard appointment invitation"),
  });

  const discardDashboardInvitationMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/dashboard/${id}/permissions`, { method: "DELETE" }),
    onSuccess: async () => {
      await invalidateSharingAndAppointments(queryClient);
      notify.crud({ action: "deleted", entity: "Dashboard invitation", detail: "The invitation has been removed." });
    },
    onError: (error) => handleApiError(error, "Failed to discard dashboard invitation"),
  });

  return {
    invitations: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    sendInvitation: sendInvitationMutation.mutate,
    isSending: sendInvitationMutation.isPending,
    discardAppointmentInvitation: discardAppointmentInvitationMutation.mutate,
    discardDashboardInvitation: discardDashboardInvitationMutation.mutate,
  };
}
