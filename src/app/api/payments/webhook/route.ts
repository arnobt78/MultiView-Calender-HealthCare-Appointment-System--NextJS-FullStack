/**
 * Stripe Webhook Handler
 * 
 * POST /api/payments/webhook — handle Stripe events
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const event = JSON.parse(body);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const invoiceId = session.metadata?.invoice_id;

        if (invoiceId) {
          // Update invoice status
          await prisma.invoice.update({
            where: { id: invoiceId },
            data: { status: "paid", paid_at: new Date() },
          });

          // Record payment
          await prisma.payment.create({
            data: {
              invoice_id: invoiceId,
              stripe_payment_id: session.payment_intent || session.id,
              amount: session.amount_total || 0,
              status: "succeeded",
            },
          });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const intent = event.data.object;
        const invoiceId = intent.metadata?.invoice_id;

        if (invoiceId) {
          await prisma.payment.create({
            data: {
              invoice_id: invoiceId,
              stripe_payment_id: intent.id,
              amount: intent.amount || 0,
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
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
