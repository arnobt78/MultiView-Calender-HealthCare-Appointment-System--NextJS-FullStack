/**
 * Payments API
 * GET: list invoices (scoped)
 * POST: Stripe Checkout — patient pay or admin test pay
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getUserRole, isPatientRole } from "@/lib/rbac";
import { createCheckoutSession, type StripeCheckoutReturnPath } from "@/lib/stripe";
import { fetchInvoicesForViewer } from "@/lib/invoices-scope";
import {
  assertInvoiceAccess,
  type InvoiceAccessSession,
} from "@/lib/invoice-access";
import { canPatientPayInvoiceStatus } from "@/lib/billing-status";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRole(sessionUser.userId);
    const rows = await fetchInvoicesForViewer({
      userId: sessionUser.userId,
      role,
      email: sessionUser.email,
    });

    return NextResponse.json({ invoices: rows });
  } catch (error: unknown) {
    console.error("Payments GET error:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { invoiceId } = await request.json();

    if (!invoiceId) {
      return NextResponse.json({ error: "invoiceId is required" }, { status: 400 });
    }

    const role = await getUserRole(sessionUser.userId);
    const session: InvoiceAccessSession = {
      userId: sessionUser.userId,
      email: sessionUser.email,
      role,
    };

    const payLevel = await assertInvoiceAccess(session, invoiceId, "pay");
    const adminLevel = await assertInvoiceAccess(session, invoiceId, "admin");
    if (payLevel === "none" && adminLevel === "none") {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    if (payLevel === "none" && adminLevel !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const scoped = await fetchInvoicesForViewer({
      userId: sessionUser.userId,
      role,
      email: sessionUser.email,
    });
    const invoice = scoped.find((row) => row.id === invoiceId);

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (invoice.status === "paid") {
      return NextResponse.json({ error: "Invoice already paid" }, { status: 400 });
    }

    if (isPatientRole(role) && !canPatientPayInvoiceStatus(invoice.status)) {
      return NextResponse.json({ error: "Invoice is not payable" }, { status: 400 });
    }

    const returnPath: StripeCheckoutReturnPath = isPatientRole(role)
      ? "patient-portal"
      : "control-panel/invoice-management";

    const checkout = await createCheckoutSession({
      invoiceId: invoice.id,
      amount: invoice.amount,
      currency: invoice.currency,
      description: invoice.description || `Invoice #${invoice.id.substring(0, 8)}`,
      customerEmail: sessionUser.email,
      returnPath,
    });

    return NextResponse.json({ sessionId: checkout.id, url: checkout.url });
  } catch (error: unknown) {
    console.error("Payments POST error:", error);
    return NextResponse.json({ error: "Failed to create payment session" }, { status: 500 });
  }
}
