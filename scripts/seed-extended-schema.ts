/**
 * seed-extended-schema.ts
 *
 * Idempotent seed for all fields added in the v006 schema extension:
 *   - Doctor profile fields (phone, license_number, department, consultation_fee,
 *     office_location, languages_spoken, years_of_experience)
 *   - Global AppointmentType metadata (is_telehealth, color, icon)
 *   - Patient clinical fields (blood_type, height_cm, weight_kg, insurance_*, etc.)
 *   - Extra demo patients (4 additional) with full new fields
 *   - Relatives linked to demo patients
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

// ─── Extended doctor profile data ────────────────────────────────────────────

const DOCTOR_PROFILES: Record<
  string,
  {
    phone: string;
    license_number: string;
    department: string;
    consultation_fee: number;
    office_location: string;
    languages_spoken: string[];
    years_of_experience: number;
  }
> = {
  "test@doctor.com": {
    phone: "+49 30 123 456 00",
    license_number: "MED-2018-DE-001",
    department: "Internal Medicine",
    consultation_fee: 15000,
    office_location: "Room 101, Block A",
    languages_spoken: ["English", "German"],
    years_of_experience: 8,
  },
  "demo.doctor2@healthcal.dev": {
    phone: "+49 30 234 567 00",
    license_number: "MED-2015-DE-002",
    department: "Cardiology",
    consultation_fee: 20000,
    office_location: "Cardiac Wing, Floor 2",
    languages_spoken: ["English", "French"],
    years_of_experience: 11,
  },
  "demo.doctor3@healthcal.dev": {
    phone: "+49 30 345 678 00",
    license_number: "MED-2019-DE-003",
    department: "Dermatology",
    consultation_fee: 18000,
    office_location: "Derma Suite, Room 3B",
    languages_spoken: ["English", "Spanish"],
    years_of_experience: 6,
  },
  "demo.doctor4@healthcal.dev": {
    phone: "+49 30 456 789 00",
    license_number: "MED-2012-DE-004",
    department: "Neurology",
    consultation_fee: 22000,
    office_location: "Neuro Clinic, Floor 4",
    languages_spoken: ["English", "German", "Arabic"],
    years_of_experience: 14,
  },
  "demo.doctor5@healthcal.dev": {
    phone: "+49 30 567 890 00",
    license_number: "MED-2020-DE-005",
    department: "Pediatrics",
    consultation_fee: 12000,
    office_location: "Children's Wing, Room 5",
    languages_spoken: ["English", "Turkish"],
    years_of_experience: 5,
  },
  "demo.doctor6@healthcal.dev": {
    phone: "+49 30 678 901 00",
    license_number: "MED-2010-DE-006",
    department: "Oncology",
    consultation_fee: 25000,
    office_location: "Cancer Centre, Floor 6",
    languages_spoken: ["English", "German", "Polish"],
    years_of_experience: 16,
  },
  "demo.doctor7@healthcal.dev": {
    phone: "+49 30 789 012 00",
    license_number: "MED-2016-DE-007",
    department: "Orthopedics",
    consultation_fee: 19000,
    office_location: "Ortho Block, Room 7",
    languages_spoken: ["English", "Italian"],
    years_of_experience: 10,
  },
  "demo.doctor8@healthcal.dev": {
    phone: "+49 30 890 123 00",
    license_number: "MED-2017-DE-008",
    department: "Psychiatry",
    consultation_fee: 17000,
    office_location: "Mental Health Suite, Level 2",
    languages_spoken: ["English", "German", "Russian"],
    years_of_experience: 9,
  },
};

// ─── Additional demo patients (beyond the primary demo patient) ───────────────

const EXTRA_PATIENTS = [
  {
    firstname: "Maria",
    lastname: "Schmidt",
    email: "maria.schmidt@demo.healthcal",
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

  // ── 1. Extend doctor profiles with new Phase-1 fields ───────────────────
  console.log("👨‍⚕️  Updating doctor profiles…");
  for (const [email, profile] of Object.entries(DOCTOR_PROFILES)) {
    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) continue;
    await prisma.user.update({ where: { id: user.id }, data: profile });
    console.log(`  ✔ ${email}`);
  }

  // ── 2. Update global appointment types with is_telehealth + color + icon ──
  console.log("\n📅  Updating global appointment type metadata…");
  await prisma.appointmentType.update({
    where: { id: GLOBAL_TYPE_IDS.initialConsultation },
    data: { color: "#6366f1", icon: "stethoscope", is_telehealth: false, is_active: true },
  });
  await prisma.appointmentType.update({
    where: { id: GLOBAL_TYPE_IDS.followUp },
    data: { color: "#10b981", icon: "clock", is_telehealth: false, is_active: true },
  });
  // Telehealth Session must have is_telehealth = true so the badge + video gate work
  await prisma.appointmentType.update({
    where: { id: GLOBAL_TYPE_IDS.telehealth },
    data: { color: "#0ea5e9", icon: "video", is_telehealth: true, is_active: true },
  });
  await prisma.appointmentType.update({
    where: { id: GLOBAL_TYPE_IDS.annualCheckup },
    data: { color: "#f59e0b", icon: "heart", is_telehealth: false, is_active: true },
  });
  console.log("  ✔ 4 global types updated");

  // ── 3. Update demo patient (test@patient.com) with extended clinical fields ─
  console.log("\n🧑‍⚕️  Updating demo patient clinical fields…");
  const demoPatient = await prisma.patient.findFirst({
    where: { email: DEMO_PATIENT_EMAIL },
  });
  if (demoPatient) {
    await prisma.patient.update({
      where: { id: demoPatient.id },
      data: {
        blood_type: "O+",
        height_cm: 172,
        weight_kg: 68.5,
        insurance_provider: "AOK Bayern",
        insurance_id: "AOK-1990-DE-001234",
        preferred_language: "English",
        national_id: "DE900101005",
        occupation: "Software Engineer",
      },
    });
    console.log(`  ✔ ${DEMO_PATIENT_EMAIL}`);
  }

  // ── 4. Seed extra demo patients ───────────────────────────────────────────
  console.log("\n🏥  Seeding extra demo patients…");
  const doctor = await prisma.user.findFirst({ where: { email: "test@doctor.com" } });
  const adminUser = await prisma.user.findFirst({ where: { role: "admin" } });

  const seededPatients: { id: string; email: string }[] = demoPatient
    ? [{ id: demoPatient.id, email: demoPatient.email ?? "" }]
    : [];

  for (const p of EXTRA_PATIENTS) {
    const existing = await prisma.patient.findFirst({ where: { email: p.email } });
    if (existing) {
      await prisma.patient.update({
        where: { id: existing.id },
        data: {
          blood_type: p.blood_type,
          height_cm: p.height_cm,
          weight_kg: p.weight_kg,
          insurance_provider: p.insurance_provider,
          insurance_id: p.insurance_id,
          preferred_language: p.preferred_language,
          national_id: p.national_id,
          occupation: p.occupation,
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
          ...(doctor ? { primary_doctor_id: doctor.id } : {}),
          ...(adminUser ? { created_by_id: adminUser.id, updated_by_id: adminUser.id } : {}),
        },
      });
      seededPatients.push({ id: created.id, email: p.email });
      console.log(`  ✔ ${p.firstname} ${p.lastname} (created)`);
    }
  }

  // ── 5. Seed relatives for the demo patient ───────────────────────────────
  console.log("\n👨‍👩‍👧  Seeding relatives for demo patient…");
  if (demoPatient) {
    const relativeSpecs = [
      {
        firstname: "Sarah",
        lastname: "Patient",
        relationship: "sister",
        email: "sarah.patient@demo.healthcal",
        phone: "+49 30 111 222 33",
      },
      {
        firstname: "Michael",
        lastname: "Patient",
        relationship: "brother",
        email: "michael.patient@demo.healthcal",
        phone: "+49 30 111 222 44",
      },
    ];
    for (const rel of relativeSpecs) {
      const existingRel = await prisma.relative.findFirst({
        where: { patient_id: demoPatient.id, email: rel.email },
      });
      if (!existingRel) {
        await prisma.relative.create({
          data: {
            patient_id: demoPatient.id,
            firstname: rel.firstname,
            lastname: rel.lastname,
            relationship: rel.relationship,
            email: rel.email,
            phone: rel.phone,
          },
        });
        console.log(`  ✔ ${rel.firstname} ${rel.lastname} (${rel.relationship})`);
      } else {
        console.log(`  – ${rel.firstname} ${rel.lastname} already exists`);
      }
    }
  }

  // ── 6. Seed DoctorAppointmentTypeConfig (per-doctor type toggle demos) ───
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
    const cat = await prisma.category.findFirst({ orderBy: { sort_order: "asc" } });
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

  console.log("\n✅  Extended schema seed complete.");
}

seedExtendedSchema()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
