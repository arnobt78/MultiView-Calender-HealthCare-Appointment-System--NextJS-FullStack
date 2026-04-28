import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, handleApiError } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { invalidateEntityAffectingAppointments } from "@/lib/query-client";
import { Relative } from "@/types/types";
import { notify } from "@/lib/notify";
import { fetchRelatives } from "@/lib/query-fetchers";

export type RelativeCreateInput = Pick<Relative, "firstname" | "lastname"> & Partial<Pick<Relative, "pronoun" | "notes">>;
export type RelativeUpdateInput = Partial<Pick<Relative, "firstname" | "lastname" | "pronoun" | "notes">>;

export function useRelatives() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.relatives.all,
    queryFn: () => fetchRelatives(),
    staleTime: 10 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (data: RelativeCreateInput) =>
      apiClient<{ relative: Relative }>("/api/relatives", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: async (data) => {
      await invalidateEntityAffectingAppointments(queryClient, "relatives");
      notify.crud({ action: "created", entity: "Relative", detail: `${data.relative.firstname} ${data.relative.lastname} was added.` });
    },
    onError: (e) => handleApiError(e, "Failed to create relative"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: RelativeUpdateInput & { id: string }) =>
      apiClient<{ relative: Relative }>(`/api/relatives/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: async (data) => {
      await invalidateEntityAffectingAppointments(queryClient, "relatives");
      notify.crud({ action: "updated", entity: "Relative", detail: `${data.relative.firstname} ${data.relative.lastname} was updated.` });
    },
    onError: (e) => handleApiError(e, "Failed to update relative"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/relatives/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await invalidateEntityAffectingAppointments(queryClient, "relatives");
      notify.crud({ action: "deleted", entity: "Relative", detail: "The relative record was deleted." });
    },
    onError: (e) => handleApiError(e, "Failed to delete relative"),
  });

  return {
    relatives: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createRelative: createMutation.mutate,
    createRelativeAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateRelative: updateMutation.mutate,
    updateRelativeAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteRelative: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
