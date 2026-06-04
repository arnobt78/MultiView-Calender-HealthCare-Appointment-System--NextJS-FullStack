/**
 * Idempotent demo environment — chains test users, extended schema, clinical + curated appointments.
 *
 * Recommended local setup:
 *   npm run prisma:push
 *   npm run db:seed-demo-full
 */

import { config } from "dotenv";
import { resolve } from "path";
import { execSync } from "child_process";

config({ path: resolve(process.cwd(), ".env.local") });

const steps: { label: string; script: string }[] = [
  { label: "Demo users + global types", script: "scripts/seed-test-user.ts" },
  { label: "Extended profiles (admin, doctors, categories, patients)", script: "scripts/seed-extended-schema.ts" },
  { label: "Demo patient clinical JSON", script: "scripts/seed-demo-patient-clinical.ts" },
  { label: "Curated demo appointments", script: "scripts/seed-demo-appointments-curated.ts" },
];

function runStep(label: string, script: string) {
  console.log(`\n▶ ${label}…`);
  execSync(`npx tsx ${script}`, {
    stdio: "inherit",
    env: process.env,
    cwd: process.cwd(),
  });
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL not found in .env.local");
    process.exit(1);
  }

  console.log("🌱 db:seed-demo-full — idempotent demo data orchestrator");
  for (const step of steps) {
    runStep(step.label, step.script);
  }
  console.log("\n✅ Demo seed orchestration complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
