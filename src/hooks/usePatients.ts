import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { Patient } from "@/types/types";

export function usePatients() {
  return useQuery({
    queryKey: queryKeys.patients.all,
    queryFn: async () => {
      const res = await apiClient<{ patients: Patient[] }>("/api/patients");
      return res.patients || [];
    },
  });
}
