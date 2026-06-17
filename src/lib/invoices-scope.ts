/**
 * Role-aware invoice listing — aligns patient portal with patient snapshot invoices.
 * Patient rows: `appointment_id` ∈ that chart's visits (no `patient_id` on Invoice).
 * Staff/admin CP tabs use the same rules as GET /api/invoices and GET /api/payments.
 */

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isAdminRole, isDoctorRole, isPatientRole } from "@/lib/rbac";
import {
  getOrganizationMemberOrgIds,
  userCanViewOrganizationInvoices,
} from "@/lib/organization-invoice-access";
import { buildPrismaDoctorInvoiceWhere } from "@/lib/invoice-doctor-scope";
import type { InvoiceBillingTotalsPayload } from "@/lib/invoice-billing-totals";
import {
  emptyInvoiceBillingStatusPayload,
  fetchInvoiceBillingStatusPayloadForWhere,
} from "@/lib/invoice-billing-kpi-aggregate";
import { invoiceAuditUserPick } from "@/lib/invoice-api-include";

const invoiceInclude = {
  payments: true,
  created_by: invoiceAuditUserPick,
} as const;

export type InvoiceViewerScopeOpts = {
  userId: string;
  role: string | null;
  email?: string | null;
  /** Optional org filter — same as list endpoint. */
  organizationId?: string | null;
};

/** `null` = viewer sees no invoices (patient w/o chart, etc.). */
export type InvoiceViewerWhereResult =
  | { kind: "where"; where: Prisma.InvoiceWhereInput }
  | { kind: "empty" };

export type InvoiceWithPaymentsRow = Awaited<
  ReturnType<typeof fetchInvoicesForViewer>
>[number];

/**
 * Shared Prisma filter for viewer-scoped invoice list + KPI aggregates.
 * Admin: all rows (optional org filter). Patient/doctor/staff: RBAC OR clauses.
 */
export async function buildInvoiceViewerWhere(
  opts: InvoiceViewerScopeOpts
): Promise<InvoiceViewerWhereResult> {
  const orgFilterId =
    opts.organizationId != null && opts.organizationId !== ""
      ? opts.organizationId.trim()
      : null;

  if (orgFilterId) {
    const allowed =
      isAdminRole(opts.role) ||
      (await userCanViewOrganizationInvoices(opts.userId, orgFilterId));
    if (!allowed) return { kind: "empty" };
  }

  const orgWhere = orgFilterId ? { organization_id: orgFilterId } : {};

  if (isAdminRole(opts.role)) {
    return { kind: "where", where: orgWhere };
  }

  if (isPatientRole(opts.role) && opts.email) {
    const patient = await prisma.patient.findFirst({
      where: { email: opts.email },
      select: { id: true },
    });
    if (!patient) return { kind: "empty" };

    const appts = await prisma.appointment.findMany({
      where: { patient_id: patient.id },
      select: { id: true },
    });
    const appointmentIds = appts.map((a) => a.id);
    if (appointmentIds.length === 0) return { kind: "empty" };

    return {
      kind: "where",
      where: { appointment_id: { in: appointmentIds }, ...orgWhere },
    };
  }

  const visitIds = await prisma.appointment.findMany({
    where: {
      OR: [{ owner_id: opts.userId }, { treating_physician_id: opts.userId }],
    },
    select: { id: true },
  });
  const appointmentIds = visitIds.map((a) => a.id);
  const memberOrgIds = isDoctorRole(opts.role)
    ? await getOrganizationMemberOrgIds(opts.userId)
    : [];

  return {
    kind: "where",
    where: {
      ...orgWhere,
      OR: [
        { user_id: opts.userId },
        ...(appointmentIds.length > 0
          ? [{ appointment_id: { in: appointmentIds } }]
          : []),
        ...(memberOrgIds.length > 0
          ? [{ organization_id: { in: memberOrgIds } }]
          : []),
      ],
    },
  };
}

/**
 * - Patient: invoices linked to their chart appointments (not `user_id` on invoice row).
 * - Admin: all invoices (CP billing tab).
 * - Doctor/staff: invoices they bill (`user_id`) or tied to visits they own/treat.
 */
export async function fetchInvoicesForViewer(opts: {
  userId: string;
  role: string | null;
  email?: string | null;
  organizationId?: string | null;
  doctorId?: string | null;
}) {
  const orgFilterId =
    opts.organizationId != null && opts.organizationId !== ""
      ? opts.organizationId
      : null;
  const doctorFilterId =
    opts.doctorId != null && opts.doctorId !== "" ? opts.doctorId.trim() : null;

  if (orgFilterId && doctorFilterId) return [];

  if (doctorFilterId) {
    if (!isAdminRole(opts.role) && doctorFilterId !== opts.userId) return [];
    return prisma.invoice.findMany({
      where: buildPrismaDoctorInvoiceWhere(doctorFilterId),
      include: invoiceInclude,
      orderBy: { created_at: "desc" },
    });
  }

  const viewerWhere = await buildInvoiceViewerWhere({
    userId: opts.userId,
    role: opts.role,
    email: opts.email,
    organizationId: orgFilterId,
  });
  if (viewerWhere.kind === "empty") return [];

  return prisma.invoice.findMany({
    where: viewerWhere.where,
    include: invoiceInclude,
    orderBy: { created_at: "desc" },
  });
}

/** Viewer-scoped billing KPI aggregates — invoice hub all scope + role-aware RBAC. */
export async function fetchInvoiceBillingTotalsForViewer(
  opts: InvoiceViewerScopeOpts
): Promise<InvoiceBillingTotalsPayload> {
  const viewerWhere = await buildInvoiceViewerWhere(opts);
  if (viewerWhere.kind === "empty") {
    return emptyInvoiceBillingStatusPayload();
  }
  return fetchInvoiceBillingStatusPayloadForWhere(viewerWhere.where);
}

/** Org billing KPI aggregates — rollups + per-status buckets (Prisma). */
export async function fetchInvoiceBillingTotalsForOrganization(
  organizationId: string
): Promise<InvoiceBillingTotalsPayload> {
  return fetchInvoiceBillingStatusPayloadForWhere({ organization_id: organizationId });
}

/** Doctor-scoped billing KPI aggregates — same buckets as org panel. */
export async function fetchInvoiceBillingTotalsForDoctor(
  doctorId: string
): Promise<InvoiceBillingTotalsPayload> {
  return fetchInvoiceBillingStatusPayloadForWhere(buildPrismaDoctorInvoiceWhere(doctorId));
}

/** @deprecated Prefer `fetchInvoiceBillingTotalsForOrganization` — slim paid/outstanding only. */
export async function fetchInvoiceTotalsForOrganization(organizationId: string) {
  const { totals } = await fetchInvoiceBillingTotalsForOrganization(organizationId);
  return {
    paidCents: totals.paid.cents,
    paidCount: totals.paid.count,
    outstandingCents: totals.outstanding.cents,
    outstandingCount: totals.outstanding.count,
  };
}
