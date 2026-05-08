/**
 * Stripe Webhook Handler
 * 
 * POST /api/payments/webhook — handle Stripe events
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { verifyWebhookSignature } from "@/lib/stripe";

// Next.js must not parse this route's body — Stripe needs the raw bytes for HMAC.
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature") ?? "";

  // Reject immediately if the HMAC signature check fails.
  let event: unknown;
  try {
    event = verifyWebhookSignature(rawBody, signature);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Signature verification failed";
    console.error("Webhook signature error:", msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Type-narrow the Stripe event object for safe field access.
  if (
    typeof event !== "object" ||
    event === null ||
    !("type" in event) ||
    typeof (event as { type: unknown }).type !== "string"
  ) {
    return NextResponse.json({ error: "Invalid event shape" }, { status: 400 });
  }
  const stripeEvent = event as { type: string; data: { object: Record<string, unknown> } };

  try {

    switch (stripeEvent.type) {
      case "checkout.session.completed": {
        const session = stripeEvent.data.object;
        const metadata = session.metadata as Record<string, string> | null | undefined;
        const invoiceId = typeof metadata?.invoice_id === "string" ? metadata.invoice_id : null;

        if (invoiceId) {
          /*
           * Fetch invoice first so we have user_id for cache invalidation —
           * Stripe webhooks arrive without a session, so we resolve ownership
           * from the invoice record itself.
           */
          const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            select: { user_id: true },
          });

          // Update invoice status
          await prisma.invoice.update({
            where: { id: invoiceId },
            data: { status: "paid", paid_at: new Date() },
          });

          const paymentIntent = typeof session.payment_intent === "string" ? session.payment_intent : null;
          const sessionId = typeof session.id === "string" ? session.id : "";
          const amountTotal = typeof session.amount_total === "number" ? session.amount_total : 0;

          // Record payment
          await prisma.payment.create({
            data: {
              invoice_id: invoiceId,
              stripe_payment_id: paymentIntent ?? sessionId,
              amount: amountTotal,
              status: "succeeded",
            },
          });

          /*
           * Bust the Redis overview cache for the invoice owner so the
           * updated revenue totals (paid vs outstanding) reflect on the
           * dashboard without waiting for the 90 s TTL to expire.
           */
          if (invoice?.user_id) {
            void redis.invalidateDashboardOverview(invoice.user_id);
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const intent = stripeEvent.data.object;
        const intentMeta = intent.metadata as Record<string, string> | null | undefined;
        const invoiceId = typeof intentMeta?.invoice_id === "string" ? intentMeta.invoice_id : null;

        if (invoiceId) {
          const intentId = typeof intent.id === "string" ? intent.id : "";
          const amount = typeof intent.amount === "number" ? intent.amount : 0;

          await prisma.payment.create({
            data: {
              invoice_id: invoiceId,
              stripe_payment_id: intentId,
              amount,
              status: "failed",
            },
          });
        }
        break;
      }

      default:
        // Ignore unhandled events
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
