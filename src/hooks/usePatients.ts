import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, handleApiError } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { invalidateEntityAffectingAppointments } from "@/lib/query-client";
import { Patient, type PatientSnapshot } from "@/types/types";
import { notify } from "@/lib/notify";
import { fetchPatients } from "@/lib/query-fetchers";

export type PatientCreateInput = Pick<Patient, "firstname" | "lastname"> &
  Partial<
    Pick<Patient, "birth_date" | "care_level" | "pronoun" | "email" | "active" | "active_since" | "clinical_profile">
  >;
/** Email omitted — API ignores email on PUT for demo safety */
export type PatientUpdateInput = Partial<
  Pick<
    Patient,
    "firstname" | "lastname" | "birth_date" | "care_level" | "pronoun" | "active" | "active_since" | "clinical_profile"
  >
>;

export function usePatients() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.patients.all,
    queryFn: () => fetchPatients(),
  });

  const createMutation = useMutation({
    mutationFn: (data: PatientCreateInput) =>
      apiClient<{ patient: Patient }>("/api/patients", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: async (data) => {
      await invalidateEntityAffectingAppointments(queryClient, "patients");
      notify.crud({ action: "created", entity: "Patient", detail: `${data.patient.firstname} ${data.patient.lastname} was added.` });
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
      await invalidateEntityAffectingAppointments(queryClient, "patients");
      notify.crud({ action: "updated", entity: "Patient", detail: `${data.patient.firstname} ${data.patient.lastname} was updated.` });
    },
    onError: (e) => handleApiError(e, "Failed to update patient"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/patients/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await invalidateEntityAffectingAppointments(queryClient, "patients");
      notify.crud({ action: "deleted", entity: "Patient", detail: "The patient record was deleted." });
    },
    onError: (e) => handleApiError(e, "Failed to delete patient"),
  });

  return {
    patients: query.data ?? [],
    isLoading: query.isLoading,
    /** True during background refetch after invalidation — stats UI can use without blocking static labels */
    isFetching: query.isFetching,
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

/** Aggregated appointments / activities / invoices for patient profile — invalidated with `queryKeys.patients.all` */
export function usePatientSnapshot(id: string | null) {
  return useQuery({
    queryKey: queryKeys.patients.snapshot(id ?? ""),
    queryFn: () => apiClient<PatientSnapshot>(`/api/patients/${id}/snapshot`),
    enabled: !!id,
    staleTime: 60_000,
  });
}
