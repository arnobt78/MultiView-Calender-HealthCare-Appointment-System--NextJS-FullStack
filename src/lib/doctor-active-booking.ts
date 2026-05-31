import { prisma } from "@/lib/prisma";

export class InactiveDoctorBookingError extends Error {
  constructor(message = "Selected doctor is inactive and cannot be used for new appointments.") {
    super(message);
    this.name = "InactiveDoctorBookingError";
  }
}

/** Server guard — reject booking when treating physician / owner doctor is inactive. */
export async function assertDoctorActiveForBooking(doctorId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: doctorId },
    select: { role: true, is_active: true },
  });
  if (!user || user.role !== "doctor") {
    throw new InactiveDoctorBookingError("Doctor not found.");
  }
  if (user.is_active === false) {
    throw new InactiveDoctorBookingError();
  }
}

/** Edit flows — allow keeping an already-assigned inactive doctor; block switching to inactive. */
export async function assertDoctorActiveForBookingUnlessCurrent(
  nextDoctorId: string,
  currentDoctorId: string | null | undefined
): Promise<void> {
  if (nextDoctorId === (currentDoctorId ?? null)) return;
  await assertDoctorActiveForBooking(nextDoctorId);
}
