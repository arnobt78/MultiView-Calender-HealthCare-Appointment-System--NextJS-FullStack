import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, handleApiError } from "@/lib/api-client";
import { notify } from "@/lib/notify";

interface GoogleCalendarStatus {
  connected: boolean;
  events?: any[];
}

export function useGoogleCalendar() {
  const queryClient = useQueryClient();

  const statusQuery = useQuery({
    queryKey: ["app", "google-calendar", "status"],
    queryFn: async () => {
      try {
        const data = await apiClient<GoogleCalendarStatus>("/api/calendar/sync");
        return { connected: true, events: data.events || [] };
      } catch {
        return { connected: false, events: [] };
      }
    },
    staleTime: 60_000,
  });

  const syncMutation = useMutation({
    mutationFn: (appointmentId: string) =>
      apiClient("/api/calendar/sync", {
        method: "POST",
        body: JSON.stringify({ appointmentId }),
      }),
    onSuccess: () => {
      notify.success({ title: "Synced to Google Calendar", subtitle: "Appointment changes are now mirrored in Google Calendar." });
      queryClient.invalidateQueries({ queryKey: ["app", "google-calendar"] });
    },
    onError: (error) => handleApiError(error, "Failed to sync to Google Calendar"),
  });

  const disconnectMutation = useMutation({
    mutationFn: () =>
      apiClient("/api/calendar/sync", { method: "DELETE" }),
    onSuccess: () => {
      notify.warning({ title: "Google Calendar disconnected", subtitle: "Calendar sync has been turned off." });
      queryClient.invalidateQueries({ queryKey: ["app", "google-calendar"] });
    },
    onError: (error) => handleApiError(error, "Failed to disconnect Google Calendar"),
  });

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/calendar/import", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Import failed");
      return response.json();
    },
    onSuccess: (data) => {
      notify.crud({ action: "imported", entity: "Appointments", detail: `${data.imported} appointment(s) were imported from your calendar file.` });
      queryClient.invalidateQueries({ queryKey: ["app", "appointments"] });
    },
    onError: (error) => handleApiError(error, "Failed to import calendar"),
  });

  return {
    isConnected: statusQuery.data?.connected || false,
    events: statusQuery.data?.events || [],
    isLoading: statusQuery.isLoading,
    syncToGoogle: syncMutation.mutate,
    isSyncing: syncMutation.isPending,
    disconnect: disconnectMutation.mutate,
    isDisconnecting: disconnectMutation.isPending,
    importICS: importMutation.mutate,
    isImporting: importMutation.isPending,
    exportUrl: "/api/calendar/export",
  };
}
