/**
 * Role-aware invoice listing — aligns patient portal with patient snapshot invoices.
 * Staff/admin CP tabs use the same rules as GET /api/invoices and GET /api/payments.
 */

import { prisma } from "@/lib/prisma";
import { isAdminRole, isPatientRole } from "@/lib/rbac";

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
}) {
  if (isAdminRole(opts.role)) {
    return prisma.invoice.findMany({
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
      where: { appointment_id: { in: appointmentIds } },
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

  return prisma.invoice.findMany({
    where: {
      OR: [
        { user_id: opts.userId },
        ...(appointmentIds.length > 0
          ? [{ appointment_id: { in: appointmentIds } }]
          : []),
      ],
    },
    include: invoiceInclude,
    orderBy: { created_at: "desc" },
  });
}
