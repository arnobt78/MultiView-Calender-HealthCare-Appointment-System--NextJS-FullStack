/**
 * Payments API
 * 
 * GET: list user's invoices
 * POST: create checkout session for an invoice
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getUserRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession } from "@/lib/stripe";
import { fetchInvoicesForViewer } from "@/lib/invoices-scope";

/** Per-request API handler (see api-route-dynamic.test.ts). */
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

    const session = await createCheckoutSession({
      invoiceId: invoice.id,
      amount: invoice.amount,
      currency: invoice.currency,
      description: invoice.description || `Invoice #${invoice.id.substring(0, 8)}`,
      customerEmail: sessionUser.email,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: unknown) {
    console.error("Payments POST error:", error);
    return NextResponse.json({ error: "Failed to create payment session" }, { status: 500 });
  }
}
