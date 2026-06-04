/**
 * Idempotent demo users (test@admin.com / test@doctor.com / test@patient.com).
 * Same password for all — see src/lib/demo-credentials.ts.
 *
 * Also seeds:
 *  - 7 additional demo doctor accounts (Demo Doctor 2–8) with specialties, bios, and stock photos
 *  - 4 global AppointmentType rows shared across all doctors
 *  - specialty / bio on the primary Demo Doctor account
 *  - Up to two idempotent `appointments` rows (B2 `treating_physician_id` + B3 `owner_id`) for calendar / portal QA when category + demo patient exist
 *
 * Usage: npm run db:seed-test-user
 * Full demo environment (users, doctors, categories, patients, appointments):
 *   npm run prisma:push && npm run db:seed-demo-full
 * Doctor profiles only: npm run db:seed-doctor-profiles
 */

import { config } from "dotenv";
import { getDoctorProfileSeed } from "./lib/doctor-profile-seed-data";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

// ---------------------------------------------------------------------------
// Extra demo doctors seeded with public/doctors/ stock images
// ---------------------------------------------------------------------------
const EXTRA_DOCTORS = [
  {
    email: "demo.doctor2@healthcal.dev",
    displayName: "Demo Doctor 2",
    image: "/doctors/img-2.jpg",
    specialty: "Cardiology",
    bio: "Specialist in heart disease prevention, cardiac imaging, and interventional procedures.",
  },
  {
    email: "demo.doctor3@healthcal.dev",
    displayName: "Demo Doctor 3",
    image: "/doctors/img-3.jpg",
    specialty: "Dermatology",
    bio: "Expert in skin conditions, cosmetic dermatology, and advanced laser treatments.",
  },
  {
    email: "demo.doctor4@healthcal.dev",
    displayName: "Demo Doctor 4",
    image: "/doctors/img-4.jpg",
    specialty: "Neurology",
    bio: "Focused on diagnosing and treating disorders of the nervous system and brain.",
  },
  {
    email: "demo.doctor5@healthcal.dev",
    displayName: "Demo Doctor 5",
    image: "/doctors/img-5.jpg",
    specialty: "Pediatrics",
    bio: "Dedicated to the health and well-being of infants, children, and adolescents.",
  },
  {
    email: "demo.doctor6@healthcal.dev",
    displayName: "Demo Doctor 6",
    image: "/doctors/img-6.jpg",
    specialty: "Oncology",
    bio: "Providing comprehensive cancer care including chemotherapy and targeted therapy.",
  },
  {
    email: "demo.doctor7@healthcal.dev",
    displayName: "Demo Doctor 7",
    image: "/doctors/img-8.jpg",
    specialty: "Orthopedics",
    bio: "Specializing in musculoskeletal injuries, joint replacement, and sports medicine.",
  },
  {
    email: "demo.doctor8@healthcal.dev",
    displayName: "Demo Doctor 8",
    image: "/doctors/img-7.jpg",
    specialty: "Psychiatry",
    bio: "Compassionate mental health care including therapy, medication management, and crisis support.",
  },
] as const;

// Global appointment types — user_id = null means available to all doctors
const GLOBAL_APPOINTMENT_TYPES = [
  {
    id: "22222222-2222-4222-8222-222222222201",
    name: "Initial Consultation",
    description: "First visit to discuss medical history, symptoms, and treatment goals.",
    price_cents: 15000,
    duration_minutes: 60,
    buffer_before_minutes: 10,
    buffer_after_minutes: 10,
    slot_interval_minutes: 60,
    minimum_notice_minutes: 120,
  },
  {
    id: "22222222-2222-4222-8222-222222222202",
    name: "Follow-up Visit",
    description: "Review of treatment progress and adjustment of care plan.",
    price_cents: 9250,
    duration_minutes: 30,
    buffer_before_minutes: 5,
    buffer_after_minutes: 5,
    slot_interval_minutes: 30,
    minimum_notice_minutes: 60,
  },
  {
    id: "22222222-2222-4222-8222-222222222203",
    name: "Telehealth Session",
    description: "Remote consultation via secure video call — no travel required.",
    price_cents: 8500,
    duration_minutes: 20,
    buffer_before_minutes: 5,
    buffer_after_minutes: 5,
    slot_interval_minutes: 30,
    minimum_notice_minutes: 30,
  },
  {
    id: "22222222-2222-4222-8222-222222222204",
    name: "Annual Check-up",
    description: "Comprehensive yearly health assessment including lab work review.",
    price_cents: 12000,
    duration_minutes: 45,
    buffer_before_minutes: 10,
    buffer_after_minutes: 10,
    slot_interval_minutes: 45,
    minimum_notice_minutes: 1440,
  },
] as const;

async function seedDemoUsers() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL not found in .env.local");
    process.exit(1);
  }

  const { prisma } = await import("../src/lib/prisma");
  const { hashPassword, getUserByEmail } = await import("../src/lib/auth");
  const {
    DEMO_ACCOUNTS,
    DEMO_PASSWORD,
    DEMO_DOCTOR_APPOINTMENT_TYPE_ID,
    DEMO_PATIENT_EMAIL,
  } = await import("../src/lib/demo-credentials");

  const passwordHash = await hashPassword(DEMO_PASSWORD);
  const adminForUserAudit = await prisma.user.findFirst({ where: { email: "test@admin.com" } });
  const userAuditStamp = adminForUserAudit
    ? {
        created_by_id: adminForUserAudit.id,
        updated_by_id: adminForUserAudit.id,
        updated_at: new Date(),
      }
    : {};

  for (const acc of DEMO_ACCOUNTS) {
    const existing = await getUserByEmail(acc.email);
    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          display_name: acc.displayName,
          image: acc.avatarUrl,
          password_hash: passwordHash,
          email_verified: true,
          role: acc.role,
          ...userAuditStamp,
        },
      });
    } else {
      const { randomUUID } = await import("crypto");
      await prisma.user.create({
        data: {
          id: randomUUID(),
          email: acc.email,
          display_name: acc.displayName,
          image: acc.avatarUrl,
          password_hash: passwordHash,
          email_verified: true,
          role: acc.role,
          ...userAuditStamp,
        },
      });
    }
  }

  const doctor = await prisma.user.findFirst({ where: { email: "test@doctor.com" } });
  if (doctor) {
    const availCount = await prisma.doctorAvailability.count({
      where: { user_id: doctor.id },
    });
    if (availCount === 0) {
      const tz = "Europe/Berlin";
      await prisma.doctorAvailability.createMany({
        data: [1, 2, 3, 4, 5].map((weekday) => ({
          user_id: doctor.id,
          weekday,
          start_min: 9 * 60,
          end_min: 17 * 60,
          timezone: tz,
        })),
      });
    }
    await prisma.appointmentType.upsert({
      where: { id: DEMO_DOCTOR_APPOINTMENT_TYPE_ID },
      create: {
        id: DEMO_DOCTOR_APPOINTMENT_TYPE_ID,
        user_id: doctor.id,
        name: "Consultation",
        price_cents: 12500,
        duration_minutes: 30,
        buffer_before_minutes: 5,
        buffer_after_minutes: 5,
        slot_interval_minutes: 30,
        minimum_notice_minutes: 60,
      },
      update: {
        user_id: doctor.id,
        name: "Consultation",
        price_cents: 12500,
        duration_minutes: 30,
        buffer_before_minutes: 5,
        buffer_after_minutes: 5,
        slot_interval_minutes: 30,
        minimum_notice_minutes: 60,
      },
    });
  }

  // Demo Doctor 1 — full professional profile (matches Add Doctor dialog fields)
  const primaryProfile = getDoctorProfileSeed("test@doctor.com");
  if (doctor && primaryProfile) {
    await prisma.user.update({
      where: { id: doctor.id },
      data: primaryProfile,
    });
  }

  // Seed 7 additional demo doctors (Demo Doctor 2–8) — idempotent upsert by email
  const { randomUUID } = await import("crypto");
  for (const d of EXTRA_DOCTORS) {
    const existing = await prisma.user.findFirst({ where: { email: d.email } });
    const profile = getDoctorProfileSeed(d.email)!;
    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          display_name: d.displayName,
          image: d.image,
          role: "doctor",
          email_verified: true,
          ...profile,
          ...userAuditStamp,
        },
      });
    } else {
      const newId = randomUUID();
      const demoHash = await hashPassword(DEMO_PASSWORD);
      await prisma.user.create({
        data: {
          id: newId,
          email: d.email,
          display_name: d.displayName,
          image: d.image,
          role: "doctor",
          email_verified: true,
          password_hash: demoHash,
          ...profile,
          ...userAuditStamp,
        },
      });
      // Seed Mon–Fri 9–17 availability for each new doctor
      const tz = "Europe/Berlin";
      await prisma.doctorAvailability.createMany({
        data: [1, 2, 3, 4, 5].map((weekday) => ({
          user_id: newId,
          weekday,
          start_min: 9 * 60,
          end_min: 17 * 60,
          timezone: tz,
        })),
      });
    }
  }

  if (adminForUserAudit) {
    const backfill = await prisma.user.updateMany({
      where: { created_by_id: null },
      data: {
        created_by_id: adminForUserAudit.id,
        updated_by_id: adminForUserAudit.id,
        updated_at: new Date(),
      },
    });
    if (backfill.count > 0) {
      console.log(`  ✔ backfilled audit FKs on ${backfill.count} user(s)`);
    }
  }

  // Seed global appointment types (user_id = null) — shared across all doctors
  for (const t of GLOBAL_APPOINTMENT_TYPES) {
    await prisma.appointmentType.upsert({
      where: { id: t.id },
      create: { ...t, user_id: null },
      update: {
        name: t.name,
        description: t.description,
        duration_minutes: t.duration_minutes,
        price_cents: t.price_cents,
      },
    });
  }

  // Patient Management reads `patients` table; portal login stays on `users`. Keep one demo row in sync.
  const demoPatientAcc = DEMO_ACCOUNTS.find((a) => a.role === "patient");
  if (demoPatientAcc) {
    // Matches main seed `enrichDemoPatientAuditAndClinical`: audit "Created · by …" needs `created_by_id` (API loads `created_by`).
    const auditUser = await prisma.user.findFirst({
      where: { role: "admin" },
      orderBy: { created_at: "asc" },
      select: { id: true },
    });
    const parts = demoPatientAcc.displayName.trim().split(/\s+/);
    const firstname = parts[0] ?? "User";
    const lastname = parts.slice(1).join(" ") || "Patient";
    const existingRow = await prisma.patient.findFirst({
      where: { email: demoPatientAcc.email },
    });
    const { mergeClinicalProfileJson, DEMO_PATIENT_PORTRAIT_BY_EMAIL } = await import(
      "../src/lib/seed-clinical-profile"
    );
    const demoPortrait = DEMO_PATIENT_PORTRAIT_BY_EMAIL[demoPatientAcc.email];
    const clinical_profile = mergeClinicalProfileJson(existingRow?.clinical_profile ?? null, {
      allergies: ["penicillin (demo)"],
      notes: "Seeded clinical profile for Patient Management / snapshot demos.",
      ...(demoPortrait ? { image_url: demoPortrait } : {}),
    });
    if (!existingRow) {
      await prisma.patient.create({
        data: {
          firstname,
          lastname,
          email: demoPatientAcc.email,
          active: true,
          clinical_profile,
          ...(doctor ? { primary_doctor_id: doctor.id } : {}),
          ...(auditUser
            ? { created_by_id: auditUser.id, updated_by_id: auditUser.id }
            : {}),
        },
      });
    } else {
      await prisma.patient.update({
        where: { id: existingRow.id },
        data: {
          firstname,
          lastname,
          email: demoPatientAcc.email,
          clinical_profile,
          // Link primary care doctor for Patient Management / portal parity when unset (FK → users.id).
          ...(doctor && !existingRow.primary_doctor_id ? { primary_doctor_id: doctor.id } : {}),
          // Backfill only when missing so we do not overwrite real editors on `updated_by`.
          ...(auditUser && !existingRow.created_by_id ? { created_by_id: auditUser.id } : {}),
          ...(auditUser && !existingRow.updated_by_id ? { updated_by_id: auditUser.id } : {}),
        },
      });
    }
  }

  /**
   * Demo `appointments` for manual QA: Prisma uses `owner_id` (DB `user_id`) and B2 `treating_physician_id`.
   * Skips silently if category or patient row is missing — keeps script safe on empty DBs.
   */
  if (doctor) {
    const cat = await prisma.category.findFirst({
      where: { is_active: true },
      orderBy: { sort_order: "asc" },
    });
    const patientRow = await prisma.patient.findFirst({
      where: { email: DEMO_PATIENT_EMAIL },
    });
    const colleague = await prisma.user.findFirst({
      where: { email: "demo.doctor2@healthcal.dev" },
    });
    if (cat && patientRow) {
      const seedSpecs: { title: string; treatingId: string; notes: string }[] = [
        {
          title: "Demo seed — owner equals treating (baseline B2)",
          treatingId: doctor.id,
          notes:
            "Seeded: calendar owner and treating physician are the same user (default B2 backfill behavior).",
        },
        {
          title: "Demo seed — treating physician delegated to colleague",
          treatingId: colleague?.id ?? doctor.id,
          notes: colleague
            ? "Seeded: calendar owner remains Demo Doctor; treating physician is Demo Doctor 2 for UI drift demos."
            : "Seeded: no colleague doctor yet — treating matches owner until demo.doctor2@healthcal.dev exists.",
        },
      ];
      for (let i = 0; i < seedSpecs.length; i += 1) {
        const spec = seedSpecs[i];
        const existingAppt = await prisma.appointment.findFirst({
          where: { owner_id: doctor.id, title: spec.title },
        });
        if (existingAppt) continue;
        const start = new Date(Date.now() + (2 + i) * 24 * 60 * 60 * 1000);
        const end = new Date(start.getTime() + 45 * 60 * 1000);
        await prisma.appointment.create({
          data: {
            title: spec.title,
            start,
            end,
            location: "Demo Clinic — Room 1",
            patient_id: patientRow.id,
            category_id: cat.id,
            notes: spec.notes,
            status: "pending",
            owner_id: doctor.id,
            treating_physician_id: spec.treatingId,
            attachments: [],
          },
        });
      }
    }
  }
}

seedDemoUsers()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
