/**
 * Invoices API
 * GET:  role-aware list (invoices-scope)
 * POST: create draft — admin or doctor (appointment-linked billing owner)
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getUserRole, isPatientRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { fetchInvoicesForViewer } from "@/lib/invoices-scope";
import { serializeInvoice } from "@/lib/serializers";
import {
  canCreateInvoiceForAppointment,
  resolveInvoiceBillingUserId,
  type InvoiceAccessSession,
} from "@/lib/invoice-access";
import { invoiceCreateSchema } from "@/lib/schemas/invoice";
import { zodBadRequest } from "@/lib/schemas/parse";
import {
  invalidateBillingRedisCaches,
  resolvePatientPortalUserIdForAppointment,
} from "@/lib/billing-cache";
import { resolveInvoiceOrganizationId } from "@/lib/invoice-organization-resolve";
import { assertAppointmentEligibleForNewInvoice } from "@/lib/billing-appointment-eligibility";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = await getUserRole(sessionUser.userId);
    const organizationId = req.nextUrl.searchParams.get("organizationId");
    const rows = await fetchInvoicesForViewer({
      userId: sessionUser.userId,
      role,
      email: sessionUser.email,
      organizationId,
    });

    const invoices = rows.map((row) => ({
      ...serializeInvoice(row),
      payments: row.payments,
    }));

    return NextResponse.json({ invoices });
  } catch (error: unknown) {
    console.error("Invoices GET error:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = await getUserRole(sessionUser.userId);
    if (isPatientRole(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const session: InvoiceAccessSession = {
      userId: sessionUser.userId,
      email: sessionUser.email,
      role,
    };

    const json = await req.json();
    const parsed = invoiceCreateSchema.safeParse(json);
    if (!parsed.success) return zodBadRequest(parsed.error);

    const { amount, currency, description, appointment_id, due_date, organization_id } =
      parsed.data;

    const [canCreate, billingUserId, patientPortalUserId] = await Promise.all([
      canCreateInvoiceForAppointment(session, appointment_id),
      resolveInvoiceBillingUserId(appointment_id, sessionUser.userId),
      resolvePatientPortalUserIdForAppointment(appointment_id),
    ]);

    if (!canCreate) {
      return NextResponse.json(
        { error: "Appointment not found or forbidden" },
        { status: 403 }
      );
    }

    const eligibility = await assertAppointmentEligibleForNewInvoice(appointment_id);
    if (!eligibility.ok) {
      return NextResponse.json(
        { error: eligibility.message, invoice_id: eligibility.invoiceId },
        { status: eligibility.status }
      );
    }

    const orgResolved = await resolveInvoiceOrganizationId({
      sessionUserId: sessionUser.userId,
      role,
      appointmentId: appointment_id,
      billingUserId,
      explicitOrganizationId: organization_id ?? null,
    });
    if (orgResolved.forbidden) {
      return NextResponse.json(
        { error: "Organization not found or forbidden" },
        { status: 403 }
      );
    }

    const invoice = await prisma.invoice.create({
      data: {
        user_id: billingUserId,
        amount: Math.round(amount * 100),
        currency,
        description: description ?? null,
        appointment_id,
        organization_id: orgResolved.organizationId,
        due_date: due_date ? new Date(due_date) : null,
        status: "draft",
      },
      include: { payments: true },
    });

    await invalidateBillingRedisCaches({
      invoiceUserId: billingUserId,
      appointmentId: appointment_id,
      patientPortalUserId,
    });

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error: unknown) {
    console.error("Invoices POST error:", error);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
