import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, handleApiError } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { AppointmentAssignee } from "@/types/types";
import { toast } from "sonner";
import { InvitationRequest, InvitationType } from "@/types/invitation";

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
  [key: string]: any; // Catch-all for other fields the API might send
}

export function useInvitations(type: "appointment" | "dashboard") {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.invitations.byType(type),
    queryFn: async () => {
      const response = await apiClient<InvitationsResponse>("/api/invitations");
      return (type === "appointment" 
        ? response.appointmentInvitations 
        : response.dashboardInvitations) || [];
    },
  });

  const sendInvitationMutation = useMutation({
    mutationFn: (request: InvitationRequest) => 
      apiClient("/api/invitations", {
        method: "POST",
        body: JSON.stringify(request),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations.byType(variables.type) });
      toast.success(`Invitation sent to ${variables.email}`);
    },
    onError: (error) => handleApiError(error, "Failed to send invitation"),
  });

  const discardAppointmentInvitationMutation = useMutation({
    mutationFn: (id: string) => 
      apiClient(`/api/appointments/${id}/permissions`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations.byType("appointment") });
      toast.success("Appointment invitation discarded");
    },
    onError: (error) => handleApiError(error, "Failed to discard appointment invitation"),
  });

  const discardDashboardInvitationMutation = useMutation({
    mutationFn: (id: string) => 
      apiClient(`/api/dashboard/${id}/permissions`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations.byType("dashboard") });
      toast.success("Dashboard invitation discarded");
    },
    onError: (error) => handleApiError(error, "Failed to discard dashboard invitation"),
  });

  return {
    invitations: query.data || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    sendInvitation: sendInvitationMutation.mutate,
    isSending: sendInvitationMutation.isPending,
    discardAppointmentInvitation: discardAppointmentInvitationMutation.mutate,
    discardDashboardInvitation: discardDashboardInvitationMutation.mutate,
  };
}
