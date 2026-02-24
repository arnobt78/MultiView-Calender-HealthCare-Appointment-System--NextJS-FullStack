import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { Category } from "@/types/types";

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: async () => {
      const res = await apiClient<{ categories: Category[] }>("/api/categories");
      return res.categories || [];
    },
    // Categories rarely change, keep them cached longer
    staleTime: 10 * 60 * 1000, 
  });
}
