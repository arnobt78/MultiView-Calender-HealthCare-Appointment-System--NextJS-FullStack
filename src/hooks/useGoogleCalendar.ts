import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, handleApiError } from "@/lib/api-client";
import { notify } from "@/lib/notify";
import { queryKeys } from "@/lib/query-keys";
import {
  invalidateAfterAppointmentMutation,
  invalidateGoogleCalendarAndCrossTab,
} from "@/lib/query-client";
import {
  countUpcomingGoogleCalendarEvents,
  sortGoogleCalendarEventsByStart,
} from "@/lib/google-calendar-display";
import type { GoogleCalendarStatus } from "@/types/google-calendar";

export type { GoogleCalendarEvent, GoogleCalendarStatus } from "@/types/google-calendar";

export function useGoogleCalendar() {
  const queryClient = useQueryClient();
  const statusKey = [...queryKeys.googleCalendar.root, "status"] as const;
  const statusInitialData = queryClient.getQueryData<GoogleCalendarStatus>(statusKey);

  const statusQuery = useQuery({
    queryKey: statusKey,
    queryFn: async () => {
      try {
        const data = await apiClient<{ events?: GoogleCalendarStatus["events"] }>(
          "/api/calendar/sync"
        );
        return { connected: true, events: data.events || [] };
      } catch {
        return { connected: false, events: [] };
      }
    },
    initialData: statusInitialData,
    refetchOnMount: statusInitialData !== undefined ? false : true,
    staleTime: 60_000,
  });

  const events = useMemo(
    () => sortGoogleCalendarEventsByStart(statusQuery.data?.events ?? []),
    [statusQuery.data?.events]
  );

  const eventCount = events.length;
  const upcomingCount = useMemo(() => countUpcomingGoogleCalendarEvents(events), [events]);

  const syncMutation = useMutation({
    mutationFn: (appointmentId: string) =>
      apiClient("/api/calendar/sync", {
        method: "POST",
        body: JSON.stringify({ appointmentId }),
      }),
    onSuccess: async () => {
      notify.crud({
        action: "created",
        entity: "Google Calendar sync",
        detail: "Appointment changes are now mirrored in Google Calendar.",
      });
      await invalidateGoogleCalendarAndCrossTab(queryClient);
    },
    onError: (error) => handleApiError(error, "Failed to sync to Google Calendar"),
  });

  const disconnectMutation = useMutation({
    mutationFn: () => apiClient("/api/calendar/sync", { method: "DELETE" }),
    onSuccess: async () => {
      notify.crud({
        action: "deleted",
        entity: "Google Calendar",
        detail: "Calendar sync has been turned off.",
      });
      await invalidateGoogleCalendarAndCrossTab(queryClient);
    },
    onError: (error) => handleApiError(error, "Failed to disconnect Google Calendar"),
  });

  const importMutation = useMutation({
    mutationFn: async ({ file, treatingPhysicianId }: { file: File; treatingPhysicianId?: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      if (treatingPhysicianId) {
        formData.append("treating_physician_id", treatingPhysicianId);
      }
      const response = await fetch("/api/calendar/import", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Import failed");
      return response.json() as Promise<{ imported: number }>;
    },
    onSuccess: async (data) => {
      notify.crud({
        action: "imported",
        entity: "Appointments",
        detail: `${data.imported} appointment(s) were imported from your calendar file.`,
      });
      await invalidateAfterAppointmentMutation(queryClient, { bustAllCategorySnapshots: true });
    },
    onError: (error) => handleApiError(error, "Failed to import calendar"),
  });

  return {
    isConnected: statusQuery.data?.connected ?? false,
    events,
    eventCount,
    upcomingCount,
    isLoading: statusQuery.isLoading,
    isFetching: statusQuery.isFetching,
    refreshStatus: () => statusQuery.refetch(),
    syncToGoogle: syncMutation.mutate,
    isSyncing: syncMutation.isPending,
    syncingAppointmentId:
      syncMutation.isPending && syncMutation.variables ? syncMutation.variables : null,
    disconnect: disconnectMutation.mutate,
    isDisconnecting: disconnectMutation.isPending,
    importICS: (file: File) => importMutation.mutate({ file }),
    importICSWithDoctor: (file: File, treatingPhysicianId: string) =>
      importMutation.mutate({ file, treatingPhysicianId }),
    isImporting: importMutation.isPending,
    exportUrl: "/api/calendar/export",
  };
}
