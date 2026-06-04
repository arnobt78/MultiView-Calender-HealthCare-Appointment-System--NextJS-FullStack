/**
 * Visit fee resolution — appointment type price_cents overrides doctor consultation_fee,
 * then product default (€150) when neither is set.
 */

import { prisma } from "@/lib/prisma";

/** Default visit fee when type and doctor consultation_fee are unset (€150.00). */
export const DEFAULT_DOCTOR_VISIT_FEE_CENTS = 15000;

export type VisitFeeInput = {
  typePriceCents?: number | null;
  doctorConsultationFeeCents?: number | null;
};

/** Returns fee in cents; falls back to {@link DEFAULT_DOCTOR_VISIT_FEE_CENTS}. */
export function resolveVisitFeeCents(input: VisitFeeInput): number {
  const typePrice = input.typePriceCents ?? 0;
  if (typePrice > 0) return typePrice;
  const doctorFee = input.doctorConsultationFeeCents ?? 0;
  if (doctorFee > 0) return doctorFee;
  return DEFAULT_DOCTOR_VISIT_FEE_CENTS;
}

/** Load visit fee for an appointment (type price, else treating then owner consultation_fee, else default). */
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
  return resolveVisitFeeCents({
    typePriceCents: appt.appointment_type?.price_cents,
    doctorConsultationFeeCents: feeDoctor?.consultation_fee,
  });
}
