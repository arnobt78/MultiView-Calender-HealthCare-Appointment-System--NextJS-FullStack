/**
 * Deterministic demo schedule — exactly 10 appointments for QA (dashboard = insights parity).
 *
 * Prereq (full reset):
 *   CONFIRM_DB_CLEAR=YES npm run db:clear
 *   npm run db:prepare && npm run db:seed-extended
 *   npm run db:seed-demo-appointments
 *   npm run db:migrate
 *
 * Re-run safe: removes prior rows with marker `seed-demo-curated:v1` then upserts 10 visits.
 */

import { config } from "dotenv";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";

config({ path: resolve(process.cwd(), ".env.local") });

const SEED_MARKER = "seed-demo-curated:v1";
const ORG_SLUG = "healthcal-demo-clinic";

const GLOBAL_TYPE_ID = "22222222-2222-4222-8222-222222222202"; // Follow-up Visit

const DOCTOR_EMAILS = [
  "test@doctor.com",
  "demo.doctor2@healthcal.dev",
  "demo.doctor3@healthcal.dev",
  "demo.doctor4@healthcal.dev",
  "demo.doctor5@healthcal.dev",
  "demo.doctor6@healthcal.dev",
  "demo.doctor7@healthcal.dev",
  "demo.doctor8@healthcal.dev",
] as const;

const PATIENT_EMAILS = [
  "test@patient.com",
  "maria.schmidt@demo.healthcal",
  "jan.mueller@demo.healthcal",
  "anya.petrov@demo.healthcal",
  "thomas.weber@demo.healthcal",
] as const;

type InvoiceSpec =
  | { kind: "none" }
  | { kind: "paid"; stripeId: string }
  | { kind: "draft" }
  | { kind: "sent" }
  | { kind: "cancelled" }
  | { kind: "refunded"; stripeId: string };

type CuratedRow = {
  titleSuffix: string;
  patientEmail: (typeof PATIENT_EMAILS)[number];
  ownerEmail: string;
  treatingEmail: string;
  status: "done" | "pending" | "alert";
  startIso: string;
  durationMin: number;
  telehealth: boolean;
  invoice: InvoiceSpec;
};

/** Anchor "today" for local QA — matches demo UI screenshots (Jun 2026). */
const CURATED: CuratedRow[] = [
  {
    titleSuffix: "01-admin-treating-demo-paid",
    patientEmail: "test@patient.com",
    ownerEmail: "test@admin.com",
    treatingEmail: "test@doctor.com",
    status: "done",
    startIso: "2026-05-28T09:00:00.000Z",
    durationMin: 30,
    telehealth: false,
    invoice: { kind: "paid", stripeId: "pi_demo_curated_paid_01" },
  },
  {
    titleSuffix: "02-demo-owner-today-pending",
    patientEmail: "test@patient.com",
    ownerEmail: "test@doctor.com",
    treatingEmail: "test@doctor.com",
    status: "pending",
    startIso: "2026-06-01T10:00:00.000Z",
    durationMin: 30,
    telehealth: false,
    invoice: { kind: "none" },
  },
  {
    titleSuffix: "03-doc4-owner-demo-treating-paid",
    patientEmail: "thomas.weber@demo.healthcal",
    ownerEmail: "demo.doctor4@healthcal.dev",
    treatingEmail: "test@doctor.com",
    status: "done",
    startIso: "2026-05-10T11:00:00.000Z",
    durationMin: 45,
    telehealth: false,
    invoice: { kind: "paid", stripeId: "pi_demo_curated_paid_03" },
  },
  {
    titleSuffix: "04-demo-owner-alert-draft",
    patientEmail: "maria.schmidt@demo.healthcal",
    ownerEmail: "test@doctor.com",
    treatingEmail: "demo.doctor2@healthcal.dev",
    status: "alert",
    startIso: "2026-05-15T14:00:00.000Z",
    durationMin: 30,
    telehealth: true,
    invoice: { kind: "draft" },
  },
  {
    titleSuffix: "05-doc2-owner-sent",
    patientEmail: "jan.mueller@demo.healthcal",
    ownerEmail: "demo.doctor2@healthcal.dev",
    treatingEmail: "demo.doctor3@healthcal.dev",
    status: "done",
    startIso: "2026-07-15T08:30:00.000Z",
    durationMin: 30,
    telehealth: false,
    invoice: { kind: "sent" },
  },
  {
    titleSuffix: "06-doc5-owner-demo-cancelled",
    patientEmail: "anya.petrov@demo.healthcal",
    ownerEmail: "demo.doctor5@healthcal.dev",
    treatingEmail: "test@doctor.com",
    status: "done",
    startIso: "2026-04-08T13:00:00.000Z",
    durationMin: 30,
    telehealth: false,
    invoice: { kind: "cancelled" },
  },
  {
    titleSuffix: "07-doc6-owner-demo-refunded",
    patientEmail: "thomas.weber@demo.healthcal",
    ownerEmail: "demo.doctor6@healthcal.dev",
    treatingEmail: "test@doctor.com",
    status: "done",
    startIso: "2026-03-25T15:30:00.000Z",
    durationMin: 45,
    telehealth: false,
    invoice: { kind: "refunded", stripeId: "pi_demo_curated_ref_07" },
  },
  {
    titleSuffix: "08-doc7-owner-pending",
    patientEmail: "maria.schmidt@demo.healthcal",
    ownerEmail: "demo.doctor7@healthcal.dev",
    treatingEmail: "demo.doctor8@healthcal.dev",
    status: "pending",
    startIso: "2026-06-15T09:00:00.000Z",
    durationMin: 30,
    telehealth: false,
    invoice: { kind: "none" },
  },
  {
    titleSuffix: "09-doc8-owner-done-no-invoice",
    patientEmail: "anya.petrov@demo.healthcal",
    ownerEmail: "demo.doctor8@healthcal.dev",
    treatingEmail: "demo.doctor7@healthcal.dev",
    status: "done",
    startIso: "2026-08-01T10:00:00.000Z",
    durationMin: 30,
    telehealth: true,
    invoice: { kind: "none" },
  },
  {
    titleSuffix: "10-demo-owner-today-afternoon",
    patientEmail: "jan.mueller@demo.healthcal",
    ownerEmail: "test@doctor.com",
    treatingEmail: "demo.doctor4@healthcal.dev",
    status: "pending",
    startIso: "2026-06-01T14:00:00.000Z",
    durationMin: 30,
    telehealth: false,
    invoice: { kind: "none" },
  },
];

const prisma = new PrismaClient();

async function ensureDemoOrganization(adminId: string, doctorIds: string[]) {
  const org = await prisma.organization.upsert({
    where: { slug: ORG_SLUG },
    create: {
      name: "HealthCal Demo Clinic",
      slug: ORG_SLUG,
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

/** Wipe visits from db:seed-extended so the DB holds exactly 10 curated rows. */
async function clearAllAppointments() {
  await prisma.payment.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.appointmentAssignee.deleteMany({});
  await prisma.appointment.deleteMany({});
}

async function clearPriorCurated() {
  await clearAllAppointments();
}

async function seedCurated() {
  const [admin, doctors, patients, category, apptType] = await Promise.all([
    prisma.user.findFirst({ where: { email: "test@admin.com" }, select: { id: true } }),
    prisma.user.findMany({
      where: { email: { in: [...DOCTOR_EMAILS] } },
      select: { id: true, email: true },
    }),
    prisma.patient.findMany({
      where: { email: { in: [...PATIENT_EMAILS] } },
      select: { id: true, email: true, firstname: true, lastname: true },
    }),
    prisma.category.findFirst({
      where: { is_active: true },
      orderBy: { sort_order: "asc" },
      select: { id: true, label: true },
    }),
    prisma.appointmentType.findUnique({
      where: { id: GLOBAL_TYPE_ID },
      select: { id: true, name: true, is_telehealth: true, duration_minutes: true },
    }),
  ]);

  if (!admin) throw new Error("Missing test@admin.com — run db:prepare");
  if (doctors.length < 8) throw new Error("Missing demo doctors — run db:prepare");
  if (patients.length < 5) throw new Error("Missing demo patients — run db:seed-extended");
  if (!category) throw new Error("Missing categories — run db:seed-extended");
  if (!apptType) throw new Error("Missing global Follow-up type — run db:seed-test-user");

  const userByEmail = new Map<string, string>([
    ["test@admin.com", admin.id],
    ...doctors.map((d) => [d.email, d.id] as const),
  ]);
  const patientByEmail = new Map(
    patients.map((p) => [p.email ?? "", p] as const)
  );

  const orgId = await ensureDemoOrganization(
    admin.id,
    doctors.map((d) => d.id)
  );

  await clearPriorCurated();

  let created = 0;

  for (const row of CURATED) {
    const patient = patientByEmail.get(row.patientEmail);
    if (!patient) throw new Error(`Patient not found: ${row.patientEmail}`);

    const ownerId = userByEmail.get(row.ownerEmail);
    const treatingId = userByEmail.get(row.treatingEmail);
    if (!ownerId || !treatingId) {
      throw new Error(`User not found: ${row.ownerEmail} / ${row.treatingEmail}`);
    }

    const start = new Date(row.startIso);
    const end = new Date(start.getTime() + row.durationMin * 60 * 1000);
    const title = `Demo curated — ${row.titleSuffix} — ${patient.firstname} ${patient.lastname}`;

    const existing = await prisma.appointment.findFirst({ where: { title } });
    if (existing) continue;

    const appt = await prisma.appointment.create({
      data: {
        title,
        start,
        end,
        location: row.telehealth ? "Video Call" : `Demo Clinic — ${category.label}`,
        patient_id: patient.id,
        category_id: category.id,
        notes: `${SEED_MARKER}\nCurated QA row for billing + calendar scope.`,
        status: row.status,
        owner_id: ownerId,
        treating_physician_id: treatingId,
        appointment_type_id: apptType.id,
        is_telehealth: row.telehealth || apptType.is_telehealth,
        chief_complaint: `Curated demo visit (${row.status}).`,
        duration_minutes: row.durationMin,
        telehealth_link: row.telehealth ? "https://meet.healthcal.dev/room/demo-curated" : null,
        attachments: [],
      },
    });

    const billingUserId = treatingId;
    const desc = `Demo curated invoice — ${title}`;

    if (row.invoice.kind !== "none") {
      const amount = 8_500 + created * 250;
      const paidAt =
        row.invoice.kind === "paid" || row.invoice.kind === "refunded"
          ? new Date(end.getTime() + 2 * 24 * 60 * 60 * 1000)
          : null;

      const status =
        row.invoice.kind === "paid"
          ? "paid"
          : row.invoice.kind === "refunded"
            ? "refunded"
            : row.invoice.kind === "cancelled"
              ? "cancelled"
              : row.invoice.kind === "sent"
                ? "sent"
                : "draft";

      const invoice = await prisma.invoice.create({
        data: {
          appointment_id: appt.id,
          user_id: billingUserId,
          organization_id: orgId,
          amount,
          currency: "eur",
          status,
          paid_at: paidAt,
          due_date: paidAt ?? new Date(end.getTime() + 14 * 24 * 60 * 60 * 1000),
          description: desc,
        },
      });

      if (row.invoice.kind === "paid" || row.invoice.kind === "refunded") {
        await prisma.payment.create({
          data: {
            invoice_id: invoice.id,
            stripe_payment_id: row.invoice.stripeId,
            amount,
            status: row.invoice.kind === "paid" ? "succeeded" : "refunded",
          },
        });
      }
    }

    created += 1;
  }

  const total = await prisma.appointment.count();
  const curated = await prisma.appointment.count({
    where: { notes: { contains: SEED_MARKER } },
  });

  console.log(`\n✅ Demo curated seed complete.`);
  console.log(`   Created: ${created} | Curated in DB: ${curated} | Appointments total: ${total}`);
}

seedCurated()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ seed-demo-appointments-curated failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
