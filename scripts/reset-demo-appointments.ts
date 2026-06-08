/**
 * Wipe all appointments (+ invoices/payments/assignees) and seed exactly 10 curated rows.
 *
 * Prereq:
 *   npm run prisma:push
 *   npm run db:prepare && npm run db:seed-extended && npm run db:seed-phones
 *
 * Run: npm run db:reset-demo-appointments
 */

import { config } from "dotenv";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";
import { seedCuratedDemoAppointments } from "./lib/demo-appointment-curated-seed";

config({ path: resolve(process.cwd(), ".env.local") });

const prisma = new PrismaClient();

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not found — load .env.local");
  }

  console.log("🔄 Resetting demo appointments (wipe + 10 curated rows)…");
  const result = await seedCuratedDemoAppointments(prisma);
  console.log(`\n✅ Demo appointment reset complete.`);
  console.log(
    `   Created: ${result.created} | Curated: ${result.curated} | Total: ${result.total}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ db:reset-demo-appointments failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
