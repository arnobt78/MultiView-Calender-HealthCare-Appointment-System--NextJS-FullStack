import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, handleApiError } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { Notification } from "@/types/notification";
import { notify } from "@/lib/notify";

interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
}

export function useNotifications() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: async () => {
      const data = await apiClient<NotificationsResponse>("/api/notifications?limit=50");
      return data;
    },
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnMount: false,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient("/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ id }),
      }),
    onSuccess: async () => {
      // Await so the badge count and list refetch before onSuccess resolves.
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
    onError: (error) => handleApiError(error, "Failed to mark notification as read"),
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () =>
      apiClient("/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ markAllRead: true }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      notify.crud({ action: "updated", entity: "Notifications", detail: "All notifications were marked as read." });
    },
    onError: (error) => handleApiError(error, "Failed to mark notifications as read"),
  });

  const deleteReadMutation = useMutation({
    mutationFn: () =>
      apiClient("/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ deleteRead: true }),
      }),
    onSuccess: async () => {
      // Await so header badge and list both update before the toast appears.
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      notify.crud({ action: "deleted", entity: "Read notifications", detail: "Unread notifications were kept." });
    },
    onError: (error) => handleApiError(error, "Failed to delete read notifications"),
  });

  return {
    notifications: query.data?.notifications || [],
    total: query.data?.total || 0,
    unreadCount: query.data?.unreadCount || 0,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteRead: deleteReadMutation.mutate,
    isMarkingRead: markAsReadMutation.isPending,
    isDeletingRead: deleteReadMutation.isPending,
  };
}
