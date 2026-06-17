"use client";

import { useMemo } from "react";
import { CheckCircle } from "lucide-react";
import VideoCall from "@/components/calendar/VideoCall";
import { useAuth } from "@/hooks/useAuth";
import { useAppointments } from "@/hooks/useAppointments";
import { useInitialNavRole } from "@/context/NavRoleContext";
import { getAppointmentMenuCapabilities } from "@/lib/appointment-menu-permissions";
import {
  emeraldGlassBackButtonClass,
  skyGlassBackButtonClass,
} from "@/lib/calendar-header-action-styles";
import { cn } from "@/lib/utils";
import type { Appointment } from "@/types/types";
import type { AppointmentAssignee } from "@/types/types";

type Props = {
  appointment: Appointment;
  assignees: AppointmentAssignee[];
  canEdit: boolean;
};

/** Header quick actions — Video (telehealth only) + Mark done beside Back. */
export function AppointmentDetailHeaderQuickActions({
  appointment,
  assignees,
  canEdit,
}: Props) {
  const { user } = useAuth();
  const navRole = useInitialNavRole();
  const role = user?.role ?? navRole;
  const { toggleStatus, isTogglingStatus } = useAppointments();

  const capabilities = useMemo(
    () =>
      getAppointmentMenuCapabilities({
        appointment,
        assignees,
        userId: user?.id,
        userEmail: user?.email,
        userRole: role,
      }),
    [appointment, assignees, user?.id, user?.email, role]
  );

  const isCancelled = appointment.status === "cancelled";
  const isDone = appointment.status === "done";
  const showVideo = canEdit && !isCancelled && appointment.is_telehealth;
  const showMarkDone =
    canEdit && capabilities.canToggleStatus && !isCancelled && !isDone;

  if (!showVideo && !showMarkDone) return null;

  return (
    <>
      {showVideo ? (
        <VideoCall
          appointmentId={appointment.id}
          appointmentTitle={appointment.title ?? "Video Consultation"}
          triggerClassName={skyGlassBackButtonClass}
        />
      ) : null}
      {showMarkDone ? (
        <button
          type="button"
          disabled={isTogglingStatus}
          onClick={() => toggleStatus({ id: appointment.id, status: "done" })}
          className={cn(emeraldGlassBackButtonClass, "disabled:cursor-not-allowed")}
        >
          <CheckCircle className="shrink-0" aria-hidden />
          Mark Done
        </button>
      ) : null}
    </>
  );
}
