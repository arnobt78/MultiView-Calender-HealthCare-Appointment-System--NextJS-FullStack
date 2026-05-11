import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, handleApiError } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { invalidateEntityAffectingAppointments } from "@/lib/query-client";
import { Category } from "@/types/types";
import { notify } from "@/lib/notify";
import { fetchCategories } from "@/lib/query-fetchers";

export type CategoryCreateInput = Pick<Category, "label"> & Partial<Pick<Category, "description" | "color" | "icon" | "is_active" | "sort_order" | "duration_minutes_default">>;
export type CategoryUpdateInput = Partial<Pick<Category, "label" | "description" | "color" | "icon">>;

export function useCategories() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => fetchCategories(),
    staleTime: 10 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (data: CategoryCreateInput) =>
      apiClient<{ category: Category }>("/api/categories", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: async (data) => {
      await invalidateEntityAffectingAppointments(queryClient, "categories");
      notify.crud({ action: "created", entity: "Category", detail: `"${data.category.label}" is ready to use.` });
    },
    onError: (e) => handleApiError(e, "Failed to create category"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: CategoryUpdateInput & { id: string }) =>
      apiClient<{ category: Category }>(`/api/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: async (data) => {
      await invalidateEntityAffectingAppointments(queryClient, "categories");
      notify.crud({ action: "updated", entity: "Category", detail: `"${data.category.label}" was updated.` });
    },
    onError: (e) => handleApiError(e, "Failed to update category"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/categories/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await invalidateEntityAffectingAppointments(queryClient, "categories");
      notify.crud({ action: "deleted", entity: "Category", detail: "The category has been removed." });
    },
    onError: (e) => handleApiError(e, "Failed to delete category"),
  });

  return {
    categories: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createCategory: createMutation.mutate,
    createCategoryAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateCategory: updateMutation.mutate,
    updateCategoryAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteCategory: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}

export function useCategory(id: string | null) {
  return useQuery({
    queryKey: queryKeys.categories.detail(id ?? ""),
    queryFn: async () => {
      const res = await apiClient<{ category: Category }>(`/api/categories/${id}`);
      return res.category;
    },
    enabled: !!id,
  });
}
