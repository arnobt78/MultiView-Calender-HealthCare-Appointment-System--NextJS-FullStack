"use client";

/**
 * Global visit-type enable/disable per doctor — POST doctor-config + derived invalidation.
 */

import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Video, Loader2 } from "lucide-react";
import { useAppointmentTypesForDoctor } from "@/hooks/useAppointmentTypes";
import { apiClient, handleApiError } from "@/lib/api-client";
import { notify } from "@/lib/notify";
import {
  invalidateAppointmentTypeDerived,
  invalidateAdminPortal,
} from "@/lib/query-client";
import { useAuth } from "@/hooks/useAuth";
import type { DoctorSettingsVariant } from "@/lib/doctor-schedule-types";
import { cn } from "@/lib/utils";

type GlobalTypeRow = {
  id: string;
  name: string;
  duration_minutes: number;
  is_telehealth?: boolean;
  is_enabled?: boolean;
  user_id: string | null;
};

type Props = {
  doctorId: string;
  variant?: DoctorSettingsVariant;
};

export function DoctorGlobalVisitTypesEditor({
  doctorId,
  variant = "control-panel",
}: Props) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data, isLoading, isError } = useAppointmentTypesForDoctor(doctorId);

  const globalTypes = useMemo<GlobalTypeRow[]>(
    () => (data?.types ?? []).filter((t) => t.user_id === null) as GlobalTypeRow[],
    [data?.types]
  );

  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const { mutate } = useMutation({
    mutationFn: ({
      appointment_type_id,
      is_enabled,
    }: {
      appointment_type_id: string;
      is_enabled: boolean;
    }) =>
      apiClient("/api/appointment-types/doctor-config", {
        method: "POST",
        body: JSON.stringify({ doctor_id: doctorId, appointment_type_id, is_enabled }),
      }),
    onMutate: ({ appointment_type_id }) => {
      setPendingIds((prev) => new Set(prev).add(appointment_type_id));
    },
    onSuccess: async (_data, { appointment_type_id, is_enabled }) => {
      const typeName = globalTypes.find((t) => t.id === appointment_type_id)?.name ?? "Visit type";
      notify.crud({
        action: is_enabled ? "created" : "deleted",
        entity: "Visit type",
        detail:
          variant === "portal"
            ? is_enabled
              ? "Enabled for your patients."
              : "Disabled for new bookings."
            : `${typeName} ${is_enabled ? "enabled" : "disabled"} for this doctor`,
      });
      const tasks = [invalidateAppointmentTypeDerived(queryClient)];
      if (user?.role === "admin") {
        tasks.push(invalidateAdminPortal(queryClient));
      }
      await Promise.all(tasks);
    },
    onError: (error, { appointment_type_id }) => {
      handleApiError(error, "Failed to update visit type");
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(appointment_type_id);
        return next;
      });
    },
    onSettled: (_data, _error, { appointment_type_id }) => {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(appointment_type_id);
        return next;
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
        Loading visit types…
      </div>
    );
  }

  if (isError) {
    return <p className="py-2 text-sm text-red-600">Could not load visit types.</p>;
  }

  if (globalTypes.length === 0) {
    return (
      <p className="py-2 text-sm text-muted-foreground">No global appointment types configured.</p>
    );
  }

  return (
    <ul className={cn("space-y-2", variant === "portal" && "grid grid-cols-1 gap-2")}>
      {globalTypes.map((t) => {
        const checked = t.is_enabled !== false;
        const isPending = pendingIds.has(t.id);

        return (
          <li
            key={t.id}
            className={cn(
              "flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-xs transition-colors",
              variant === "portal"
                ? checked
                  ? "border-violet-100 bg-violet-50/50"
                  : "border-border/40 bg-muted/30 opacity-80"
                : "rounded-lg border bg-emerald-50/40"
            )}
          >
            <span className="relative flex shrink-0 items-center">
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-700" aria-hidden />
              ) : (
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={isPending}
                  onChange={(e) =>
                    mutate({ appointment_type_id: t.id, is_enabled: e.target.checked })
                  }
                  className="h-4 w-4 cursor-pointer rounded accent-emerald-700 disabled:cursor-not-allowed"
                  aria-label={`${checked ? "Disable" : "Enable"} ${t.name}`}
                />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-800">{t.name}</p>
              <p className="text-[10px] text-muted-foreground">
                {t.duration_minutes} min
                {t.is_telehealth ? " · Telehealth" : ""}
              </p>
            </div>
            {t.is_telehealth ? (
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium text-sky-700">
                <Video className="h-3 w-3" aria-hidden />
                Telehealth
              </span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
