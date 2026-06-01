/**
 * Idempotent demo appointment timeline — past 3 months, current month, next 2 months.
 * Uses existing users (doctors/admin), patients, categories, appointment types.
 * Optional invoices on completed past visits for revenue/insights QA.
 *
 * Run: npm run db:seed-demo-appointments-timeline  (bulk timeline — prefer db:seed-demo-appointments curated)
 * Prereq: npm run db:prepare && npm run db:seed-extended (recommended)
 */

import { config } from "dotenv";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";

config({ path: resolve(process.cwd(), ".env.local") });

const SEED_MARKER = "seed-demo-timeline:v1";
const ORG_SLUG = "healthcal-demo-clinic";

/** Target spread — script skips slots that already exist (same title). */
const SLOTS_PER_MONTH = 6;

const prisma = new PrismaClient();

type Refs = {
  doctors: { id: string; email: string; display_name: string | null }[];
  patients: { id: string; firstname: string; lastname: string; primary_doctor_id: string | null }[];
  categories: { id: string; label: string }[];
  types: {
    id: string;
    name: string;
    duration_minutes: number;
    is_telehealth: boolean;
    user_id: string | null;
  }[];
  adminId: string;
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function monthStarts(center: Date, offset: number): Date {
  const d = new Date(Date.UTC(center.getUTCFullYear(), center.getUTCMonth() + offset, 1, 12, 0, 0, 0));
  return d;
}

function randomDayInMonth(monthStart: Date): Date {
  const y = monthStart.getUTCFullYear();
  const m = monthStart.getUTCMonth();
  const daysInMonth = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const day = 1 + Math.floor(Math.random() * daysInMonth);
  const hour = 8 + Math.floor(Math.random() * 9);
  const minute = [0, 15, 30, 45][Math.floor(Math.random() * 4)]!;
  return new Date(Date.UTC(y, m, day, hour, minute, 0, 0));
}

function statusForStart(start: Date, now: Date): string {
  const end = start.getTime();
  const t = now.getTime();
  if (end > t + 24 * 60 * 60 * 1000) return "pending";
  if (end < t - 7 * 24 * 60 * 60 * 1000) {
    return Math.random() < 0.75 ? "done" : Math.random() < 0.5 ? "alert" : "pending";
  }
  if (end < t) return Math.random() < 0.6 ? "done" : "pending";
  return "pending";
}

async function loadRefs(): Promise<Refs> {
  const [doctors, patients, categories, types, admin] = await Promise.all([
    prisma.user.findMany({
      where: { role: "doctor", is_active: true },
      select: { id: true, email: true, display_name: true },
    }),
    prisma.patient.findMany({
      where: { active: true },
      select: { id: true, firstname: true, lastname: true, primary_doctor_id: true },
    }),
    prisma.category.findMany({
      where: { is_active: true },
      select: { id: true, label: true },
      orderBy: { sort_order: "asc" },
    }),
    prisma.appointmentType.findMany({
      where: { is_active: true },
      select: {
        id: true,
        name: true,
        duration_minutes: true,
        is_telehealth: true,
        user_id: true,
      },
    }),
    prisma.user.findFirst({ where: { role: "admin" }, select: { id: true } }),
  ]);

  if (!doctors.length) throw new Error("No active doctors — run db:seed-test-user first.");
  if (!patients.length) throw new Error("No patients — run db:seed-extended first.");
  if (!categories.length) throw new Error("No categories — run db:seed-extended first.");
  if (!types.length) throw new Error("No appointment types — run db:seed-test-user first.");
  if (!admin) throw new Error("No admin user — run db:seed-test-user first.");

  return { doctors, patients, categories, types, adminId: admin.id };
}

/** Demo org for CP organization-management (appointments link via staff users, not FK). */
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

function typesForDoctor(
  types: Refs["types"],
  doctorId: string
): Refs["types"] {
  const global = types.filter((t) => !t.user_id);
  const owned = types.filter((t) => t.user_id === doctorId);
  return [...global, ...owned].length ? [...global, ...owned] : types;
}

async function seedTimeline() {
  const refs = await loadRefs();
  const now = new Date();
  const monthOffsets = [-3, -2, -1, 0, 1, 2];

  await ensureDemoOrganization(
    refs.adminId,
    refs.doctors.map((d) => d.id)
  );

  let created = 0;
  let skipped = 0;

  for (const mo of monthOffsets) {
    const monthStart = monthStarts(now, mo);
    for (let i = 0; i < SLOTS_PER_MONTH; i += 1) {
      const doctor = pick(refs.doctors);
      const patient = pick(refs.patients);
      const category = pick(refs.categories);
      const type = pick(typesForDoctor(refs.types, doctor.id));
      const start = randomDayInMonth(monthStart);
      const duration = type.duration_minutes > 0 ? type.duration_minutes : 30;
      const end = new Date(start.getTime() + duration * 60 * 1000);
      const dateStr = start.toISOString().slice(0, 10);
      const title = `Demo timeline — ${dateStr} — ${patient.firstname} ${patient.lastname} — ${type.name}`;

      const existing = await prisma.appointment.findFirst({ where: { title } });
      if (existing) {
        skipped += 1;
        continue;
      }

      const status = statusForStart(start, now);
      const isTelehealth = type.is_telehealth;
      const treatingId =
        patient.primary_doctor_id && refs.doctors.some((d) => d.id === patient.primary_doctor_id)
          ? patient.primary_doctor_id
          : doctor.id;

      const appt = await prisma.appointment.create({
        data: {
          title,
          start,
          end,
          location: isTelehealth ? "Video Call" : `Demo Clinic — ${category.label}`,
          patient_id: patient.id,
          category_id: category.id,
          notes: `Auto-seeded for dashboard/insights QA.\n${SEED_MARKER}`,
          status,
          owner_id: doctor.id,
          treating_physician_id: treatingId,
          appointment_type_id: type.id,
          is_telehealth: isTelehealth,
          chief_complaint: `Demo chief complaint — ${type.name} on ${dateStr}.`,
          duration_minutes: duration,
          telehealth_link: isTelehealth
            ? `https://meet.healthcal.dev/room/demo-${dateStr.replace(/-/g, "")}-${i}`
            : null,
          attachments: [],
        },
      });

      // Invoices: create via billing UI / auto-draft on done — avoids random paid rows skewing insights.

      if (Math.random() < 0.12) {
        const other = pick(refs.doctors.filter((d) => d.id !== doctor.id));
        if (other) {
          await prisma.appointmentAssignee.create({
            data: {
              appointment_id: appt.id,
              user_id: other.id,
              status: "accepted",
              permission: "read",
              invited_by_id: doctor.id,
            },
          });
        }
      }

      created += 1;
    }
  }

  const total = await prisma.appointment.count();
  const seeded = await prisma.appointment.count({
    where: { notes: { contains: SEED_MARKER } },
  });

  console.log(`\n✅ Demo timeline seed complete.`);
  console.log(`   Created: ${created} | Skipped (exists): ${skipped}`);
  console.log(`   Appointments total: ${total} | With ${SEED_MARKER}: ${seeded}`);
}

seedTimeline()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ seed-demo-appointments-timeline failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
