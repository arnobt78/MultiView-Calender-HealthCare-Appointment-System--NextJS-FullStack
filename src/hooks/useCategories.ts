import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, handleApiError } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import {
  invalidateEntityAffectingAppointments,
  syncAppointmentsAfterCategoryWrite,
} from "@/lib/query-client";
import {
  patchCategoryListCache,
  seedCategoryDetailCache,
} from "@/lib/category-query-cache";
import { Category, type CategorySnapshot } from "@/types/types";
import { notify } from "@/lib/notify";
import { fetchCategories } from "@/lib/query-fetchers";
import { EMPTY_CATEGORIES } from "@/lib/stable-query-fallbacks";

export type CategoryCreateInput = Pick<Category, "label"> &
  Partial<
    Pick<Category, "description" | "color" | "icon" | "is_active" | "sort_order"> & {
      duration_minutes_default?: number | null;
    }
  >;
export type CategoryUpdateInput = Partial<
  Pick<Category, "label" | "description" | "color" | "icon" | "is_active" | "sort_order"> & {
    duration_minutes_default?: number | null;
  }
>;

type UseCategorySnapshotQueryOptions = {
  initialData?: CategorySnapshot | null;
};

export type UseCategoriesOptions = {
  /** SSR seed — avoids duplicate fetch on first paint when section already hydrated cache. */
  categoriesInitialData?: Category[];
};

export function useCategories(options?: UseCategoriesOptions) {
  const queryClient = useQueryClient();

  const categoriesInitialData =
    options?.categoriesInitialData ??
    queryClient.getQueryData<Category[]>(queryKeys.categories.all);

  const query = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => fetchCategories(),
    initialData: categoriesInitialData,
    staleTime: 10 * 60 * 1000,
    refetchOnMount: categoriesInitialData !== undefined ? false : true,
  });

  const createMutation = useMutation({
    mutationFn: (data: CategoryCreateInput) =>
      apiClient<{ category: Category }>("/api/categories", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: async (data) => {
      seedCategoryDetailCache(queryClient, data.category);
      patchCategoryListCache(queryClient, data.category);
      await syncAppointmentsAfterCategoryWrite(queryClient);
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
      seedCategoryDetailCache(queryClient, data.category);
      patchCategoryListCache(queryClient, data.category);
      await syncAppointmentsAfterCategoryWrite(queryClient);
      notify.crud({ action: "updated", entity: "Category", detail: `"${data.category.label}" was updated.` });
    },
    onError: (e) => handleApiError(e, "Failed to update category"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/categories/${id}`, { method: "DELETE" }),
    onSuccess: async (_data, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.categories.detail(id) });
      queryClient.removeQueries({ queryKey: queryKeys.categories.snapshot(id) });
      await invalidateEntityAffectingAppointments(queryClient, "categories");
      notify.crud({ action: "deleted", entity: "Category", detail: "The category has been removed." });
    },
    onError: (e) => handleApiError(e, "Failed to delete category"),
  });

  return {
    categories: query.data ?? EMPTY_CATEGORIES,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
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
    deleteCategoryAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}

type UseCategoryQueryOptions = {
  /** SSR prefetch — stable first paint; optional background refetch when not seeded. */
  initialData?: Category | null;
};

export function useCategory(id: string | null, options?: UseCategoryQueryOptions) {
  const hasSsrSeed = options?.initialData != null;
  return useQuery({
    queryKey: queryKeys.categories.detail(id ?? ""),
    queryFn: async () => {
      const res = await apiClient<{ category: Category }>(`/api/categories/${id}`);
      return res.category;
    },
    enabled: !!id,
    initialData: options?.initialData ?? undefined,
    staleTime: 60_000,
    refetchOnMount: hasSsrSeed ? false : true,
  });
}

/** Aggregated appointments for category detail — invalidated on appointment/category CRUD. */
export function useCategorySnapshot(
  id: string | null,
  options?: UseCategorySnapshotQueryOptions
) {
  return useQuery({
    queryKey: queryKeys.categories.snapshot(id ?? ""),
    queryFn: () => apiClient<CategorySnapshot>(`/api/categories/${id}/snapshot`),
    enabled: !!id,
    initialData: options?.initialData ?? undefined,
    staleTime: 60_000,
  });
}
