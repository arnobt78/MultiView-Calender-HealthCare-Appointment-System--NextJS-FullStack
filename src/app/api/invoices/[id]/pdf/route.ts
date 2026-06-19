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
import { parseStoredVisitSnapshot } from "@/lib/invoice-visit-summary";
import { prisma } from "@/lib/prisma";
import {
  buildInvoicePrintHtml,
  invoicePdfDownloadFilename,
} from "@/lib/invoice-pdf-document";
import {
  INVOICE_SOFT_DELETED_ERROR,
  isPrismaInvoiceSoftDeleted,
} from "@/lib/invoice-soft-delete-guard";

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

    if (isPrismaInvoiceSoftDeleted(row)) {
      return new NextResponse(INVOICE_SOFT_DELETED_ERROR, { status: 403 });
    }

    // Align with invoice-detail-ssr — lifecycle TS on payments (refunded_at) + cancelled_at.
    const serialized = serializeInvoice(row);
    const base: import("@/hooks/usePayments").Invoice = {
      ...serialized,
      appointment_id: serialized.appointment_id ?? undefined,
      organization_id: row.organization_id ?? undefined,
      description: serialized.description ?? undefined,
      due_date: serialized.due_date ?? undefined,
      paid_at: serialized.paid_at ?? undefined,
      cancelled_at: serialized.cancelled_at ?? undefined,
      visit_detached_at: serialized.visit_detached_at ?? undefined,
      visit_snapshot: parseStoredVisitSnapshot(serialized.visit_snapshot) ?? undefined,
      payments: serialized.payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        created_at: p.created_at,
        refunded_at: p.refunded_at ?? undefined,
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
