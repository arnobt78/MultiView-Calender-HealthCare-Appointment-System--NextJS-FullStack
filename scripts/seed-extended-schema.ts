/**
 * seed-extended-schema.ts
 *
 * Idempotent seed for all fields added in the v006 schema extension:
 *   - Doctor profile fields (phone, license_number, department, consultation_fee,
 *     office_location, languages_spoken, years_of_experience)
 *   - Global AppointmentType metadata (is_telehealth, color, icon)
 *   - Patient clinical fields (blood_type, height_cm, weight_kg, insurance_*, etc.)
 *   - Extra demo patients (4 additional) with full new fields
 *   - DoctorAppointmentTypeConfig rows (per-doctor type enable/disable)
 *   - Appointments with appointment_type_id, chief_complaint, is_telehealth
 *
 * Run: npm run db:seed-extended
 *
 * Idempotency: all inserts use upsert / findFirst guard — safe to run multiple times.
 */

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

// ─── Constants ──────────────────────────────────────────────────────────────

const GLOBAL_TYPE_IDS = {
  initialConsultation: "22222222-2222-4222-8222-222222222201",
  followUp: "22222222-2222-4222-8222-222222222202",
  telehealth: "22222222-2222-4222-8222-222222222203",
  annualCheckup: "22222222-2222-4222-8222-222222222204",
} as const;

/** Visit fees in cents — drives UI price badges + auto-draft invoice amounts. */
const GLOBAL_TYPE_PRICE_CENTS: Record<
  (typeof GLOBAL_TYPE_IDS)[keyof typeof GLOBAL_TYPE_IDS],
  number
> = {
  [GLOBAL_TYPE_IDS.initialConsultation]: 15000,
  [GLOBAL_TYPE_IDS.followUp]: 9250,
  [GLOBAL_TYPE_IDS.telehealth]: 8500,
  [GLOBAL_TYPE_IDS.annualCheckup]: 12000,
};

/** Stable ids for professional service categories (sort_order 1–6 wins appointment seed pick). */
const DEMO_SERVICE_CATEGORIES = [
  {
    id: "33333333-3333-4333-8333-333333333301",
    label: "Primary Care & Preventive Medicine",
    description:
      "Routine exams, chronic disease management, vaccinations, and wellness counselling.",
    color: "#0ea5e9",
    icon: "stethoscope",
    sort_order: 1,
    duration_minutes_default: 30,
  },
  {
    id: "33333333-3333-4333-8333-333333333302",
    label: "Cardiology & Vascular Health",
    description:
      "Heart rhythm assessment, hypertension management, and cardiovascular risk screening.",
    color: "#ef4444",
    icon: "heart-pulse",
    sort_order: 2,
    duration_minutes_default: 45,
  },
  {
    id: "33333333-3333-4333-8333-333333333303",
    label: "Dermatology & Skin Care",
    description:
      "Acne, eczema, mole checks, cosmetic dermatology, and laser treatment consultations.",
    color: "#f59e0b",
    icon: "scan-face",
    sort_order: 3,
    duration_minutes_default: 30,
  },
  {
    id: "33333333-3333-4333-8333-333333333304",
    label: "Neurology & Cognitive Health",
    description:
      "Headache clinics, seizure follow-up, memory concerns, and nerve conduction review.",
    color: "#8b5cf6",
    icon: "brain",
    sort_order: 4,
    duration_minutes_default: 45,
  },
  {
    id: "33333333-3333-4333-8333-333333333305",
    label: "Pediatrics & Adolescent Care",
    description:
      "Well-child visits, developmental screening, immunizations, and school health forms.",
    color: "#10b981",
    icon: "baby",
    sort_order: 5,
    duration_minutes_default: 30,
  },
  {
    id: "33333333-3333-4333-8333-333333333306",
    label: "Mental Health & Psychiatry",
    description:
      "Therapy intake, medication management, anxiety and depression follow-up, crisis planning.",
    color: "#6366f1",
    icon: "brain-circuit",
    sort_order: 6,
    duration_minutes_default: 50,
  },
] as const;

const DEMO_ADMIN_PROFILE = {
  phone: "+49 30 100 200 00",
  license_number: "ADM-2016-DE-001",
  department: "HealthCal Administration",
  consultation_fee: 0,
  office_location: "Berlin HQ — Operations, Floor 2",
  languages_spoken: ["English", "German"] as string[],
  years_of_experience: 12,
};

// ─── Additional demo patients (beyond the primary demo patient) ───────────────

const EXTRA_PATIENTS = [
  {
    firstname: "Maria",
    lastname: "Schmidt",
    email: "maria.schmidt@demo.healthcal",
    phone: "+49 30 201 001 01",
    portraitUrl: "/users/img-4.avif",
    birth_date: new Date("1985-03-14"),
    active: true,
    blood_type: "O-",
    height_cm: 165,
    weight_kg: 62.0,
    insurance_provider: "TK Techniker Krankenkasse",
    insurance_id: "TK-1985-DE-441123",
    preferred_language: "German",
    national_id: "DE985314001",
    occupation: "Accountant",
    pronoun: "she/her",
    care_level: 2,
  },
  {
    firstname: "Jan",
    lastname: "Mueller",
    email: "jan.mueller@demo.healthcal",
    phone: "+49 30 201 001 02",
    portraitUrl: "/users/img-5.avif",
    birth_date: new Date("1978-07-22"),
    active: true,
    blood_type: "A+",
    height_cm: 182,
    weight_kg: 84.5,
    insurance_provider: "Barmer GEK",
    insurance_id: "BAR-1978-DE-227834",
    preferred_language: "German",
    national_id: "DE780722002",
    occupation: "Engineer",
    pronoun: "he/him",
    care_level: 1,
  },
  {
    firstname: "Anya",
    lastname: "Petrov",
    email: "anya.petrov@demo.healthcal",
    phone: "+49 30 201 001 03",
    portraitUrl: "/users/img-6.avif",
    birth_date: new Date("1992-11-05"),
    active: true,
    blood_type: "B+",
    height_cm: 170,
    weight_kg: 58.0,
    insurance_provider: "DAK Gesundheit",
    insurance_id: "DAK-1992-DE-550571",
    preferred_language: "Russian",
    national_id: "DE921105003",
    occupation: "Designer",
    pronoun: "she/her",
    care_level: 1,
  },
  {
    firstname: "Thomas",
    lastname: "Weber",
    email: "thomas.weber@demo.healthcal",
    phone: "+49 30 201 001 04",
    portraitUrl: "/users/img-7.avif",
    birth_date: new Date("1969-09-30"),
    active: true,
    blood_type: "AB-",
    height_cm: 178,
    weight_kg: 91.0,
    insurance_provider: "AOK Bayern",
    insurance_id: "AOK-1969-DE-930401",
    preferred_language: "German",
    national_id: "DE690930004",
    occupation: "Teacher",
    pronoun: "he/him",
    care_level: 3,
  },
] as const;

// ─── Main seed function ──────────────────────────────────────────────────────

async function seedExtendedSchema() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL not found in .env.local");
    process.exit(1);
  }

  const { prisma } = await import("../src/lib/prisma");
  const { DEMO_PATIENT_EMAIL } = await import("../src/lib/demo-credentials");
  const {
    mergeClinicalProfileJson,
    DEMO_PATIENT_PORTRAIT_BY_EMAIL,
  } = await import("../src/lib/seed-clinical-profile");

  // ── 0. Demo admin staff profile fields (parity with doctor extended columns) ─
  console.log("🛡️  Updating demo admin profile…");
  const adminUser = await prisma.user.findFirst({ where: { email: "test@admin.com" } });
  if (adminUser) {
    await prisma.user.update({
      where: { id: adminUser.id },
      data: DEMO_ADMIN_PROFILE,
    });
    console.log("  ✔ test@admin.com");
  }

  // ── 0b. Professional medical / service categories (idempotent upsert) ─────
  const adminForCategoryAudit =
    adminUser ?? (await prisma.user.findFirst({ where: { role: "admin" } }));
  const categoryAuditStamp = adminForCategoryAudit
    ? {
        created_by_id: adminForCategoryAudit.id,
        updated_by_id: adminForCategoryAudit.id,
        updated_at: new Date(),
      }
    : {};

  console.log("\n🏷️  Upserting demo service categories…");
  for (const cat of DEMO_SERVICE_CATEGORIES) {
    await prisma.category.upsert({
      where: { id: cat.id },
      create: {
        id: cat.id,
        label: cat.label,
        description: cat.description,
        color: cat.color,
        icon: cat.icon,
        is_active: true,
        sort_order: cat.sort_order,
        duration_minutes_default: cat.duration_minutes_default,
        ...categoryAuditStamp,
      },
      update: {
        label: cat.label,
        description: cat.description,
        color: cat.color,
        icon: cat.icon,
        is_active: true,
        sort_order: cat.sort_order,
        duration_minutes_default: cat.duration_minutes_default,
        ...categoryAuditStamp,
      },
    });
    console.log(`  ✔ ${cat.label}`);
  }

  // ── 1. Extend doctor profiles with new Phase-1 fields ───────────────────
  console.log("👨‍⚕️  Updating doctor profiles…");
  const { applyDoctorProfileSeeds } = await import("./lib/apply-doctor-profile-seeds");
  const doctorCount = await applyDoctorProfileSeeds(prisma);
  console.log(`  ✔ ${doctorCount} doctor profile(s) updated`);

  // ── 2. Update global appointment types with metadata + price_cents ──
  console.log("\n📅  Updating global appointment type metadata + visit fees…");
  const globalMeta: {
    id: (typeof GLOBAL_TYPE_IDS)[keyof typeof GLOBAL_TYPE_IDS];
    color: string;
    icon: string;
    is_telehealth: boolean;
  }[] = [
    { id: GLOBAL_TYPE_IDS.initialConsultation, color: "#6366f1", icon: "stethoscope", is_telehealth: false },
    { id: GLOBAL_TYPE_IDS.followUp, color: "#10b981", icon: "clock", is_telehealth: false },
    { id: GLOBAL_TYPE_IDS.telehealth, color: "#0ea5e9", icon: "video", is_telehealth: true },
    { id: GLOBAL_TYPE_IDS.annualCheckup, color: "#f59e0b", icon: "heart", is_telehealth: false },
  ];
  for (const g of globalMeta) {
    await prisma.appointmentType.update({
      where: { id: g.id },
      data: {
        color: g.color,
        icon: g.icon,
        is_telehealth: g.is_telehealth,
        is_active: true,
        price_cents: GLOBAL_TYPE_PRICE_CENTS[g.id],
      },
    });
  }
  console.log("  ✔ 4 global types updated (price_cents set)");

  // ── 3. Update demo patient (test@patient.com) with extended clinical fields ─
  console.log("\n🧑‍⚕️  Updating demo patient clinical fields…");
  const demoPatient = await prisma.patient.findFirst({
    where: { email: DEMO_PATIENT_EMAIL },
  });
  if (demoPatient) {
    const demoPortrait = DEMO_PATIENT_PORTRAIT_BY_EMAIL[DEMO_PATIENT_EMAIL];
    await prisma.patient.update({
      where: { id: demoPatient.id },
      data: {
        phone: "+49 30 111 222 33",
        blood_type: "O+",
        height_cm: 172,
        weight_kg: 68.5,
        insurance_provider: "AOK Bayern",
        insurance_id: "AOK-1990-DE-001234",
        preferred_language: "English",
        national_id: "DE900101005",
        occupation: "Software Engineer",
        clinical_profile: mergeClinicalProfileJson(demoPatient.clinical_profile, {
          allergies: ["penicillin (demo)"],
          notes: "Seeded clinical profile for Patient Management / snapshot demos.",
          ...(demoPortrait ? { image_url: demoPortrait } : {}),
        }),
      },
    });
    console.log(`  ✔ ${DEMO_PATIENT_EMAIL}`);
  }

  // ── 4. Seed extra demo patients ───────────────────────────────────────────
  console.log("\n🏥  Seeding extra demo patients…");
  const doctor = await prisma.user.findFirst({ where: { email: "test@doctor.com" } });
  const adminForAudit =
    adminUser ?? (await prisma.user.findFirst({ where: { role: "admin" } }));

  const seededPatients: { id: string; email: string }[] = demoPatient
    ? [{ id: demoPatient.id, email: demoPatient.email ?? "" }]
    : [];

  for (const p of EXTRA_PATIENTS) {
    const existing = await prisma.patient.findFirst({ where: { email: p.email } });
    const clinicalPatch = {
      image_url: p.portraitUrl,
      notes: `Demo patient — ${p.firstname} ${p.lastname}. Seeded for roster and portal portrait demos.`,
    };
    if (existing) {
      await prisma.patient.update({
        where: { id: existing.id },
        data: {
          phone: p.phone,
          blood_type: p.blood_type,
          height_cm: p.height_cm,
          weight_kg: p.weight_kg,
          insurance_provider: p.insurance_provider,
          insurance_id: p.insurance_id,
          preferred_language: p.preferred_language,
          national_id: p.national_id,
          occupation: p.occupation,
          clinical_profile: mergeClinicalProfileJson(existing.clinical_profile, clinicalPatch),
        },
      });
      seededPatients.push({ id: existing.id, email: p.email });
      console.log(`  ✔ ${p.firstname} ${p.lastname} (updated)`);
    } else {
      const created = await prisma.patient.create({
        data: {
          firstname: p.firstname,
          lastname: p.lastname,
          email: p.email,
          phone: p.phone,
          birth_date: p.birth_date,
          active: p.active,
          pronoun: p.pronoun,
          care_level: p.care_level,
          blood_type: p.blood_type,
          height_cm: p.height_cm,
          weight_kg: p.weight_kg,
          insurance_provider: p.insurance_provider,
          insurance_id: p.insurance_id,
          preferred_language: p.preferred_language,
          national_id: p.national_id,
          occupation: p.occupation,
          clinical_profile: mergeClinicalProfileJson(null, clinicalPatch),
          ...(doctor ? { primary_doctor_id: doctor.id } : {}),
          ...(adminForAudit
            ? { created_by_id: adminForAudit.id, updated_by_id: adminForAudit.id }
            : {}),
        },
      });
      seededPatients.push({ id: created.id, email: p.email });
      console.log(`  ✔ ${p.firstname} ${p.lastname} (created)`);
    }
  }

  // ── 5. Seed DoctorAppointmentTypeConfig (per-doctor type toggle demos) ───
  console.log("\n🔧  Seeding DoctorAppointmentTypeConfig rows…");
  const configSpecs = [
    // Demo Doctor 3 (Dermatology) disables Annual Check-up — not relevant to skin conditions
    { doctorEmail: "demo.doctor3@healthcal.dev", typeId: GLOBAL_TYPE_IDS.annualCheckup, is_enabled: false },
    // Demo Doctor 4 (Neurology) disables Follow-up Visit — uses its own neurology follow-up type
    { doctorEmail: "demo.doctor4@healthcal.dev", typeId: GLOBAL_TYPE_IDS.followUp, is_enabled: false },
    // Demo Doctor 6 (Oncology) disables Telehealth — in-person only per clinic policy
    { doctorEmail: "demo.doctor6@healthcal.dev", typeId: GLOBAL_TYPE_IDS.telehealth, is_enabled: false },
  ];
  for (const spec of configSpecs) {
    const targetDoctor = await prisma.user.findFirst({ where: { email: spec.doctorEmail } });
    if (!targetDoctor) continue;
    await prisma.doctorAppointmentTypeConfig.upsert({
      where: {
        doctor_id_appointment_type_id: {
          doctor_id: targetDoctor.id,
          appointment_type_id: spec.typeId,
        },
      },
      create: { doctor_id: targetDoctor.id, appointment_type_id: spec.typeId, is_enabled: spec.is_enabled },
      update: { is_enabled: spec.is_enabled },
    });
    console.log(`  ✔ ${spec.doctorEmail} → typeId …${spec.typeId.slice(-4)} = ${spec.is_enabled}`);
  }

  // ── 7. Seed appointments with appointment_type_id + chief_complaint ───────
  console.log("\n📆  Seeding typed appointments with chief complaints…");
  if (doctor) {
    const cat = await prisma.category.findFirst({
      where: { id: { in: DEMO_SERVICE_CATEGORIES.map((c) => c.id) } },
      orderBy: { sort_order: "asc" },
    });
    const now = new Date();

    // One appointment per global type for the next 5 days using seededPatients
    const appointmentSpecs = [
      {
        title: "Initial Consultation — Demo Patient",
        typeId: GLOBAL_TYPE_IDS.initialConsultation,
        chiefComplaint: "Persistent fatigue and mild shortness of breath for 3 weeks.",
        daysFromNow: 1,
        durationMinutes: 60,
        patientIdx: 0,
        status: "pending",
        is_telehealth: false,
      },
      {
        title: "Telehealth Session — Maria Schmidt",
        typeId: GLOBAL_TYPE_IDS.telehealth,
        chiefComplaint: "Post-operative check — knee arthroscopy follow-up.",
        daysFromNow: 2,
        durationMinutes: 20,
        patientIdx: 1,
        status: "pending",
        is_telehealth: true,
        telehealthLink: "https://meet.healthcal.dev/room/demo-telehealth-001",
      },
      {
        title: "Follow-up Visit — Jan Mueller",
        typeId: GLOBAL_TYPE_IDS.followUp,
        chiefComplaint: "Blood pressure review after medication adjustment last month.",
        daysFromNow: 3,
        durationMinutes: 30,
        patientIdx: 2,
        status: "pending",
        is_telehealth: false,
      },
      {
        title: "Annual Check-up — Anya Petrov",
        typeId: GLOBAL_TYPE_IDS.annualCheckup,
        chiefComplaint: "Routine annual health assessment and lab work review.",
        daysFromNow: 4,
        durationMinutes: 45,
        patientIdx: 3,
        status: "pending",
        is_telehealth: false,
      },
      {
        title: "Telehealth Session — Thomas Weber",
        typeId: GLOBAL_TYPE_IDS.telehealth,
        chiefComplaint: "Recurring migraine — request for specialist referral.",
        daysFromNow: 5,
        durationMinutes: 20,
        patientIdx: 4,
        status: "pending",
        is_telehealth: true,
        telehealthLink: "https://meet.healthcal.dev/room/demo-telehealth-002",
      },
    ];

    for (const spec of appointmentSpecs) {
      const existingAppt = await prisma.appointment.findFirst({
        where: { owner_id: doctor.id, title: spec.title },
      });
      if (existingAppt) {
        console.log(`  – "${spec.title}" already exists`);
        continue;
      }
      const patientRef = seededPatients[spec.patientIdx];
      const start = new Date(now.getTime() + spec.daysFromNow * 24 * 60 * 60 * 1000);
      start.setHours(9 + spec.patientIdx, 0, 0, 0);
      const end = new Date(start.getTime() + spec.durationMinutes * 60 * 1000);

      await prisma.appointment.create({
        data: {
          title: spec.title,
          start,
          end,
          location: spec.is_telehealth ? "Video Call" : "Demo Clinic — Room 1",
          patient_id: patientRef?.id ?? null,
          category_id: cat?.id ?? null,
          notes: `Demo appointment seeded by seed-extended-schema.ts`,
          status: spec.status,
          owner_id: doctor.id,
          treating_physician_id: doctor.id,
          appointment_type_id: spec.typeId,
          is_telehealth: spec.is_telehealth,
          chief_complaint: spec.chiefComplaint,
          duration_minutes: spec.durationMinutes,
          telehealth_link: "telehealthLink" in spec ? spec.telehealthLink : null,
          attachments: [],
        },
      });
      console.log(`  ✔ "${spec.title}"`);
    }
  }

  // ── 6. Demo doctor-owned visit types + scheduling parity (buffers / slot step) ─
  console.log("\n📋  Seeding demo doctor-owned visit types + scheduling fields…");
  const ownedTypeSpecs = [
    {
      doctorEmail: "test@doctor.com",
      name: "Physio Theraphy",
      duration_minutes: 30,
      price_cents: 7500,
      description: "Custom physiotherapy session for Demo Doctor.",
    },
    {
      doctorEmail: "demo.doctor2@healthcal.dev",
      name: "Test Report Show",
      duration_minutes: 40,
      price_cents: 9500,
      description: "Review diagnostic imaging and lab reports with the patient.",
    },
  ] as const;

  for (const spec of ownedTypeSpecs) {
    const doc = await prisma.user.findFirst({ where: { email: spec.doctorEmail } });
    if (!doc) {
      console.log(`  – skip ${spec.name} (doctor ${spec.doctorEmail} missing)`);
      continue;
    }
    const existing = await prisma.appointmentType.findFirst({
      where: {
        user_id: doc.id,
        name: { equals: spec.name, mode: "insensitive" },
        is_active: true,
      },
    });
    const scheduling = {
      buffer_before_minutes: 5,
      buffer_after_minutes: 5,
      slot_interval_minutes: 30,
      minimum_notice_minutes: 60,
    };
    if (existing) {
      await prisma.appointmentType.update({
        where: { id: existing.id },
        data: {
          description: spec.description,
          duration_minutes: spec.duration_minutes,
          price_cents: spec.price_cents,
          ...scheduling,
        },
      });
      console.log(`  ✔ ${spec.name} (updated scheduling + price)`);
    } else {
      await prisma.appointmentType.create({
        data: {
          user_id: doc.id,
          name: spec.name,
          description: spec.description,
          duration_minutes: spec.duration_minutes,
          price_cents: spec.price_cents,
          ...scheduling,
        },
      });
      console.log(`  ✔ ${spec.name} (created)`);
    }
  }

  const zeroBufferOwned = await prisma.appointmentType.findMany({
    where: {
      user_id: { not: null },
      is_active: true,
      buffer_before_minutes: 0,
      buffer_after_minutes: 0,
    },
  });
  for (const row of zeroBufferOwned) {
    await prisma.appointmentType.update({
      where: { id: row.id },
      data: {
        buffer_before_minutes: 5,
        buffer_after_minutes: 5,
        slot_interval_minutes: row.slot_interval_minutes > 0 ? row.slot_interval_minutes : 30,
      },
    });
  }
  if (zeroBufferOwned.length) {
    console.log(`  ✔ Patched ${zeroBufferOwned.length} doctor-owned type(s) with default 5m buffers`);
  }

  console.log("\n✅  Extended schema seed complete.");
}

seedExtendedSchema()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
