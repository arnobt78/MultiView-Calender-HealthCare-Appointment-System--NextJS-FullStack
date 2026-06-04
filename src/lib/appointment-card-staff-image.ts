/**
 * Staff portrait resolution for dashboard appointment cards — avoids robohash when
 * patient denormalization, portal joins, or sibling staff rows already have `image`.
 */

import type { OwnerUserSummary } from "@/hooks/useOwnerUserSummaries";
import type { PortalAppointmentStaffUser } from "@/lib/serializers";
import type { Patient } from "@/types/types";

export type AppointmentCardStaffImageContext = {
  patient_data?: Patient | null;
  calendarOwnerId?: string | null;
  treatingPhysicianId?: string | null;
  /** Patient dashboard / portal rows — no `/api/users/search` for patients. */
  portal_owner?: PortalAppointmentStaffUser | null;
  portal_treating_physician?: PortalAppointmentStaffUser | null;
};

function imageFromOwnerUsers(
  userId: string | null | undefined,
  ownerUsers: OwnerUserSummary[]
): string | null {
  if (!userId) return null;
  const row = ownerUsers.find((u) => u.id === userId);
  const trimmed = row?.image?.trim();
  return trimmed || null;
}

function imageFromPortalStaff(
  staff: PortalAppointmentStaffUser | null | undefined
): string | null {
  const trimmed = staff?.image?.trim();
  return trimmed || null;
}

/** Primary doctor avatar — patient field, portal joins, directory, then owner/treating peers. */
export function resolvePrimaryDoctorCardImage(
  ctx: AppointmentCardStaffImageContext,
  primaryDoctorId: string,
  ownerUsers: OwnerUserSummary[]
): string | null {
  const fromPatient = ctx.patient_data?.primary_doctor_image?.trim();
  if (fromPatient) return fromPatient;

  const portalOwnerMatch =
    ctx.portal_owner?.id === primaryDoctorId ? imageFromPortalStaff(ctx.portal_owner) : null;
  if (portalOwnerMatch) return portalOwnerMatch;

  const portalTreatingMatch =
    ctx.portal_treating_physician?.id === primaryDoctorId
      ? imageFromPortalStaff(ctx.portal_treating_physician)
      : null;
  if (portalTreatingMatch) return portalTreatingMatch;

  const fromDirectory = imageFromOwnerUsers(primaryDoctorId, ownerUsers);
  if (fromDirectory) return fromDirectory;

  const ownerId = ctx.calendarOwnerId?.trim();
  if (ownerId === primaryDoctorId) {
    const ownerImage =
      imageFromPortalStaff(ctx.portal_owner) ?? imageFromOwnerUsers(ownerId, ownerUsers);
    if (ownerImage) return ownerImage;
  }

  const treatingId = ctx.treatingPhysicianId?.trim();
  if (treatingId === primaryDoctorId) {
    const treatingImage =
      imageFromPortalStaff(ctx.portal_treating_physician) ??
      imageFromOwnerUsers(treatingId, ownerUsers);
    if (treatingImage) return treatingImage;
  }

  return null;
}
