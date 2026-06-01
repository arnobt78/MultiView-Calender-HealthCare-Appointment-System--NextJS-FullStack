/**
 * GET /api/billing/appointment-options — visits for invoice create (admin | doctor).
 * Default: only visits without a blocking invoice. Admin `includeBilled=1` adds disabled rows.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getUserRole, isAdminRole, isDoctorRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { PAGINATION } from "@/lib/constants";
import { isValidUUID } from "@/lib/validation";
import type { InvoiceAppointmentOptionRow } from "@/lib/billing-types";
import {
  mapLatestInvoicesByAppointmentId,
  resolveAppointmentBillingSummary,
} from "@/lib/billing-appointment-eligibility";

export const dynamic = "force-dynamic";

const PICKER_LIMIT = 40;

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRole(sessionUser.userId);
    const search = req.nextUrl.searchParams.get("search")?.trim() ?? "";
    const includeBilledParam = req.nextUrl.searchParams.get("includeBilled") === "1";
    const includeBilled = isAdminRole(role) && includeBilledParam;

    if (!isAdminRole(role) && !isDoctorRole(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchFilter =
      search.length > 0
        ? isValidUUID(search)
          ? { id: search }
          : {
              title: { contains: search, mode: "insensitive" as const },
            }
        : {};

    const where = isAdminRole(role)
      ? searchFilter
      : {
          AND: [
            searchFilter,
            {
              OR: [
                { owner_id: sessionUser.userId },
                { treating_physician_id: sessionUser.userId },
              ],
            },
          ],
        };

    const rows = await prisma.appointment.findMany({
      where,
      orderBy: { start: "desc" },
      take: Math.min(PICKER_LIMIT, PAGINATION.MAX_LIMIT),
      select: {
        id: true,
        title: true,
        start: true,
        end: true,
        owner_id: true,
        patient: { select: { firstname: true, lastname: true, email: true } },
      },
    });

    const apptIds = rows.map((r) => r.id);
    const invoiceRows =
      apptIds.length > 0
        ? await prisma.invoice.findMany({
            where: { appointment_id: { in: apptIds } },
            orderBy: { created_at: "desc" },
            select: {
              id: true,
              appointment_id: true,
              status: true,
              amount: true,
              currency: true,
              created_at: true,
              payments: { select: { status: true } },
            },
          })
        : [];

    const latestByAppt = mapLatestInvoicesByAppointmentId(invoiceRows);

    const options: InvoiceAppointmentOptionRow[] = [];

    for (const row of rows) {
      const latest = latestByAppt.get(row.id) ?? null;
      const billing = resolveAppointmentBillingSummary(latest);
      if (!billing.eligible && !includeBilled) continue;

      options.push({
        id: row.id,
        title: row.title,
        start: row.start.toISOString(),
        end: row.end.toISOString(),
        owner_id: row.owner_id,
        patient_label:
          [row.patient?.firstname, row.patient?.lastname].filter(Boolean).join(" ").trim() ||
          row.patient?.email?.trim() ||
          "Patient",
        eligible: billing.eligible,
        block_reason: billing.blockReason,
        invoice_id: billing.invoiceId,
        invoice_status: billing.invoiceStatus,
        display_status: billing.displayStatus,
        amount_cents: billing.amountCents,
        currency: billing.currency,
      });
    }

    return NextResponse.json({ options });
  } catch (error: unknown) {
    console.error("billing/appointment-options error:", error);
    return NextResponse.json({ error: "Failed to load appointments" }, { status: 500 });
  }
}
