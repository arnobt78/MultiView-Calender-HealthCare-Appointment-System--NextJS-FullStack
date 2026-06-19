/**
 * POST /api/invoices/[id]/record-payment — admin manual mark paid (cash/bank).
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getUserRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import {
  assertInvoiceAccess,
  resolvePatientIdForInvoice,
  type InvoiceAccessSession,
} from "@/lib/invoice-access";
import { invoiceRecordPaymentSchema } from "@/lib/schemas/invoice";
import { zodBadRequest } from "@/lib/schemas/parse";
import { invalidateBillingRedisCaches } from "@/lib/billing-cache";
import { notifyBillingStatusChange } from "@/lib/billing-notify";
import {
  invoiceDetailInclude,
  invoiceUpdateAuditFields,
} from "@/lib/invoice-api-include";
import { enrichInvoiceForApi } from "@/lib/invoice-api-enrich";
import {
  INVOICE_SOFT_DELETED_ERROR,
  isPrismaInvoiceSoftDeleted,
} from "@/lib/invoice-soft-delete-guard";

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

    const body = await req.json();
    const parsed = invoiceRecordPaymentSchema.safeParse(body);
    if (!parsed.success) return zodBadRequest(parsed.error);

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { payments: true },
    });
    if (!invoice) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (isPrismaInvoiceSoftDeleted(invoice)) {
      return NextResponse.json({ error: INVOICE_SOFT_DELETED_ERROR }, { status: 403 });
    }
    if (invoice.status === "paid") {
      return NextResponse.json({ error: "Invoice already paid" }, { status: 400 });
    }
    if (invoice.status === "cancelled") {
      return NextResponse.json({ error: "Cannot record payment on cancelled invoice" }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          invoice_id: id,
          amount: invoice.amount,
          status: "succeeded",
          stripe_payment_id: null,
        },
      });
      return tx.invoice.update({
        where: { id },
        data: {
          status: "paid",
          paid_at: new Date(),
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
      event: "paid",
      patientId,
      appointmentId: invoice.appointment_id,
      invoiceOwnerUserId: invoice.user_id,
    });

    const enriched = await enrichInvoiceForApi(updated);
    return NextResponse.json({ invoice: enriched });
  } catch (error: unknown) {
    console.error("Invoice record-payment error:", error);
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
  }
}
