/**
 * Idempotent demo users (test@admin.com / test@doctor.com / test@patient.com).
 * Same password for all — see src/lib/demo-credentials.ts.
 *
 * Usage: npm run db:seed-test-user
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

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
  } = await import("../src/lib/demo-credentials");

  const passwordHash = await hashPassword(DEMO_PASSWORD);

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
        duration_minutes: 30,
        buffer_before_minutes: 0,
        buffer_after_minutes: 0,
        slot_interval_minutes: 30,
        minimum_notice_minutes: 60,
      },
      update: {
        user_id: doctor.id,
        name: "Consultation",
        duration_minutes: 30,
        buffer_before_minutes: 0,
        buffer_after_minutes: 0,
        slot_interval_minutes: 30,
        minimum_notice_minutes: 60,
      },
    });
  }
}

seedDemoUsers()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
