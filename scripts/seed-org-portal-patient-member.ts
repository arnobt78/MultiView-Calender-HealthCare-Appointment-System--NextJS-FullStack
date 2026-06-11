/**
 * Idempotent: adds demo portal patient user(s) to HealthCal Demo Clinic org.
 * Run: npm run db:seed-org-portal-patient-member
 * Does not wipe appointments — safe for local dev refresh of org list `pt` count.
 */

import { config } from "dotenv";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";
import { DEMO_CURATED_ORG_SLUG } from "./lib/demo-appointment-curated-spec";

config({ path: resolve(process.cwd(), ".env.local") });

const PORTAL_PATIENT_EMAILS = ["test@patient.com"] as const;

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.findUnique({
    where: { slug: DEMO_CURATED_ORG_SLUG },
    select: { id: true, name: true },
  });
  if (!org) {
    throw new Error(`Missing org slug ${DEMO_CURATED_ORG_SLUG} — run db:prepare / demo seed first.`);
  }

  const portalUsers = await prisma.user.findMany({
    where: { email: { in: [...PORTAL_PATIENT_EMAILS] }, role: "patient" },
    select: { id: true, email: true },
  });

  if (portalUsers.length === 0) {
    throw new Error("No portal patient users found — run db:seed-test-user first.");
  }

  for (const u of portalUsers) {
    await prisma.organizationMember.upsert({
      where: { org_id_user_id: { org_id: org.id, user_id: u.id } },
      create: { org_id: org.id, user_id: u.id, role: "patient" },
      update: { role: "patient" },
    });
    console.log(`  ✔ ${u.email} → ${org.name} (patient)`);
  }

  console.log(`\n✅ Org portal patient member seed complete (${portalUsers.length} user(s)).`);
}

main()
  .catch((err) => {
    console.error("❌ seed-org-portal-patient-member failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
