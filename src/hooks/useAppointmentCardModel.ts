"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { useAppointmentColor } from "@/context/AppointmentColorContext";
import { useAuth } from "@/hooks/useAuth";
import type { FullAppointment } from "@/hooks/useAppointments";
import type { OwnerUserSummary } from "@/hooks/useOwnerUserSummaries";
import {
  deriveCardDensity,
  resolvePatientDisplayName,
  resolvePatientId,
  statusTextClass,
  type AppointmentCardDensity,
  type AppointmentCardVariant,
} from "@/lib/appointment-card";
import { dedupeAssignees } from "@/lib/appointment-assignees";
import { resolveTreatingPhysicianUserId } from "@/lib/appointment-display-doctor";
import { getAppointmentMenuCapabilities } from "@/lib/appointment-menu-permissions";
import { PATIENT_REFERRAL_SOURCES } from "@/lib/patient-referral-sources";
import type { AppointmentAssignee, Patient } from "@/types/types";

export type UseAppointmentCardModelParams = {
  appointment: FullAppointment;
  patients: Patient[];
  assignees: AppointmentAssignee[];
  ownerUsers: OwnerUserSummary[];
  variant: AppointmentCardVariant;
  slotHeightPx?: number;
  densityOverride?: AppointmentCardDensity;
};

/**
 * Per-card view-model: colors, labels, RBAC capabilities, density.
 * No extra network — reads auth + assignee list passed from parent caches.
 */
export function useAppointmentCardModel({
  appointment,
  patients,
  assignees,
  ownerUsers,
  variant,
  slotHeightPx,
  densityOverride,
}: UseAppointmentCardModelParams) {
  const { user } = useAuth();
  const { getAppointmentColorToken } = useAppointmentColor();

  const start = useMemo(() => new Date(appointment.start), [appointment.start]);
  const end = useMemo(() => new Date(appointment.end), [appointment.end]);
  const isDone = appointment.status === "done";

  const density = useMemo(
    () => deriveCardDensity({ variant, slotHeightPx, densityOverride }),
    [variant, slotHeightPx, densityOverride]
  );

  const colorToken = useMemo(
    // Pass null so card color is always seed-derived from appointment.id, not category color.
    // Category color is shown via CategoryInlineLink swatch inside the card body instead.
    () => getAppointmentColorToken(appointment.id, null),
    [appointment.id, getAppointmentColorToken]
  );

  const patientLabel = useMemo(
    () => resolvePatientDisplayName(appointment, patients),
    [appointment, patients]
  );

  const patientId = useMemo(() => resolvePatientId(appointment), [appointment]);

  const dedupedAssignees = useMemo(
    () => dedupeAssignees(assignees, appointment.id),
    [assignees, appointment.id]
  );

  const resolveStaffLabel = useMemo(() => {
    return (userId: string) => {
      if (userId === user?.id) return `you (${user?.email || "owner"})`;
      const row = ownerUsers.find((u) => u.id === userId);
      if (!row) return userId;
      // "Firstname (email)" when display_name available — consistent format across treating physician + primary doctor:
      return row.display_name ? `${row.display_name} (${row.email})` : row.email;
    };
  }, [ownerUsers, user?.id, user?.email]);

  const calendarOwnerId = appointment.user_id;
  const treatingPhysicianId = useMemo(
    () => resolveTreatingPhysicianUserId(appointment),
    [appointment]
  );
  const treatingDiffersFromOwner = treatingPhysicianId !== calendarOwnerId;

  const ownerLabel = useMemo(
    () => resolveStaffLabel(calendarOwnerId),
    [calendarOwnerId, resolveStaffLabel]
  );

  const treatingPhysicianLabel = useMemo(
    () => resolveStaffLabel(treatingPhysicianId),
    [treatingPhysicianId, resolveStaffLabel]
  );

  const primaryDoctorId = appointment.patient_data?.primary_doctor_id?.trim() || null;
  const primaryDoctorLabel = useMemo(() => {
    if (!primaryDoctorId) return null;
    // resolveStaffLabel gives "Name (email)" format consistent with treating physician row:
    return resolveStaffLabel(primaryDoctorId);
  }, [primaryDoctorId, resolveStaffLabel]);

  const referralLabel = useMemo(() => {
    const profile = appointment.patient_data?.clinical_profile;
    const source = profile?.referral_source?.trim();
    if (!source) return null;
    const mapped = PATIENT_REFERRAL_SOURCES.find((s) => s.value === source)?.label ?? source;
    const detail = profile?.referral_detail?.trim();
    if (detail && (source === "external_partner" || source === "other")) {
      return `${mapped} — ${detail}`;
    }
    return mapped;
  }, [appointment.patient_data?.clinical_profile]);

  const capabilities = useMemo(
    () =>
      getAppointmentMenuCapabilities({
        appointment,
        assignees: appointment.appointment_assignee ?? dedupedAssignees,
        userId: user?.id,
        userEmail: user?.email,
        userRole: user?.role,
      }),
    [appointment, dedupedAssignees, user?.id, user?.email, user?.role]
  );

  const formattedDate = format(start, "dd.MM.yyyy");
  const formattedTime = `${format(start, "HH:mm")} – ${format(end, "HH:mm")}`;
  const statusClass = statusTextClass(appointment.status);

  return {
    start,
    end,
    isDone,
    density,
    colorToken,
    patientLabel,
    patientId,
    dedupedAssignees,
    ownerLabel,
    calendarOwnerId,
    treatingPhysicianId,
    treatingDiffersFromOwner,
    treatingPhysicianLabel,
    primaryDoctorId,
    primaryDoctorLabel,
    referralLabel,
    capabilities,
    formattedDate,
    formattedTime,
    statusClass,
    user,
  };
}
