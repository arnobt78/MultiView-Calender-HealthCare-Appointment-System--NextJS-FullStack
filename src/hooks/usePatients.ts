import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, handleApiError } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { invalidateAllForCrud } from "@/lib/query-client";
import { Patient } from "@/types/types";
import { toast } from "sonner";

export type PatientCreateInput = Pick<Patient, "firstname" | "lastname"> &
  Partial<Pick<Patient, "birth_date" | "care_level" | "pronoun" | "email" | "active" | "active_since">>;
export type PatientUpdateInput = Partial<
  Pick<Patient, "firstname" | "lastname" | "birth_date" | "care_level" | "pronoun" | "email" | "active" | "active_since">
>;

export function usePatients() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.patients.all,
    queryFn: async () => {
      const res = await apiClient<{ patients: Patient[] }>("/api/patients");
      return res.patients || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: PatientCreateInput) =>
      apiClient<{ patient: Patient }>("/api/patients", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: async (data) => {
      await invalidateAllForCrud(queryClient);
      toast.success(`Patient ${data.patient.firstname} ${data.patient.lastname} created`);
    },
    onError: (e) => handleApiError(e, "Failed to create patient"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: PatientUpdateInput & { id: string }) =>
      apiClient<{ patient: Patient }>(`/api/patients/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: async (data) => {
      await invalidateAllForCrud(queryClient);
      toast.success(`Patient ${data.patient.firstname} ${data.patient.lastname} updated`);
    },
    onError: (e) => handleApiError(e, "Failed to update patient"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/patients/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await invalidateAllForCrud(queryClient);
      toast.success("Patient deleted");
    },
    onError: (e) => handleApiError(e, "Failed to delete patient"),
  });

  return {
    patients: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createPatient: createMutation.mutate,
    createPatientAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updatePatient: updateMutation.mutate,
    updatePatientAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deletePatient: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}

export function usePatient(id: string | null) {
  return useQuery({
    queryKey: queryKeys.patients.detail(id ?? ""),
    queryFn: async () => {
      const res = await apiClient<{ patient: Patient }>(`/api/patients/${id}`);
      return res.patient;
    },
    enabled: !!id,
  });
}
