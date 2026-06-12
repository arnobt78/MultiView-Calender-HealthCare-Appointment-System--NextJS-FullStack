/**
 * Idempotent backfill — normalize legacy doctor specialty labels to enum value "Medicine".
 *
 * Usage: npm run db:backfill-doctor-specialty-medicine
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

/** Legacy free-text / seed values → canonical `SPECIALTIES[0]` ("Medicine"). */
const LEGACY_MEDICINE_SPECIALTIES = ["General Medicine", "Internal Medicine"] as const;

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL not found in .env.local");
    process.exit(1);
  }

  const { prisma } = await import("../src/lib/prisma");

  let total = 0;
  for (const legacy of LEGACY_MEDICINE_SPECIALTIES) {
    const result = await prisma.user.updateMany({
      where: { specialty: legacy },
      data: { specialty: "Medicine" },
    });
    if (result.count > 0) {
      console.log(`  ✔ ${legacy} → Medicine (${result.count} user(s))`);
      total += result.count;
    }
  }

  const already = await prisma.user.count({ where: { specialty: "Medicine" } });
  console.log(
    total > 0
      ? `✅ Backfill complete — updated ${total} user(s); ${already} with specialty "Medicine".`
      : `✅ No legacy specialties found; ${already} user(s) already have specialty "Medicine".`
  );

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
