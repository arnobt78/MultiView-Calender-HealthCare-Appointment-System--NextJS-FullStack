/**
 * When an admin mutates another doctor's schedule or visit types, notify the doctor in-app + email.
 * Fire-and-forget — never blocks API responses.
 */

import { prisma } from "@/lib/prisma";
import { getUserRole, isAdminRole } from "@/lib/rbac";
import { sendEmail } from "@/lib/email";

export type DoctorSettingsChangeKind =
  | "weekly_schedule"
  | "time_off"
  | "visit_type"
  | "global_visit_toggle";

const KIND_LABEL: Record<DoctorSettingsChangeKind, string> = {
  weekly_schedule: "weekly availability",
  time_off: "time off",
  visit_type: "appointment type",
  global_visit_toggle: "global visit type access",
};

/**
 * No-op when actor is the doctor or actor is not admin. Called after successful DB writes.
 */
export function notifyDoctorSettingsChangedByAdmin(opts: {
  actorUserId: string;
  doctorUserId: string;
  changeKind: DoctorSettingsChangeKind;
  detail?: string;
}): void {
  void notifyDoctorSettingsChangedByAdminAsync(opts);
}

async function notifyDoctorSettingsChangedByAdminAsync(opts: {
  actorUserId: string;
  doctorUserId: string;
  changeKind: DoctorSettingsChangeKind;
  detail?: string;
}): Promise<void> {
  const { actorUserId, doctorUserId, changeKind, detail } = opts;
  if (actorUserId === doctorUserId) return;

  const role = await getUserRole(actorUserId);
  if (!isAdminRole(role)) return;

  const doctor = await prisma.user.findUnique({
    where: { id: doctorUserId },
    select: { email: true, display_name: true },
  });
  if (!doctor) return;

  const label = KIND_LABEL[changeKind];
  const title = "Schedule settings updated";
  const message =
    detail?.trim() ||
    `An administrator updated your ${label}. Review your doctor portal settings.`;
  const link = "/doctor-portal";

  await prisma.notification.create({
    data: {
      user_id: doctorUserId,
      title,
      message,
      type: "info",
      link,
    },
  });

  if (!doctor.email?.trim()) return;

  try {
    await sendEmail({
      to: doctor.email.trim(),
      subject: `HealthCal Pro — ${title}`,
      html: `<p>Hi${doctor.display_name ? ` ${doctor.display_name}` : ""},</p><p>${message}</p><p><a href="${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}${link}">Open doctor portal</a></p>`,
    });
  } catch {
    // Email is best-effort; in-app notification already persisted.
  }
}
