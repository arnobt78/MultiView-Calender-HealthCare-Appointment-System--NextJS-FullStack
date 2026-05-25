import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, handleApiError } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import {
  invalidateDoctorPortal,
  invalidateEntityAffectingAppointments,
  invalidatePatientDetailAndSnapshot,
} from "@/lib/query-client";
import { Patient, type PatientSnapshot } from "@/types/types";
import { notify } from "@/lib/notify";
import { fetchPatients } from "@/lib/query-fetchers";

export type PatientCreateInput = Pick<Patient, "firstname" | "lastname"> &
  Partial<
    Pick<
      Patient,
      | "birth_date"
      | "care_level"
      | "pronoun"
      | "email"
      | "active"
      | "active_since"
      | "clinical_profile"
      | "primary_doctor_id"
    >
  >;
/** Email omitted — API ignores email on PUT for demo safety */
export type PatientUpdateInput = Partial<
  Pick<
    Patient,
    | "firstname"
    | "lastname"
    | "birth_date"
    | "care_level"
    | "pronoun"
    | "active"
    | "active_since"
    | "clinical_profile"
    | "primary_doctor_id"
  >
>;

export function usePatients() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.patients.all,
    queryFn: () => fetchPatients(),
    // Patient list changes only on create/update/delete mutations which all call
    // invalidatePatientsAndOverview; 30 s prevents redundant re-fetches.
    staleTime: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: (data: PatientCreateInput) =>
      apiClient<{ patient: Patient }>("/api/patients", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: async (data) => {
      await invalidateEntityAffectingAppointments(queryClient, "patients");
      await invalidateDoctorPortal(queryClient);
      await invalidatePatientDetailAndSnapshot(queryClient, data.patient.id);
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
      await invalidateDoctorPortal(queryClient);
      await invalidatePatientDetailAndSnapshot(queryClient, data.patient.id);
      const nm = `${data.patient.firstname} ${data.patient.lastname}`.trim();
      const em = data.patient.email?.trim();
      notify.crud({
        action: "updated",
        entity: "Patient",
        detail: `${nm}${em ? ` (${em})` : ""} — profile updated.`,
      });
    },
    onError: (e) => handleApiError(e, "Failed to update patient"),
  });

  const deleteMutation = useMutation({
    mutationFn: (vars: { id: string; name?: string; email?: string | null }) =>
      apiClient(`/api/patients/${vars.id}`, { method: "DELETE" }).then(() => vars),
    onSuccess: async (vars) => {
      // Drop detail/snapshot so nothing refetches a deleted id; list + appointments still invalidate below.
      queryClient.removeQueries({ queryKey: queryKeys.patients.detail(vars.id) });
      queryClient.removeQueries({ queryKey: queryKeys.patients.snapshot(vars.id) });
      await invalidateEntityAffectingAppointments(queryClient, "patients");
      await invalidateDoctorPortal(queryClient);
      const nm = vars.name?.trim();
      const em = vars.email?.trim();
      const who = nm ? `${nm}${em ? ` (${em})` : ""}` : "The patient record";
      notify.crud({ action: "deleted", entity: "Patient", detail: `${who} was deleted.` });
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
    deletePatient: (
      input: string | { id: string; name?: string; email?: string | null },
      opts?: Parameters<typeof deleteMutation.mutate>[1]
    ) => deleteMutation.mutate(typeof input === "string" ? { id: input } : input, opts),
    isDeleting: deleteMutation.isPending,
  };
}

function patientRosterQuery(rosterDoctorId?: string | null): string {
  if (!rosterDoctorId) return "";
  return `?fromDoctor=${encodeURIComponent(rosterDoctorId)}`;
}

export function usePatient(id: string | null, rosterDoctorId?: string | null) {
  const rosterQ = patientRosterQuery(rosterDoctorId);
  return useQuery({
    queryKey: queryKeys.patients.detail(id ?? ""),
    queryFn: async () => {
      const res = await apiClient<{ patient: Patient }>(`/api/patients/${id}${rosterQ}`);
      return res.patient;
    },
    enabled: !!id,
  });
}

/** Aggregated appointments / activities / invoices for patient profile — invalidated with `queryKeys.patients.all` */
export function usePatientSnapshot(id: string | null, rosterDoctorId?: string | null) {
  const rosterQ = patientRosterQuery(rosterDoctorId);
  return useQuery({
    queryKey: queryKeys.patients.snapshot(id ?? ""),
    queryFn: () => apiClient<PatientSnapshot>(`/api/patients/${id}/snapshot${rosterQ}`),
    enabled: !!id,
    staleTime: 60_000,
  });
}
