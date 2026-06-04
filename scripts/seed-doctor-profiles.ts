/**
 * Upsert demo doctor professional profiles only (phone, license, office_location, consultation_fee, …).
 *
 * Usage: npm run db:seed-doctor-profiles
 * Requires demo doctor users — run `npm run db:seed-test-user` first if missing.
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL not found in .env.local");
    process.exit(1);
  }

  const { prisma } = await import("../src/lib/prisma");
  const { applyDoctorProfileSeeds } = await import("./lib/apply-doctor-profile-seeds");

  console.log("👨‍⚕️  Applying doctor profile seeds…");
  const count = await applyDoctorProfileSeeds(prisma);
  console.log(`✅ Updated ${count} doctor profile(s).`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
