"use client";

/**
 * React Query surface for appointment types (doctor-owned + **global** `user_id = null`).
 *
 * - `useAppointmentTypesForDoctor` — `GET /api/appointment-types?doctorId=` (includes global rows in the
 *   payload; UI filters to `user_id === doctorId` for per-doctor CRUD).
 * - `useAppointmentTypeMutations` — POST `/api/appointment-types` for owned rows; PATCH/DELETE `/api/appointment-types/[id]`.
 * - `useGlobalAppointmentTypes` — `GET /api/appointment-types/global`.
 * - `useGlobalAppointmentTypeMutations` — POST `/api/appointment-types/global` + same PATCH/DELETE by id.
 *
 * All mutation success handlers run `invalidateAppointmentTypeDerived` so slot math, `/api/doctors`, and
 * every `appointmentTypes` subtree refetch without a full reload.
 */

import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient, handleApiError } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { isValidUUID } from "@/lib/validation";
import { invalidateAppointmentTypeDerived } from "@/lib/query-client";
import { notify } from "@/lib/notify";

export type AppointmentTypeApiRow = {
  id: string;
  created_at?: string;
  user_id: string | null;
  name: string;
  description: string | null;
  duration_minutes: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  slot_interval_minutes: number;
  minimum_notice_minutes: number;
};

async function afterTypeMutation(
  queryClient: QueryClient,
  router: ReturnType<typeof useRouter>,
  refreshRsc: boolean
) {
  await invalidateAppointmentTypeDerived(queryClient);
  /** CP doctor detail is RSC — portal skips refresh to avoid full route reload. */
  if (refreshRsc) router.refresh();
}

export function useAppointmentTypesForDoctor(doctorId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.appointmentTypes.byDoctor(doctorId ?? ""),
    queryFn: () =>
      apiClient<{ types: AppointmentTypeApiRow[] }>(
        `/api/appointment-types?doctorId=${encodeURIComponent(doctorId!)}`
      ),
    enabled: Boolean(doctorId && isValidUUID(doctorId)),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAppointmentTypeMutations(
  doctorId: string,
  options?: { refreshRsc?: boolean }
) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const refreshRsc = options?.refreshRsc !== false;

  const createType = useMutation({
    mutationFn: (body: { name: string; duration_minutes: number; description?: string | null }) =>
      apiClient<{ type: AppointmentTypeApiRow }>("/api/appointment-types", {
        method: "POST",
        body: JSON.stringify({ user_id: doctorId, ...body }),
      }),
    onSuccess: async () => {
      await afterTypeMutation(queryClient, router, refreshRsc);
      notify.crud({ action: "created", entity: "Appointment type", detail: "Type saved for this doctor." });
    },
    onError: (e) => handleApiError(e, "Failed to create appointment type"),
  });

  const updateType = useMutation({
    mutationFn: (vars: { id: string } & Partial<Pick<AppointmentTypeApiRow, "name" | "description" | "duration_minutes">>) => {
      const { id, ...patch } = vars;
      return apiClient<{ type: AppointmentTypeApiRow }>(`/api/appointment-types/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
    },
    onSuccess: async () => {
      await afterTypeMutation(queryClient, router, refreshRsc);
      notify.crud({ action: "updated", entity: "Appointment type", detail: "Changes saved." });
    },
    onError: (e) => handleApiError(e, "Failed to update appointment type"),
  });

  const deleteType = useMutation({
    mutationFn: (id: string) => apiClient<{ ok: boolean }>(`/api/appointment-types/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await afterTypeMutation(queryClient, router, refreshRsc);
      notify.crud({ action: "deleted", entity: "Appointment type", detail: "Type removed." });
    },
    onError: (e) => handleApiError(e, "Failed to delete appointment type"),
  });

  return {
    createType: createType.mutateAsync,
    updateType: updateType.mutateAsync,
    deleteType: deleteType.mutateAsync,
    isCreating: createType.isPending,
    isUpdating: updateType.isPending,
    isDeleting: deleteType.isPending,
  };
}

export function useGlobalAppointmentTypes(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.appointmentTypes.global,
    queryFn: () => apiClient<{ types: AppointmentTypeApiRow[] }>("/api/appointment-types/global"),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled !== false,
  });
}

export function useGlobalAppointmentTypeMutations() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const createGlobalType = useMutation({
    mutationFn: (body: { name: string; duration_minutes: number; description?: string | null }) =>
      apiClient<{ type: AppointmentTypeApiRow }>("/api/appointment-types/global", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      await afterTypeMutation(queryClient, router, true);
      notify.crud({ action: "created", entity: "Global visit type", detail: "Saved for all doctors." });
    },
    onError: (e) => handleApiError(e, "Failed to create global appointment type"),
  });

  const updateGlobalType = useMutation({
    mutationFn: (vars: { id: string } & Partial<Pick<AppointmentTypeApiRow, "name" | "description" | "duration_minutes">>) => {
      const { id, ...patch } = vars;
      return apiClient<{ type: AppointmentTypeApiRow }>(`/api/appointment-types/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
    },
    onSuccess: async () => {
      await afterTypeMutation(queryClient, router, true);
      notify.crud({ action: "updated", entity: "Global visit type", detail: "Changes saved." });
    },
    onError: (e) => handleApiError(e, "Failed to update global appointment type"),
  });

  const deleteGlobalType = useMutation({
    mutationFn: (id: string) => apiClient<{ ok: boolean }>(`/api/appointment-types/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await afterTypeMutation(queryClient, router, true);
      notify.crud({ action: "deleted", entity: "Global visit type", detail: "Removed." });
    },
    onError: (e) => handleApiError(e, "Failed to delete global appointment type"),
  });

  return {
    createGlobalType: createGlobalType.mutateAsync,
    updateGlobalType: updateGlobalType.mutateAsync,
    deleteGlobalType: deleteGlobalType.mutateAsync,
    isCreating: createGlobalType.isPending,
    isUpdating: updateGlobalType.isPending,
    isDeleting: deleteGlobalType.isPending,
  };
}
