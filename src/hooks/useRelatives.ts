import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, handleApiError } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { invalidateAllForCrud } from "@/lib/query-client";
import { Relative } from "@/types/types";
import { toast } from "sonner";

export type RelativeCreateInput = Pick<Relative, "firstname" | "lastname"> & Partial<Pick<Relative, "pronoun" | "notes">>;
export type RelativeUpdateInput = Partial<Pick<Relative, "firstname" | "lastname" | "pronoun" | "notes">>;

export function useRelatives() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.relatives.all,
    queryFn: async () => {
      const res = await apiClient<{ relatives: Relative[] }>("/api/relatives");
      return res.relatives || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: RelativeCreateInput) =>
      apiClient<{ relative: Relative }>("/api/relatives", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: async (data) => {
      await invalidateAllForCrud(queryClient);
      toast.success(`Relative '${data.relative.firstname} ${data.relative.lastname}' created`);
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
      await invalidateAllForCrud(queryClient);
      toast.success(`Relative '${data.relative.firstname} ${data.relative.lastname}' updated`);
    },
    onError: (e) => handleApiError(e, "Failed to update relative"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/relatives/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await invalidateAllForCrud(queryClient);
      toast.success("Relative deleted");
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
