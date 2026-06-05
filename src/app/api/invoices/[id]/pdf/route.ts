/**
 * Invoice printable HTML — SSR document for Download / Save as PDF (browser print).
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getUserRole } from "@/lib/rbac";
import { assertInvoiceAccess, type InvoiceAccessSession } from "@/lib/invoice-access";
import {
  attachInvoiceIssuerLabels,
  attachVisitSummariesToInvoices,
} from "@/lib/invoice-visit-summary";
import { serializeInvoice } from "@/lib/serializers";
import { prisma } from "@/lib/prisma";
import {
  buildInvoicePrintHtml,
  invoicePdfDownloadFilename,
} from "@/lib/invoice-pdf-document";
import type { Invoice } from "@/hooks/usePayments";

type Params = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const role = await getUserRole(sessionUser.userId);
    const session: InvoiceAccessSession = {
      userId: sessionUser.userId,
      email: sessionUser.email,
      role,
    };

    const { id } = await params;
    const level = await assertInvoiceAccess(session, id, "view");
    if (level === "none") {
      return new NextResponse("Not found", { status: 404 });
    }

    const row = await prisma.invoice.findUnique({
      where: { id },
      include: { payments: { orderBy: { created_at: "desc" } } },
    });
    if (!row) {
      return new NextResponse("Not found", { status: 404 });
    }

    const base: Invoice = {
      ...serializeInvoice(row),
      appointment_id: row.appointment_id ?? undefined,
      organization_id: row.organization_id ?? undefined,
      description: row.description ?? undefined,
      due_date: row.due_date?.toISOString() ?? undefined,
      paid_at: row.paid_at?.toISOString() ?? undefined,
      payments: row.payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        created_at: p.created_at.toISOString(),
        stripe_payment_id: p.stripe_payment_id ?? undefined,
      })),
    };

    const [withVisit] = await attachVisitSummariesToInvoices([base]);
    const [enriched] = await attachInvoiceIssuerLabels([withVisit]);

    const download = req.nextUrl.searchParams.get("download") === "1";
    const autoPrint = !download && req.nextUrl.searchParams.get("print") === "1";
    const html = buildInvoicePrintHtml(enriched, { autoPrint });

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        ...(download
          ? {
              "Content-Disposition": `attachment; filename="${invoicePdfDownloadFilename(enriched.id)}"`,
            }
          : {}),
      },
    });
  } catch {
    return new NextResponse("Internal error", { status: 500 });
  }
}
