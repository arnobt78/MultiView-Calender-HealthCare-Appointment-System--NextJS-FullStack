/**
 * Payments API
 * 
 * GET: list user's invoices
 * POST: create checkout session for an invoice
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession } from "@/lib/stripe";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoices = await prisma.invoice.findMany({
      where: { user_id: sessionUser.userId },
      include: { payments: true },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ invoices });
  } catch (error) {
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

    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, user_id: sessionUser.userId },
    });

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
  } catch (error) {
    console.error("Payments POST error:", error);
    return NextResponse.json({ error: "Failed to create payment session" }, { status: 500 });
  }
}
