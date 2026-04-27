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
    // Poll every 30 seconds for new notifications
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient("/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ id }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
    onError: (error) => handleApiError(error, "Failed to mark notification as read"),
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () =>
      apiClient("/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ markAllRead: true }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      notify.info({ title: "Notifications updated", subtitle: "All notifications were marked as read." });
    },
    onError: (error) => handleApiError(error, "Failed to mark notifications as read"),
  });

  return {
    notifications: query.data?.notifications || [],
    total: query.data?.total || 0,
    unreadCount: query.data?.unreadCount || 0,
    isLoading: query.isLoading,
    refetch: query.refetch,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingRead: markAsReadMutation.isPending,
  };
}
