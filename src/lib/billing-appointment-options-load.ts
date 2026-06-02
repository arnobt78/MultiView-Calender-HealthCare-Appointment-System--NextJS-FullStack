/**
 * Shared load for GET /api/billing/appointment-options — API route + SSR prefetch.
 */

import { prisma } from "@/lib/prisma";
import { PAGINATION } from "@/lib/constants";
import { isValidUUID } from "@/lib/validation";
import { isAdminRole, isDoctorRole } from "@/lib/rbac";
import type { InvoiceAppointmentOptionRow } from "@/lib/billing-types";
import {
  mapLatestInvoicesByAppointmentId,
  resolveAppointmentBillingSummary,
} from "@/lib/billing-appointment-eligibility";
import { resolveVisitFeeCents } from "@/lib/billing-visit-fee";

const PICKER_LIMIT = 40;

export type FetchBillingAppointmentOptionsInput = {
  sessionUserId: string;
  role: string | null;
  search?: string;
  /** Admin-only: include visits with blocking invoices (disabled rows). */
  includeBilled?: boolean;
};

export async function fetchBillingAppointmentOptions(
  input: FetchBillingAppointmentOptionsInput
): Promise<InvoiceAppointmentOptionRow[]> {
  const { sessionUserId, role } = input;
  const search = input.search?.trim() ?? "";
  const includeBilled = Boolean(isAdminRole(role) && input.includeBilled);

  if (!isAdminRole(role) && !isDoctorRole(role)) {
    return [];
  }

  const searchFilter =
    search.length > 0
      ? isValidUUID(search)
        ? { id: search }
        : { title: { contains: search, mode: "insensitive" as const } }
      : {};

  const where = isAdminRole(role)
    ? searchFilter
    : {
        AND: [
          searchFilter,
          {
            OR: [
              { owner_id: sessionUserId },
              { treating_physician_id: sessionUserId },
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
      treating_physician_id: true,
      patient: { select: { firstname: true, lastname: true, email: true } },
      appointment_type: { select: { price_cents: true } },
      owner: { select: { consultation_fee: true } },
      treating_physician: { select: { consultation_fee: true } },
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

    const feeDoctor = row.treating_physician ?? row.owner;
    const visitFeeCents = resolveVisitFeeCents({
      typePriceCents: row.appointment_type?.price_cents,
      doctorConsultationFeeCents: feeDoctor?.consultation_fee,
    });
    const suggestedAmountCents =
      billing.eligible && visitFeeCents > 0 ? visitFeeCents : null;

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
      suggested_amount_cents: suggestedAmountCents,
    });
  }

  return options;
}
