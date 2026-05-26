import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, handleApiError } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { Notification } from "@/types/notification";
import { notify } from "@/lib/notify";
import {
  notificationsDeleteReadMessage,
  notificationsMarkAllReadMessage,
} from "@/lib/crud-notify-messages";

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
    onMutate: async () => {
      const prev = queryClient.getQueryData<NotificationsResponse>(
        queryKeys.notifications.all
      );
      return { unreadCount: prev?.unreadCount ?? 0 };
    },
    onSuccess: async (_data, _vars, context) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      notify.crud(
        notificationsMarkAllReadMessage({ count: context?.unreadCount ?? 0 })
      );
    },
    onError: (error) => handleApiError(error, "Failed to mark notifications as read"),
  });

  const deleteReadMutation = useMutation({
    mutationFn: () =>
      apiClient<{ success: boolean; deleted: number }>("/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ deleteRead: true }),
      }),
    onSuccess: async (data) => {
      // Await so header badge and list both update before the toast appears.
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      notify.crud(notificationsDeleteReadMessage({ deleted: data.deleted }));
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
