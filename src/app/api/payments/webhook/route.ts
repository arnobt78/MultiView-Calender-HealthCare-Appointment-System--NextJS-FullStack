/**
 * Stripe Webhook — checkout.session.completed (idempotent) + payment failures + refunds.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/stripe";
import { invalidateBillingRedisCaches } from "@/lib/billing-cache";
import {
  notifyBillingStatusChange,
} from "@/lib/billing-notify";
import { resolvePatientIdForInvoice } from "@/lib/invoice-access";
import { isStripePaymentAlreadyRecorded } from "@/lib/payments-webhook-idempotency";
import { isHandledStripeWebhookEventType } from "@/lib/stripe-webhook-events";
import { invoiceSystemUpdateAuditFields } from "@/lib/invoice-api-include";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature") ?? "";

  let event: unknown;
  try {
    event = verifyWebhookSignature(rawBody, signature);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Signature verification failed";
    console.error("Webhook signature error:", msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (
    typeof event !== "object" ||
    event === null ||
    !("type" in event) ||
    typeof (event as { type: unknown }).type !== "string"
  ) {
    return NextResponse.json({ error: "Invalid event shape" }, { status: 400 });
  }
  const stripeEvent = event as { type: string; data: { object: Record<string, unknown> } };

  // Stripe CLI forwards every event — skip DB/SSE for types we do not handle.
  if (!isHandledStripeWebhookEventType(stripeEvent.type)) {
    return NextResponse.json({ received: true, ignored: true });
  }

  try {
    switch (stripeEvent.type) {
      case "checkout.session.completed": {
        const session = stripeEvent.data.object;
        const metadata = session.metadata as Record<string, string> | null | undefined;
        const invoiceId = typeof metadata?.invoice_id === "string" ? metadata.invoice_id : null;

        if (!invoiceId) break;

        const paymentIntent =
          typeof session.payment_intent === "string" ? session.payment_intent : null;
        const sessionId = typeof session.id === "string" ? session.id : "";
        const stripeRef = paymentIntent ?? sessionId;

        if (stripeRef && (await isStripePaymentAlreadyRecorded(stripeRef))) {
          break;
        }

        const invoice = await prisma.invoice.findUnique({
          where: { id: invoiceId },
          select: {
            user_id: true,
            appointment_id: true,
            status: true,
            amount: true,
          },
        });
        if (!invoice) break;

        if (invoice.status !== "paid") {
          await prisma.invoice.update({
            where: { id: invoiceId },
            data: {
              status: "paid",
              paid_at: new Date(),
              ...invoiceSystemUpdateAuditFields(),
            },
          });
        }

        const amountTotal =
          typeof session.amount_total === "number" ? session.amount_total : invoice.amount;

        if (stripeRef) {
          await prisma.payment.create({
            data: {
              invoice_id: invoiceId,
              stripe_payment_id: stripeRef,
              amount: amountTotal,
              status: "succeeded",
            },
          });
        }

        await invalidateBillingRedisCaches({
          invoiceUserId: invoice.user_id,
          appointmentId: invoice.appointment_id,
        });

        const patientId = await resolvePatientIdForInvoice(invoiceId);
        await notifyBillingStatusChange({
          invoiceId,
          event: "paid",
          patientId,
          appointmentId: invoice.appointment_id,
          invoiceOwnerUserId: invoice.user_id,
        });
        break;
      }

      case "payment_intent.payment_failed": {
        const intent = stripeEvent.data.object;
        const intentMeta = intent.metadata as Record<string, string> | null | undefined;
        let invoiceId =
          typeof intentMeta?.invoice_id === "string" ? intentMeta.invoice_id : null;

        // Fallback: PI from Checkout may only have metadata when payment_intent_data was set.
        if (!invoiceId && typeof intent.id === "string") {
          const existing = await prisma.payment.findFirst({
            where: { stripe_payment_id: intent.id },
            select: { invoice_id: true },
          });
          invoiceId = existing?.invoice_id ?? null;
        }

        if (invoiceId) {
          const intentId = typeof intent.id === "string" ? intent.id : "";
          if (intentId && (await isStripePaymentAlreadyRecorded(intentId))) break;

          const amount = typeof intent.amount === "number" ? intent.amount : 0;

          await prisma.payment.create({
            data: {
              invoice_id: invoiceId,
              stripe_payment_id: intentId || null,
              amount,
              status: "failed",
            },
          });

          const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            select: { user_id: true, appointment_id: true },
          });
          if (invoice) {
            const patientId = await resolvePatientIdForInvoice(invoiceId);
            await notifyBillingStatusChange({
              invoiceId,
              event: "failed",
              patientId,
              appointmentId: invoice.appointment_id,
              invoiceOwnerUserId: invoice.user_id,
            });
          }
        }
        break;
      }

      case "charge.refunded": {
        const charge = stripeEvent.data.object;
        const paymentIntent =
          typeof charge.payment_intent === "string" ? charge.payment_intent : null;
        if (!paymentIntent) break;

        const payment = await prisma.payment.findFirst({
          where: { stripe_payment_id: paymentIntent },
          include: { invoice: true },
        });
        if (!payment) break;

        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: "refunded" },
        });

        await prisma.invoice.update({
          where: { id: payment.invoice_id },
          data: { status: "cancelled", ...invoiceSystemUpdateAuditFields() },
        });

        await invalidateBillingRedisCaches({
          invoiceUserId: payment.invoice.user_id,
          appointmentId: payment.invoice.appointment_id,
        });

        const patientId = await resolvePatientIdForInvoice(payment.invoice_id);
        await notifyBillingStatusChange({
          invoiceId: payment.invoice_id,
          event: "refunded",
          patientId,
          appointmentId: payment.invoice.appointment_id,
          invoiceOwnerUserId: payment.invoice.user_id,
        });
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
