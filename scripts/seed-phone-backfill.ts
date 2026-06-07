/**
 * Idempotent phone backfill for demo users + patients (SMS reminders + detail display).
 *
 * Usage: npm run db:seed-phones
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const DEMO_USER_PHONES: Record<string, string> = {
  "test@admin.com": "+49 30 100 200 00",
  "test@doctor.com": "+49 30 123 456 00",
  "test@patient.com": "+49 30 111 222 33",
};

const DEMO_PATIENT_PHONES: Record<string, string> = {
  "test@patient.com": "+49 30 111 222 33",
  "maria.schmidt@demo.healthcal": "+49 30 201 001 01",
  "jan.mueller@demo.healthcal": "+49 30 201 001 02",
  "anya.petrov@demo.healthcal": "+49 30 201 001 03",
  "thomas.weber@demo.healthcal": "+49 30 201 001 04",
};

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL not found in .env.local");
    process.exit(1);
  }

  const { prisma } = await import("../src/lib/prisma");
  const { DOCTOR_PROFILES } = await import("./lib/doctor-profile-seed-data");

  console.log("📞 Backfilling doctor user phones…");
  for (const [email, profile] of Object.entries(DOCTOR_PROFILES)) {
    const updated = await prisma.user.updateMany({
      where: { email },
      data: { phone: profile.phone },
    });
    if (updated.count > 0) console.log(`  ✔ user ${email}`);
  }

  console.log("📞 Backfilling core demo user phones…");
  for (const [email, phone] of Object.entries(DEMO_USER_PHONES)) {
    const updated = await prisma.user.updateMany({
      where: { email },
      data: { phone },
    });
    if (updated.count > 0) console.log(`  ✔ user ${email}`);
  }

  console.log("📞 Backfilling patient phones…");
  for (const [email, phone] of Object.entries(DEMO_PATIENT_PHONES)) {
    const updated = await prisma.patient.updateMany({
      where: { email },
      data: { phone },
    });
    if (updated.count > 0) console.log(`  ✔ patient ${email}`);
    await prisma.user.updateMany({ where: { email }, data: { phone } });
  }

  console.log("✅ Phone backfill complete.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
