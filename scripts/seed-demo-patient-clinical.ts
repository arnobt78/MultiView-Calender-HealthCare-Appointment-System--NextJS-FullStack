/**
 * Idempotent: sets `clinical_profile` JSON on the demo patient row (test@patient.com).
 * Run after `prisma db push` / migrations. Usage: npm run db:seed-demo-clinical
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL missing (.env.local)");
    process.exit(1);
  }
  const { prisma } = await import("../src/lib/prisma");
  const { DEMO_PATIENT_EMAIL } = await import("../src/lib/demo-credentials");

  const row = await prisma.patient.findFirst({
    where: { email: DEMO_PATIENT_EMAIL },
  });
  if (!row) {
    console.warn("No patient row for demo email; run npm run db:seed-test-user first.");
    process.exit(0);
  }

  await prisma.patient.update({
    where: { id: row.id },
    data: {
      clinical_profile: {
        allergies: ["penicillin (demo)"],
        notes: "Seeded clinical profile for Patient Management / snapshot demos.",
      },
    },
  });
  console.log("Updated clinical_profile for", DEMO_PATIENT_EMAIL);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
