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
 * Sonner copy: `src/lib/crud-notify-messages.ts` (dynamic name/duration/toggle).
 */

import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient, handleApiError } from "@/lib/api-client";
import {
  globalVisitTypeCrudMessage,
  isOwnedVisitTypeActiveOnlyPatch,
  ownedVisitTypeCrudMessage,
} from "@/lib/crud-notify-messages";
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
  /** Owned rows: DB `is_active`. Globals: always true when returned. */
  is_active?: boolean;
  /** Owned: mirrors `is_active`; globals: `DoctorAppointmentTypeConfig`. */
  is_enabled?: boolean;
  is_telehealth?: boolean;
  color?: string | null;
  icon?: string | null;
  /** Visit fee in cents — 0 = no explicit price. Auto-draft falls back to doctor consultation_fee. */
  price_cents?: number;
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

export type AppointmentTypesForDoctorQueryData = {
  types: AppointmentTypeApiRow[];
};

export function useAppointmentTypesForDoctor(
  doctorId: string | null | undefined,
  options?: { initialData?: AppointmentTypesForDoctorQueryData }
) {
  return useQuery({
    queryKey: queryKeys.appointmentTypes.byDoctor(doctorId ?? ""),
    queryFn: () =>
      apiClient<AppointmentTypesForDoctorQueryData>(
        `/api/appointment-types?doctorId=${encodeURIComponent(doctorId!)}`
      ),
    enabled: Boolean(doctorId && isValidUUID(doctorId)),
    initialData: options?.initialData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAppointmentTypeMutations(
  doctorId: string,
  options?: { refreshRsc?: boolean; suppressNotify?: boolean }
) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const refreshRsc = options?.refreshRsc !== false;
  const suppressNotify = options?.suppressNotify === true;

  const createType = useMutation({
    mutationFn: (body: { name: string; duration_minutes: number; description?: string | null; price_cents?: number }) =>
      apiClient<{ type: AppointmentTypeApiRow }>("/api/appointment-types", {
        method: "POST",
        body: JSON.stringify({ user_id: doctorId, ...body }),
      }),
    onSuccess: async (data, variables) => {
      await afterTypeMutation(queryClient, router, refreshRsc);
      if (!suppressNotify) {
        notify.crud(
          ownedVisitTypeCrudMessage({
            kind: "create",
            name: variables.name,
            duration_minutes: data.type.duration_minutes,
          })
        );
      }
    },
    onError: (e) => handleApiError(e, "Failed to create appointment type"),
  });

  const updateType = useMutation({
    mutationFn: (
      vars: { id: string } & Partial<
        Pick<AppointmentTypeApiRow, "name" | "description" | "duration_minutes" | "is_active" | "price_cents">
      >
    ) => {
      const { id, ...patch } = vars;
      return apiClient<{ type: AppointmentTypeApiRow }>(`/api/appointment-types/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
    },
    onSuccess: async (data, variables) => {
      await afterTypeMutation(queryClient, router, refreshRsc);
      if (suppressNotify) return;
      const { id: _id, ...patch } = variables;
      if (isOwnedVisitTypeActiveOnlyPatch(patch)) {
        notify.crud(
          ownedVisitTypeCrudMessage({
            kind: "toggle-active",
            name: data.type.name,
            is_active: patch.is_active === true,
          })
        );
        return;
      }
      notify.crud(
        ownedVisitTypeCrudMessage({
          kind: "update",
          name: data.type.name,
          duration_minutes: data.type.duration_minutes,
        })
      );
    },
    onError: (e) => handleApiError(e, "Failed to update appointment type"),
  });

  const deleteType = useMutation({
    mutationFn: (id: string) => apiClient<{ ok: boolean }>(`/api/appointment-types/${id}`, { method: "DELETE" }),
    onMutate: async (deletedId) => {
      const types =
        queryClient.getQueryData<AppointmentTypesForDoctorQueryData>(
          queryKeys.appointmentTypes.byDoctor(doctorId)
        )?.types ?? [];
      const deleted = types.find((t) => t.id === deletedId);
      return { name: deleted?.name ?? "Appointment type" };
    },
    onSuccess: async (_data, _id, context) => {
      await afterTypeMutation(queryClient, router, refreshRsc);
      if (!suppressNotify) {
        notify.crud(
          ownedVisitTypeCrudMessage({ kind: "delete", name: context?.name ?? "Appointment type" })
        );
      }
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

export function useGlobalAppointmentTypeMutations(options?: { suppressNotify?: boolean }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const suppressNotify = options?.suppressNotify === true;

  const createGlobalType = useMutation({
    mutationFn: (body: { name: string; duration_minutes: number; description?: string | null; price_cents?: number }) =>
      apiClient<{ type: AppointmentTypeApiRow }>("/api/appointment-types/global", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: async (data, variables) => {
      await afterTypeMutation(queryClient, router, true);
      if (!suppressNotify) {
        notify.crud(
          globalVisitTypeCrudMessage("created", {
            name: data.type.name ?? variables.name,
            duration_minutes: data.type.duration_minutes,
          })
        );
      }
    },
    onError: (e) => handleApiError(e, "Failed to create global appointment type"),
  });

  const updateGlobalType = useMutation({
    mutationFn: (vars: { id: string } & Partial<Pick<AppointmentTypeApiRow, "name" | "description" | "duration_minutes" | "price_cents">>) => {
      const { id, ...patch } = vars;
      return apiClient<{ type: AppointmentTypeApiRow }>(`/api/appointment-types/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
    },
    onSuccess: async (data) => {
      await afterTypeMutation(queryClient, router, true);
      if (!suppressNotify) {
        notify.crud(
          globalVisitTypeCrudMessage("updated", {
            name: data.type.name,
            duration_minutes: data.type.duration_minutes,
          })
        );
      }
    },
    onError: (e) => handleApiError(e, "Failed to update global appointment type"),
  });

  const deleteGlobalType = useMutation({
    mutationFn: (id: string) => apiClient<{ ok: boolean }>(`/api/appointment-types/${id}`, { method: "DELETE" }),
    onMutate: async (deletedId) => {
      const types =
        queryClient.getQueryData<{ types: AppointmentTypeApiRow[] }>(
          queryKeys.appointmentTypes.global
        )?.types ?? [];
      const deleted = types.find((t) => t.id === deletedId);
      return { name: deleted?.name ?? "Visit type" };
    },
    onSuccess: async (_data, _id, context) => {
      await afterTypeMutation(queryClient, router, true);
      if (!suppressNotify) {
        notify.crud(
          globalVisitTypeCrudMessage("deleted", { name: context?.name ?? "Visit type" })
        );
      }
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

/** Admin-only: all appointment types (global + every doctor's custom) with owner info. */
export type AdminAllTypeRow = {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  duration_minutes: number;
  slot_interval_minutes: number;
  price_cents: number;
  is_active: boolean;
  is_telehealth: boolean;
  color: string | null;
  icon: string | null;
  created_at: string;
  owner_display_name: string | null;
  owner_email: string | null;
};

export function useAdminAllAppointmentTypes(options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();
  const initialData = queryClient.getQueryData<{
    globalTypes: AdminAllTypeRow[];
    customTypes: AdminAllTypeRow[];
  }>(queryKeys.appointmentTypes.all);

  return useQuery({
    queryKey: queryKeys.appointmentTypes.all,
    queryFn: () =>
      apiClient<{ globalTypes: AdminAllTypeRow[]; customTypes: AdminAllTypeRow[] }>(
        "/api/appointment-types/admin-all"
      ),
    initialData,
    refetchOnMount: initialData !== undefined ? false : true,
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled !== false,
  });
}
