/**
 * Role-aware invoice listing — aligns patient portal with patient snapshot invoices.
 * Patient rows: `appointment_id` ∈ that chart's visits (no `patient_id` on Invoice).
 * Staff/admin CP tabs use the same rules as GET /api/invoices and GET /api/payments.
 */

import { prisma } from "@/lib/prisma";
import { isAdminRole, isDoctorRole, isPatientRole } from "@/lib/rbac";
import {
  getOrganizationMemberOrgIds,
  userCanViewOrganizationInvoices,
} from "@/lib/organization-invoice-access";

const invoiceInclude = { payments: true } as const;

export type InvoiceWithPaymentsRow = Awaited<
  ReturnType<typeof fetchInvoicesForViewer>
>[number];

/**
 * - Patient: invoices linked to their chart appointments (not `user_id` on invoice row).
 * - Admin: all invoices (CP billing tab).
 * - Doctor/staff: invoices they bill (`user_id`) or tied to visits they own/treat.
 */
export async function fetchInvoicesForViewer(opts: {
  userId: string;
  role: string | null;
  email?: string | null;
  /** CP organization tab — limit list to one clinic org. */
  organizationId?: string | null;
}) {
  const orgFilterId =
    opts.organizationId != null && opts.organizationId !== ""
      ? opts.organizationId
      : null;

  if (orgFilterId) {
    const allowed =
      isAdminRole(opts.role) ||
      (await userCanViewOrganizationInvoices(opts.userId, orgFilterId));
    if (!allowed) return [];
  }

  const orgWhere = orgFilterId ? { organization_id: orgFilterId } : {};

  if (isAdminRole(opts.role)) {
    return prisma.invoice.findMany({
      where: orgWhere,
      include: invoiceInclude,
      orderBy: { created_at: "desc" },
    });
  }

  if (isPatientRole(opts.role) && opts.email) {
    const patient = await prisma.patient.findFirst({
      where: { email: opts.email },
      select: { id: true },
    });
    if (!patient) return [];

    const appts = await prisma.appointment.findMany({
      where: { patient_id: patient.id },
      select: { id: true },
    });
    const appointmentIds = appts.map((a) => a.id);
    if (appointmentIds.length === 0) return [];

    return prisma.invoice.findMany({
      where: { appointment_id: { in: appointmentIds }, ...orgWhere },
      include: invoiceInclude,
      orderBy: { created_at: "desc" },
    });
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

  return prisma.invoice.findMany({
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
    include: invoiceInclude,
    orderBy: { created_at: "desc" },
  });
}

/** Org billing KPIs for Organization Management panel. */
export async function fetchInvoiceTotalsForOrganization(organizationId: string) {
  const [paid, outstanding] = await Promise.all([
    prisma.invoice.aggregate({
      where: { organization_id: organizationId, status: "paid" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.invoice.aggregate({
      where: {
        organization_id: organizationId,
        status: { in: ["draft", "sent", "overdue"] },
      },
      _sum: { amount: true },
      _count: true,
    }),
  ]);
  return {
    paidCents: paid._sum.amount ?? 0,
    paidCount: paid._count,
    outstandingCents: outstanding._sum.amount ?? 0,
    outstandingCount: outstanding._count,
  };
}
