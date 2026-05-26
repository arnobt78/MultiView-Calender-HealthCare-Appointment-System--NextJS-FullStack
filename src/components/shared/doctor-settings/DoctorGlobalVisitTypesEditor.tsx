"use client";

/**
 * Global visit-type enable/disable per doctor — POST doctor-config + derived invalidation.
 */

import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Video, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DoctorSettingsGlassListRow } from "@/components/shared/doctor-settings/DoctorSettingsGlassListRow";
import { useAppointmentTypesForDoctor } from "@/hooks/useAppointmentTypes";
import { apiClient, handleApiError } from "@/lib/api-client";
import { globalVisitTypeToggleMessage } from "@/lib/crud-notify-messages";
import { notify } from "@/lib/notify";
import {
  invalidateAppointmentTypeDerived,
  invalidateAdminPortal,
} from "@/lib/query-client";
import { useAuth } from "@/hooks/useAuth";
import type { DoctorAppointmentTypesQueryData } from "@/lib/doctor-portal-settings-prefetch";
import type { DoctorSettingsVariant } from "@/lib/doctor-schedule-types";
import { DOCTOR_PORTAL_VISIT_TYPE_COPY } from "@/lib/doctor-portal-visit-type-copy";
import { doctorSettingsGlassCheckboxClass } from "@/lib/doctor-settings-glass-surfaces";
import { cn, toTitleCaseLabel } from "@/lib/utils";

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
  initialAppointmentTypes?: DoctorAppointmentTypesQueryData;
};

export function DoctorGlobalVisitTypesEditor({
  doctorId,
  variant = "control-panel",
  initialAppointmentTypes,
}: Props) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data, isLoading, isError } = useAppointmentTypesForDoctor(doctorId, {
    initialData: initialAppointmentTypes,
  });

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
      notify.crud(
        globalVisitTypeToggleMessage({
          name: typeName,
          enabled: is_enabled,
          variant: variant === "portal" ? "portal" : "control-panel",
        })
      );
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

  const listBodyLoading = isLoading && data === undefined;
  const isPortal = variant === "portal";

  if (listBodyLoading) {
    return (
      <div className="space-y-2">
        {isPortal ? (
          <Skeleton className="mb-3 h-10 w-full rounded-xl" aria-hidden />
        ) : null}
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="py-2 text-sm text-red-600">Could not load visit types.</p>;
  }

  if (globalTypes.length === 0) {
    return (
      <p className="py-2 text-sm text-muted-foreground">
        {isPortal ? DOCTOR_PORTAL_VISIT_TYPE_COPY.emptyGlobalTypes : "No global appointment types configured."}
      </p>
    );
  }

  return (
    <div className={cn(isPortal && "space-y-3")}>
      {!isPortal ? (
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          Organization-wide templates. Toggle availability for this doctor.
        </p>
      ) : null}
      <ul className="space-y-2">
        {globalTypes.map((t) => {
          const checked = t.is_enabled !== false;
          const isPending = pendingIds.has(t.id);

          return (
            <DoctorSettingsGlassListRow
              key={t.id}
              tone="violet"
              enabled={checked}
              leading={
                isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin text-violet-600" aria-hidden />
                ) : (
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={isPending}
                    onChange={(e) =>
                      mutate({ appointment_type_id: t.id, is_enabled: e.target.checked })
                    }
                    className={doctorSettingsGlassCheckboxClass("violet")}
                    aria-label={`${checked ? "Disable" : "Enable"} ${t.name}`}
                  />
                )
              }
              title={toTitleCaseLabel(t.name)}
              meta={`${t.duration_minutes} min${t.is_telehealth ? " · Telehealth" : ""}`}
              trailing={
                t.is_telehealth ? (
                  <span className="flex shrink-0 items-center gap-1 rounded-full border border-sky-200/60 bg-sky-50/90 px-2 py-0.5 text-[10px] font-medium text-sky-700 shadow-[0_4px_12px_rgba(2,132,199,0.1)]">
                    <Video className="h-3 w-3" aria-hidden />
                    {toTitleCaseLabel("Telehealth")}
                  </span>
                ) : null
              }
            />
          );
        })}
      </ul>
    </div>
  );
}
