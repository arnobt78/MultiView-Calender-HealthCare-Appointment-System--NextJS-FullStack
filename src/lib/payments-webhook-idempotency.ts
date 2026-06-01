/**
 * Stripe webhook idempotency — skip duplicate Payment rows for the same stripe_payment_id.
 */

import { prisma } from "@/lib/prisma";

export async function isStripePaymentAlreadyRecorded(
  stripePaymentId: string
): Promise<boolean> {
  const existing = await prisma.payment.findFirst({
    where: { stripe_payment_id: stripePaymentId },
    select: { id: true },
  });
  return existing != null;
}
