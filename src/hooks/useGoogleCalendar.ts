import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, handleApiError } from "@/lib/api-client";
import { notify } from "@/lib/notify";
import { queryKeys } from "@/lib/query-keys";
import { invalidateAfterAppointmentMutation, invalidateGoogleCalendarData } from "@/lib/query-client";

/** Minimal shape for a Google Calendar event as returned by the sync API. */
interface GoogleCalendarEvent {
  id?: string;
  summary?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  [key: string]: unknown; // additional fields are forwarded as-is from the Google API
}

interface GoogleCalendarStatus {
  connected: boolean;
  events?: GoogleCalendarEvent[];
}

export function useGoogleCalendar() {
  const queryClient = useQueryClient();

  const statusQuery = useQuery({
    queryKey: [...queryKeys.googleCalendar.root, "status"] as const,
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
    onSuccess: async () => {
      notify.crud({ action: "created", entity: "Google Calendar sync", detail: "Appointment changes are now mirrored in Google Calendar." });
      await invalidateGoogleCalendarData(queryClient);
    },
    onError: (error) => handleApiError(error, "Failed to sync to Google Calendar"),
  });

  const disconnectMutation = useMutation({
    mutationFn: () =>
      apiClient("/api/calendar/sync", { method: "DELETE" }),
    onSuccess: async () => {
      notify.crud({ action: "deleted", entity: "Google Calendar", detail: "Calendar sync has been turned off." });
      await invalidateGoogleCalendarData(queryClient);
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
    onSuccess: async (data) => {
      notify.crud({ action: "imported", entity: "Appointments", detail: `${data.imported} appointment(s) were imported from your calendar file.` });
      /*
       * Full invalidation after ICS import — same chain as a manual appointment create:
       * appointments + activities + notifications + availability + invoices + dashboard overview + patients.
       * Previously only invalidated `appointments.all`, leaving dashboard counts stale.
       */
      await invalidateAfterAppointmentMutation(queryClient, { bustAllCategorySnapshots: true });
    },
    onError: (error) => handleApiError(error, "Failed to import calendar"),
  });

  return {
    isConnected: statusQuery.data?.connected ?? false,
    events: statusQuery.data?.events ?? [],
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
