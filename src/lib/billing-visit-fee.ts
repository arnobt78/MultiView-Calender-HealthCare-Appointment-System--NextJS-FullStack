/**
 * Visit fee resolution — appointment type price_cents overrides doctor consultation_fee.
 * Shared by auto-draft, manual invoice picker, and UI prefill.
 */

import { prisma } from "@/lib/prisma";

export type VisitFeeInput = {
  typePriceCents?: number | null;
  doctorConsultationFeeCents?: number | null;
};

/** Returns fee in cents; 0 when neither type nor doctor fee is set. */
export function resolveVisitFeeCents(input: VisitFeeInput): number {
  const typePrice = input.typePriceCents ?? 0;
  if (typePrice > 0) return typePrice;
  const doctorFee = input.doctorConsultationFeeCents ?? 0;
  return doctorFee > 0 ? doctorFee : 0;
}

/** Load visit fee for an appointment (type price, else treating then owner consultation_fee). */
export async function loadVisitFeeCentsForAppointment(
  appointmentId: string
): Promise<number | null> {
  const appt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: {
      appointment_type: { select: { price_cents: true } },
      owner: { select: { consultation_fee: true } },
      treating_physician: { select: { consultation_fee: true } },
    },
  });
  if (!appt) return null;

  const feeDoctor = appt.treating_physician ?? appt.owner;
  const cents = resolveVisitFeeCents({
    typePriceCents: appt.appointment_type?.price_cents,
    doctorConsultationFeeCents: feeDoctor?.consultation_fee,
  });
  return cents > 0 ? cents : null;
}
