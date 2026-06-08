/**
 * Read-only demo seed health check — row counts + curated appointment invariants.
 *
 * Usage: npm run db:check-demo-seed
 */

import { config } from "dotenv";
import { resolve } from "path";
import { DEMO_CURATED_SEED_MARKER } from "./lib/demo-appointment-curated-spec";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL not found.");
    process.exit(1);
  }

  const { prisma } = await import("../src/lib/prisma");

  const [users, doctors, patients, categories, appointments, invoices] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "doctor" } }),
    prisma.patient.count(),
    prisma.category.count(),
    prisma.appointment.count(),
    prisma.invoice.count(),
  ]);

  const curatedCount = await prisma.appointment.count({
    where: { notes: { contains: DEMO_CURATED_SEED_MARKER } },
  });

  const cancelledVisits = await prisma.appointment.count({
    where: { status: "cancelled", notes: { contains: DEMO_CURATED_SEED_MARKER } },
  });

  const missingCreatedBy = await prisma.appointment.count({
    where: {
      notes: { contains: DEMO_CURATED_SEED_MARKER },
      created_by_id: null,
    },
  });

  const doctorsMissingOffice = await prisma.user.count({
    where: {
      role: "doctor",
      OR: [{ office_location: null }, { office_location: "" }],
    },
  });

  console.table([
    { entity: "users", count: users },
    { entity: "doctors", count: doctors },
    { entity: "patients", count: patients },
    { entity: "categories", count: categories },
    { entity: "appointments", count: appointments },
    { entity: "curated_v2_appointments", count: curatedCount },
    { entity: "curated_cancelled_visits", count: cancelledVisits },
    { entity: "curated_missing_created_by", count: missingCreatedBy },
    { entity: "invoices", count: invoices },
    { entity: "doctors_missing_office_location", count: doctorsMissingOffice },
  ]);

  let exitCode = 0;

  if (curatedCount > 0) {
    if (appointments !== 10 || curatedCount !== 10) {
      console.error(
        `\n❌ Expected exactly 10 curated appointments (total=${appointments}, curated=${curatedCount}). Run: npm run db:reset-demo-appointments`
      );
      exitCode = 1;
    }
    if (cancelledVisits !== 1) {
      console.error(
        `\n❌ Expected 1 curated visit-cancelled row; got ${cancelledVisits}.`
      );
      exitCode = 1;
    }
    if (missingCreatedBy > 0) {
      console.error(
        `\n❌ ${missingCreatedBy} curated row(s) missing created_by_id (admin audit).`
      );
      exitCode = 1;
    }
  } else if (appointments > 10) {
    console.log(
      `\nℹ️  ${appointments} appointments but no v2 curated marker — run npm run db:reset-demo-appointments`
    );
  }

  if (doctorsMissingOffice > 0) {
    console.log("\nℹ️  Run: npm run db:seed-doctor-profiles (after db:seed-test-user)");
  }

  await prisma.$disconnect();
  process.exit(exitCode);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
