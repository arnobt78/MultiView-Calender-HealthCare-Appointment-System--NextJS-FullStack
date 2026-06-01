/**
 * Invoices API
 * GET:  list user's invoices
 * POST: create invoice
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getUserRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { isValidUUID } from "@/lib/validation";
import { fetchInvoicesForViewer } from "@/lib/invoices-scope";
import { serializeInvoice } from "@/lib/serializers";

/** Per-request API handler (see api-route-dynamic.test.ts). */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = await getUserRole(sessionUser.userId);
    const rows = await fetchInvoicesForViewer({
      userId: sessionUser.userId,
      role,
      email: sessionUser.email,
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

    const { amount, currency = "eur", description, appointment_id, due_date } = await req.json();

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
    }

    // When an appointment is linked, validate UUID format first to prevent malformed Prisma queries.
    if (appointment_id && (typeof appointment_id !== "string" || !isValidUUID(appointment_id))) {
      return NextResponse.json({ error: "Invalid appointment_id format" }, { status: 400 });
    }
    if (appointment_id) {
      const appt = await prisma.appointment.findFirst({
        where: { id: appointment_id, owner_id: sessionUser.userId },
        select: { id: true },
      });
      if (!appt) {
        return NextResponse.json({ error: "Appointment not found or forbidden" }, { status: 403 });
      }
    }

    const invoice = await prisma.invoice.create({
      data: {
        user_id: sessionUser.userId,
        amount: Math.round(amount * 100), // store as cents
        currency,
        description: description ?? null,
        appointment_id: appointment_id ?? null,
        due_date: due_date ? new Date(due_date) : null,
        status: "draft",
      },
      include: { payments: true },
    });

    /*
     * Bust the server-side Redis overview cache so revenue totals
     * and invoice counts in the dashboard card update immediately.
     */
    void redis.invalidateDashboardOverview(sessionUser.userId);

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error: unknown) {
    console.error("Invoices POST error:", error);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
