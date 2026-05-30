import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { Category } from "@/types/types";

/** Instant list row update after category create/update — no full-list refetch flash. */
export function patchCategoryListCache(queryClient: QueryClient, category: Category) {
  queryClient.setQueryData<Category[]>(queryKeys.categories.all, (old) => {
    if (!old) return old;
    const idx = old.findIndex((c) => c.id === category.id);
    if (idx === -1) return [category, ...old];
    const next = [...old];
    next[idx] = category;
    return next;
  });
}

/** Seed detail cache after category create/update. */
export function seedCategoryDetailCache(queryClient: QueryClient, category: Category) {
  queryClient.setQueryData(queryKeys.categories.detail(category.id), category);
}
