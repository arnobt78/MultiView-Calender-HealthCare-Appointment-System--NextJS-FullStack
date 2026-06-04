/**
 * Read-only demo seed health check — row counts + doctors missing office_location.
 *
 * Usage: npm run db:check-demo-seed
 */

import { config } from "dotenv";
import { resolve } from "path";

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
    { entity: "invoices", count: invoices },
    { entity: "doctors_missing_office_location", count: doctorsMissingOffice },
  ]);

  if (doctorsMissingOffice > 0) {
    console.log("\nℹ️  Run: npm run db:seed-doctor-profiles (after db:seed-test-user)");
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
