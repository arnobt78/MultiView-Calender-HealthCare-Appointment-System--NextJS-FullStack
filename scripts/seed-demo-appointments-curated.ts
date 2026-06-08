/**
 * Curated 10-appointment seed — delegates to shared seed module.
 * Prefer: npm run db:reset-demo-appointments
 */

import { config } from "dotenv";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";
import { seedCuratedDemoAppointments } from "./lib/demo-appointment-curated-seed";

config({ path: resolve(process.cwd(), ".env.local") });

const prisma = new PrismaClient();

seedCuratedDemoAppointments(prisma)
  .then((result) => {
    console.log(`\n✅ Demo curated seed complete.`);
    console.log(
      `   Created: ${result.created} | Curated: ${result.curated} | Total: ${result.total}`
    );
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ seed-demo-appointments-curated failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
