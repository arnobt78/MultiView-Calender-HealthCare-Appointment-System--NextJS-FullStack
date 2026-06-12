/**
 * POST /api/invoices/[id]/refund — admin Stripe refund on last succeeded payment.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getUserRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { createRefund } from "@/lib/stripe";
import {
  assertInvoiceAccess,
  resolvePatientIdForInvoice,
  type InvoiceAccessSession,
} from "@/lib/invoice-access";
import { invoiceRefundSchema } from "@/lib/schemas/invoice";
import { zodBadRequest } from "@/lib/schemas/parse";
import { invalidateBillingRedisCaches } from "@/lib/billing-cache";
import { notifyBillingStatusChange } from "@/lib/billing-notify";
import {
  invoiceDetailInclude,
  invoiceUpdateAuditFields,
} from "@/lib/invoice-api-include";
import { enrichInvoiceForApi } from "@/lib/invoice-api-enrich";

type Params = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRole(sessionUser.userId);
    const session: InvoiceAccessSession = {
      userId: sessionUser.userId,
      email: sessionUser.email,
      role,
    };

    const { id } = await params;
    const level = await assertInvoiceAccess(session, id, "admin");
    if (level !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = invoiceRefundSchema.safeParse(body);
    if (!parsed.success) return zodBadRequest(parsed.error);

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        payments: {
          where: { status: "succeeded" },
          orderBy: { created_at: "desc" },
        },
      },
    });
    if (!invoice) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (invoice.status !== "paid") {
      return NextResponse.json({ error: "Only paid invoices can be refunded" }, { status: 400 });
    }

    const payment = invoice.payments.find((p) => p.stripe_payment_id);
    if (!payment?.stripe_payment_id) {
      return NextResponse.json(
        { error: "No Stripe payment on file — use manual adjustment" },
        { status: 400 }
      );
    }

    await createRefund(payment.stripe_payment_id);

    const refundedAt = new Date();
    const updated = await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "refunded", refunded_at: refundedAt },
      });
      return tx.invoice.update({
        where: { id },
        data: {
          status: "cancelled",
          cancelled_at: refundedAt,
          ...invoiceUpdateAuditFields(sessionUser.userId),
        },
        include: invoiceDetailInclude,
      });
    });

    await invalidateBillingRedisCaches({
      invoiceUserId: invoice.user_id,
      appointmentId: invoice.appointment_id,
    });

    const patientId = await resolvePatientIdForInvoice(id);
    await notifyBillingStatusChange({
      invoiceId: id,
      event: "refunded",
      patientId,
      appointmentId: invoice.appointment_id,
      invoiceOwnerUserId: invoice.user_id,
    });

    const enriched = await enrichInvoiceForApi(updated);
    return NextResponse.json({ invoice: enriched });
  } catch (error: unknown) {
    console.error("Invoice refund error:", error);
    return NextResponse.json({ error: "Failed to process refund" }, { status: 500 });
  }
}
