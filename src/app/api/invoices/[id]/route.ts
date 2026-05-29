/**
 * Invoice [id] API
 * GET:    get single invoice
 * PATCH:  update invoice (status, description, due_date)
 * DELETE: delete invoice (owner only, non-paid)
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

type Params = { params: Promise<{ id: string }> };

/** Per-request API handler (see api-route-dynamic.test.ts). */
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const invoice = await prisma.invoice.findFirst({
      where: { id, user_id: sessionUser.userId },
      include: { payments: true },
    });

    if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ invoice });
  } catch (error: unknown) {
    console.error("Invoice GET error:", error);
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { status, description, due_date } = await req.json();

    const invoice = await prisma.invoice.findFirst({ where: { id, user_id: sessionUser.userId } });
    if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(description !== undefined && { description }),
        ...(due_date !== undefined && { due_date: due_date ? new Date(due_date) : null }),
      },
      include: { payments: true },
    });

    /* Bust the server-side Redis overview cache so revenue/status changes reflect immediately. */
    void redis.invalidateDashboardOverview(sessionUser.userId);

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

    const { id } = await params;

    const invoice = await prisma.invoice.findFirst({ where: { id, user_id: sessionUser.userId } });
    if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (invoice.status === "paid") {
      return NextResponse.json({ error: "Cannot delete a paid invoice" }, { status: 400 });
    }

    await prisma.invoice.delete({ where: { id } });

    /* Bust the server-side Redis overview cache so the deleted invoice is no longer counted. */
    void redis.invalidateDashboardOverview(sessionUser.userId);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Invoice DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 });
  }
}
