import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { Relative } from "@/types/types";

export function useRelatives() {
  return useQuery({
    queryKey: queryKeys.relatives.all,
    queryFn: async () => {
      const res = await apiClient<{ relatives: Relative[] }>("/api/relatives");
      return res.relatives || [];
    },
  });
}
