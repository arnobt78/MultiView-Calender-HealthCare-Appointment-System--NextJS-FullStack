/**
 * Shared Prisma query + serializer for `GET /api/appointment-types?doctorId=`
 * and SSR `prefetchDoctorPortalSettings` — owned rows include inactive (`is_active` toggle in portal).
 */

import { prisma } from "@/lib/prisma";

export type SerializedDoctorAppointmentType = {
  id: string;
  created_at: string;
  user_id: string | null;
  name: string;
  description: string | null;
  duration_minutes: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  slot_interval_minutes: number;
  minimum_notice_minutes: number;
  is_telehealth: boolean;
  color: string | null;
  icon: string | null;
  is_active: boolean;
  is_enabled: boolean;
  /** Visit fee in cents — 0 means no explicit price set; auto-draft falls back to doctor consultation_fee. */
  price_cents: number;
};

export async function fetchAppointmentTypesForDoctorManager(
  doctorId: string
): Promise<SerializedDoctorAppointmentType[]> {
  const types = await prisma.appointmentType.findMany({
    where: {
      OR: [
        { user_id: doctorId },
        { user_id: null, is_active: true },
      ],
    },
    include: {
      doctor_configs: {
        where: { doctor_id: doctorId },
        select: { is_enabled: true },
      },
    },
    orderBy: [{ user_id: "desc" }, { name: "asc" }],
  });

  return types.map((t) => ({
    id: t.id,
    created_at: t.created_at.toISOString(),
    user_id: t.user_id,
    name: t.name,
    description: t.description,
    duration_minutes: t.duration_minutes,
    buffer_before_minutes: t.buffer_before_minutes,
    buffer_after_minutes: t.buffer_after_minutes,
    slot_interval_minutes: t.slot_interval_minutes,
    minimum_notice_minutes: t.minimum_notice_minutes,
    is_telehealth: t.is_telehealth,
    color: t.color,
    icon: t.icon,
    is_active: t.is_active,
    is_enabled:
      t.user_id === doctorId
        ? t.is_active
        : (t.doctor_configs[0]?.is_enabled ?? true),
    price_cents: t.price_cents,
  }));
}
