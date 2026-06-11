/**
 * Inserts exactly 10 curated demo appointments after wipe.
 * Admin is created_by/updated_by on every row; one visit-cancelled with audit fields.
 */

import type { PrismaClient } from "@prisma/client";
import { clearAllAppointmentsAndBilling } from "./demo-appointment-clear";
import { ensureAppointmentStatusCheckIncludesCancelled } from "./ensure-appointment-status-check";
import {
  DEMO_CURATED_ADMIN_EMAIL,
  DEMO_CURATED_DOCTOR_EMAILS,
  DEMO_CURATED_ORG_SLUG,
  DEMO_CURATED_PATIENT_EMAILS,
  DEMO_CURATED_ROWS,
  DEMO_CURATED_SEED_MARKER,
  DEMO_CURATED_TYPE_IDS,
  resolveCuratedSlot,
  type DemoCuratedRow,
} from "./demo-appointment-curated-spec";

export type CuratedSeedResult = {
  created: number;
  total: number;
  curated: number;
};

async function resolveVisitFeeCents(
  typeId: string,
  treatingUserId: string,
  typeById: Map<string, { price_cents: number }>,
  doctorFeeById: Map<string, number>
): Promise<number> {
  const typePrice = typeById.get(typeId)?.price_cents ?? 0;
  if (typePrice > 0) return typePrice;
  return doctorFeeById.get(treatingUserId) ?? 8500;
}

async function ensureDemoOrganization(
  prisma: PrismaClient,
  adminId: string,
  doctorIds: string[],
  patientUserIds: string[] = []
): Promise<string> {
  const org = await prisma.organization.upsert({
    where: { slug: DEMO_CURATED_ORG_SLUG },
    create: {
      name: "HealthCal Demo Clinic",
      slug: DEMO_CURATED_ORG_SLUG,
      owner_user_id: adminId,
      description: "Portfolio demo organization for multi-entity QA.",
      timezone: "Europe/Berlin",
      org_type: "clinic",
    },
    update: {},
  });

  const memberSpecs: { user_id: string; role: string }[] = [
    { user_id: adminId, role: "admin" },
    ...doctorIds.map((id) => ({ user_id: id, role: "doctor" })),
    ...patientUserIds.map((id) => ({ user_id: id, role: "patient" })),
  ];

  for (const m of memberSpecs) {
    await prisma.organizationMember.upsert({
      where: { org_id_user_id: { org_id: org.id, user_id: m.user_id } },
      create: { org_id: org.id, user_id: m.user_id, role: m.role },
      update: { role: m.role },
    });
  }

  return org.id;
}

async function createCuratedRow(
  prisma: PrismaClient,
  ctx: {
    row: DemoCuratedRow;
    adminId: string;
    orgId: string;
    categoryLabel: string;
    categoryId: string;
    userByEmail: Map<string, string>;
    patientByEmail: Map<string, { id: string; firstname: string; lastname: string }>;
    typeById: Map<
      string,
      { name: string; is_telehealth: boolean; price_cents: number }
    >;
    doctorFeeById: Map<string, number>;
  }
): Promise<boolean> {
  const patient = ctx.patientByEmail.get(ctx.row.patientEmail);
  if (!patient) throw new Error(`Patient not found: ${ctx.row.patientEmail}`);

  const ownerId = ctx.userByEmail.get(ctx.row.ownerEmail);
  const treatingId = ctx.userByEmail.get(ctx.row.treatingEmail);
  if (!ownerId || !treatingId) {
    throw new Error(`User not found: ${ctx.row.ownerEmail} / ${ctx.row.treatingEmail}`);
  }

  const { start, end } = resolveCuratedSlot(
    ctx.row.daysFromNow,
    ctx.row.hourUtc,
    ctx.row.durationMin
  );
  const title = `Demo curated — ${ctx.row.titleSuffix} — ${patient.firstname} ${patient.lastname}`;

  const typeId = DEMO_CURATED_TYPE_IDS[ctx.row.typeKey];
  const apptType = ctx.typeById.get(typeId);
  if (!apptType) throw new Error(`Missing appointment type: ${ctx.row.typeKey}`);

  const cancelledByEmail = ctx.row.cancelledByEmail ?? DEMO_CURATED_ADMIN_EMAIL;
  const cancelledById =
    ctx.row.status === "cancelled"
      ? (ctx.userByEmail.get(cancelledByEmail) ?? ctx.adminId)
      : null;

  const appt = await prisma.appointment.create({
    data: {
      title,
      start,
      end,
      location: ctx.row.telehealth
        ? "Video Call"
        : `Demo Clinic — ${ctx.categoryLabel}`,
      patient_id: patient.id,
      category_id: ctx.categoryId,
      notes: `${DEMO_CURATED_SEED_MARKER}\nCurated QA row for billing + calendar scope.`,
      status: ctx.row.status,
      owner_id: ownerId,
      treating_physician_id: treatingId,
      appointment_type_id: typeId,
      is_telehealth: ctx.row.telehealth || apptType.is_telehealth,
      chief_complaint: `Curated demo visit (${ctx.row.status}) — ${apptType.name}.`,
      duration_minutes: ctx.row.durationMin,
      telehealth_link: ctx.row.telehealth
        ? "https://meet.healthcal.dev/room/demo-curated"
        : null,
      attachments: [],
      created_by_id: ctx.adminId,
      updated_by_id: ctx.adminId,
      ...(ctx.row.status === "cancelled"
        ? {
            cancelled_at: new Date(end.getTime() + 60 * 60 * 1000),
            cancelled_by_id: cancelledById,
          }
        : {}),
    },
  });

  if (ctx.row.invoice.kind !== "none") {
    const amount = await resolveVisitFeeCents(
      typeId,
      treatingId,
      ctx.typeById,
      ctx.doctorFeeById
    );
    const paidAt =
      ctx.row.invoice.kind === "paid" || ctx.row.invoice.kind === "refunded"
        ? new Date(end.getTime() + 2 * 24 * 60 * 60 * 1000)
        : null;

    const invoiceStatus =
      ctx.row.invoice.kind === "paid"
        ? "paid"
        : ctx.row.invoice.kind === "refunded"
          ? "refunded"
          : ctx.row.invoice.kind === "cancelled"
            ? "cancelled"
            : ctx.row.invoice.kind === "sent"
              ? "sent"
              : "draft";

    const invoice = await prisma.invoice.create({
      data: {
        appointment_id: appt.id,
        user_id: treatingId,
        organization_id: ctx.orgId,
        amount,
        currency: "eur",
        status: invoiceStatus,
        paid_at: paidAt,
        due_date: paidAt ?? new Date(end.getTime() + 14 * 24 * 60 * 60 * 1000),
        description: `Demo curated invoice — ${title}`,
      },
    });

    if (ctx.row.invoice.kind === "paid" || ctx.row.invoice.kind === "refunded") {
      await prisma.payment.create({
        data: {
          invoice_id: invoice.id,
          stripe_payment_id: ctx.row.invoice.stripeId,
          amount,
          status: ctx.row.invoice.kind === "paid" ? "succeeded" : "refunded",
        },
      });
    }
  }

  return true;
}

/** Wipe all appointments + billing, then insert DEMO_CURATED_ROWS (expects exactly 10). */
export async function seedCuratedDemoAppointments(
  prisma: PrismaClient,
  options?: { skipWipe?: boolean }
): Promise<CuratedSeedResult> {
  const [admin, doctors, patients, patientPortalUsers, category, apptTypes] = await Promise.all([
    prisma.user.findFirst({
      where: { email: DEMO_CURATED_ADMIN_EMAIL },
      select: { id: true },
    }),
    prisma.user.findMany({
      where: { email: { in: [...DEMO_CURATED_DOCTOR_EMAILS] } },
      select: { id: true, email: true, consultation_fee: true },
    }),
    prisma.patient.findMany({
      where: { email: { in: [...DEMO_CURATED_PATIENT_EMAILS] } },
      select: { id: true, email: true, firstname: true, lastname: true },
    }),
    prisma.user.findMany({
      where: { email: "test@patient.com", role: "patient" },
      select: { id: true },
    }),
    prisma.category.findFirst({
      where: { is_active: true },
      orderBy: { sort_order: "asc" },
      select: { id: true, label: true },
    }),
    prisma.appointmentType.findMany({
      where: { id: { in: Object.values(DEMO_CURATED_TYPE_IDS) } },
      select: {
        id: true,
        name: true,
        is_telehealth: true,
        duration_minutes: true,
        price_cents: true,
      },
    }),
  ]);

  if (!admin) throw new Error(`Missing ${DEMO_CURATED_ADMIN_EMAIL} — run db:prepare`);
  if (doctors.length < 8) throw new Error("Missing demo doctors — run db:prepare");
  if (patients.length < 5) throw new Error("Missing demo patients — run db:seed-extended");
  if (!category) throw new Error("Missing categories — run db:seed-extended");
  if (apptTypes.length < 4) {
    throw new Error("Missing global appointment types — run db:seed-test-user");
  }

  const typeById = new Map(apptTypes.map((t) => [t.id, t]));
  const doctorFeeById = new Map(doctors.map((d) => [d.id, d.consultation_fee ?? 0]));

  const userByEmail = new Map<string, string>([
    [DEMO_CURATED_ADMIN_EMAIL, admin.id],
    ...doctors.map((d) => [d.email, d.id] as const),
  ]);
  const patientByEmail = new Map(
    patients.map((p) => [p.email ?? "", p] as const)
  );

  const orgId = await ensureDemoOrganization(
    prisma,
    admin.id,
    doctors.map((d) => d.id),
    patientPortalUsers.map((u) => u.id)
  );

  await ensureAppointmentStatusCheckIncludesCancelled(prisma);

  if (!options?.skipWipe) {
    await clearAllAppointmentsAndBilling(prisma);
  }

  let created = 0;
  for (const row of DEMO_CURATED_ROWS) {
    const ok = await createCuratedRow(prisma, {
      row,
      adminId: admin.id,
      orgId,
      categoryLabel: category.label,
      categoryId: category.id,
      userByEmail,
      patientByEmail,
      typeById,
      doctorFeeById,
    });
    if (ok) created += 1;
  }

  const total = await prisma.appointment.count();
  const curated = await prisma.appointment.count({
    where: { notes: { contains: DEMO_CURATED_SEED_MARKER } },
  });

  if (total !== 10 || curated !== 10) {
    throw new Error(
      `Expected exactly 10 curated appointments; got total=${total} curated=${curated}`
    );
  }

  return { created, total, curated };
}
