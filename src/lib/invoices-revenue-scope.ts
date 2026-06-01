/**
 * Role-aware invoice revenue aggregates — aligned with fetchInvoicesForViewer list scope.
 * Admin CP dashboard uses global totals; doctors use visit-linked OR (not user_id alone).
 */

import { prisma } from "@/lib/prisma";
import { isAdminRole, isDoctorRole } from "@/lib/rbac";
import { getOrganizationMemberOrgIds } from "@/lib/organization-invoice-access";
import type { Prisma } from "@prisma/client";
import { INVOICE_OUTSTANDING_STATUSES } from "@/lib/invoice-billing-totals";

export type RevenueOverviewSnapshot = {
  paidCents: number;
  outstandingCents: number;
  totalInvoices: number;
  paidInvoices: number;
};

/** Prisma where for invoices visible to a doctor (matches invoices-scope OR). */
export async function buildDoctorScopedInvoiceWhere(
  userId: string
): Promise<Prisma.InvoiceWhereInput> {
  const visitIds = await prisma.appointment.findMany({
    where: {
      OR: [{ owner_id: userId }, { treating_physician_id: userId }],
    },
    select: { id: true },
  });
  const appointmentIds = visitIds.map((a) => a.id);
  const memberOrgIds = await getOrganizationMemberOrgIds(userId);

  return {
    OR: [
      { user_id: userId },
      ...(appointmentIds.length > 0
        ? [{ appointment_id: { in: appointmentIds } }]
        : []),
      ...(memberOrgIds.length > 0
        ? [{ organization_id: { in: memberOrgIds } }]
        : []),
    ],
  };
}

/**
 * Dashboard / overview revenue strip — admin = all invoices (CP Invoice Management parity).
 */
export async function fetchRevenueOverviewForViewer(opts: {
  userId: string;
  role: string | null;
}): Promise<RevenueOverviewSnapshot> {
  const { userId, role } = opts;

  if (isAdminRole(role)) {
    const [totalInvoices, paidInvoices, paidRevenue, outstandingRevenue] =
      await Promise.all([
        prisma.invoice.count(),
        prisma.invoice.count({ where: { status: "paid" } }),
        prisma.invoice.aggregate({
          where: { status: "paid" },
          _sum: { amount: true },
        }),
        prisma.invoice.aggregate({
          where: { status: { in: [...INVOICE_OUTSTANDING_STATUSES] } },
          _sum: { amount: true },
        }),
      ]);
    return {
      paidCents: paidRevenue._sum.amount ?? 0,
      outstandingCents: outstandingRevenue._sum.amount ?? 0,
      totalInvoices,
      paidInvoices,
    };
  }

  if (isDoctorRole(role)) {
    const where = await buildDoctorScopedInvoiceWhere(userId);
    const [totalInvoices, paidInvoices, paidRevenue, outstandingRevenue] =
      await Promise.all([
        prisma.invoice.count({ where }),
        prisma.invoice.count({ where: { ...where, status: "paid" } }),
        prisma.invoice.aggregate({
          where: { ...where, status: "paid" },
          _sum: { amount: true },
        }),
        prisma.invoice.aggregate({
          where: {
            ...where,
            status: { in: [...INVOICE_OUTSTANDING_STATUSES] },
          },
          _sum: { amount: true },
        }),
      ]);
    return {
      paidCents: paidRevenue._sum.amount ?? 0,
      outstandingCents: outstandingRevenue._sum.amount ?? 0,
      totalInvoices,
      paidInvoices,
    };
  }

  const [totalInvoices, paidInvoices, paidRevenue, outstandingRevenue] =
    await Promise.all([
      prisma.invoice.count({ where: { user_id: userId } }),
      prisma.invoice.count({
        where: { user_id: userId, status: "paid" },
      }),
      prisma.invoice.aggregate({
        where: { user_id: userId, status: "paid" },
        _sum: { amount: true },
      }),
      prisma.invoice.aggregate({
        where: {
          user_id: userId,
          status: { in: [...INVOICE_OUTSTANDING_STATUSES] },
        },
        _sum: { amount: true },
      }),
    ]);

  return {
    paidCents: paidRevenue._sum.amount ?? 0,
    outstandingCents: outstandingRevenue._sum.amount ?? 0,
    totalInvoices,
    paidInvoices,
  };
}
