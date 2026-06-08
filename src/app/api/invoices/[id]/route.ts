/**
 * Invoice [id] API — access via invoice-access.ts (not owner_id = session only).
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
import { assertInvoiceStatusTransition } from "@/lib/billing-status";
import { rejectPatchStatusPaid } from "@/lib/billing-patch-guard";
import { invoicePatchSchema } from "@/lib/schemas/invoice";
import { zodBadRequest } from "@/lib/schemas/parse";
import { invalidateBillingRedisCaches } from "@/lib/billing-cache";
import { notifyBillingStatusChange } from "@/lib/billing-notify";
import { serializeInvoice } from "@/lib/serializers";
import {
  attachInvoiceIssuerLabels,
  attachVisitSummariesToInvoices,
} from "@/lib/invoice-visit-summary";

type Params = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = await getUserRole(sessionUser.userId);
    const session: InvoiceAccessSession = {
      userId: sessionUser.userId,
      email: sessionUser.email,
      role,
    };

    const { id } = await params;
    const level = await assertInvoiceAccess(session, id, "view");
    if (level === "none") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { payments: true },
    });
    if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [withVisit] = await attachVisitSummariesToInvoices([serializeInvoice(invoice)]);
    const [enriched] = await attachInvoiceIssuerLabels([withVisit]);

    return NextResponse.json({ invoice: enriched });
  } catch (error: unknown) {
    console.error("Invoice GET error:", error);
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = await getUserRole(sessionUser.userId);
    const session: InvoiceAccessSession = {
      userId: sessionUser.userId,
      email: sessionUser.email,
      role,
    };

    const { id } = await params;
    const level = await assertInvoiceAccess(session, id, "mutate");
    const adminLevel = await assertInvoiceAccess(session, id, "admin");
    if (level === "none" && adminLevel === "none") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (level === "none" && adminLevel !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const json = await req.json();
    const parsed = invoicePatchSchema.safeParse(json);
    if (!parsed.success) return zodBadRequest(parsed.error);

    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { status, description, due_date } = parsed.data;

    const paidGuard = rejectPatchStatusPaid(status);
    if (!paidGuard.ok) {
      return NextResponse.json({ error: paidGuard.message }, { status: 400 });
    }

    if (status && adminLevel !== "admin" && level !== "mutate") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (status && status !== invoice.status) {
      const transition = assertInvoiceStatusTransition(invoice.status, status);
      if (!transition.ok) {
        return NextResponse.json({ error: transition.message }, { status: 400 });
      }
      // Doctors may only move draft → sent on their own drafts.
      if (level === "mutate" && adminLevel !== "admin") {
        if (!(invoice.status === "draft" && status === "sent")) {
          return NextResponse.json(
            { error: "Doctors may only send draft invoices" },
            { status: 403 }
          );
        }
      }
    }

    const patchData: {
      status?: string;
      description?: string | null;
      due_date?: Date | null;
      cancelled_at?: Date;
    } = {};
    if (status) patchData.status = status;
    if (description !== undefined) patchData.description = description;
    if (due_date !== undefined) {
      patchData.due_date = due_date ? new Date(due_date) : null;
    }
    if (status === "cancelled" && invoice.status !== "cancelled") {
      patchData.cancelled_at = new Date();
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: patchData,
      include: { payments: true },
    });

    await invalidateBillingRedisCaches({
      invoiceUserId: invoice.user_id,
      appointmentId: invoice.appointment_id,
    });

    return NextResponse.json({ invoice: updated });
  } catch (error: unknown) {
    console.error("Invoice PATCH error:", error);
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = await getUserRole(sessionUser.userId);
    const session: InvoiceAccessSession = {
      userId: sessionUser.userId,
      email: sessionUser.email,
      role,
    };

    const { id } = await params;
    const adminLevel = await assertInvoiceAccess(session, id, "admin");
    const mutateLevel = await assertInvoiceAccess(session, id, "mutate");
    if (adminLevel !== "admin" && mutateLevel !== "mutate") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (invoice.status === "paid") {
      return NextResponse.json({ error: "Cannot delete a paid invoice" }, { status: 400 });
    }

    await prisma.invoice.delete({ where: { id } });

    await invalidateBillingRedisCaches({
      invoiceUserId: invoice.user_id,
      appointmentId: invoice.appointment_id,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Invoice DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 });
  }
}
