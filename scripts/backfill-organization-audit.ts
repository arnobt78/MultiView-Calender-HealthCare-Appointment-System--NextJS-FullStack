/**
 * Idempotent backfill — organizations.created_by / updated_by / updated_at for Record Audit.
 * Run after `db:migrate` or `prisma:push`: `npm run db:backfill-org-audit`
 */
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const { prisma } = await import("../src/lib/prisma");

  const orgs = await prisma.organization.findMany({
    select: {
      id: true,
      owner_user_id: true,
      created_at: true,
      created_by_id: true,
      updated_by_id: true,
      updated_at: true,
    },
  });

  let updated = 0;
  for (const org of orgs) {
    if (org.created_by_id && org.updated_by_id && org.updated_at) continue;
    await prisma.organization.update({
      where: { id: org.id },
      data: {
        created_by_id: org.created_by_id ?? org.owner_user_id,
        updated_by_id: org.updated_by_id ?? org.owner_user_id,
        updated_at: org.updated_at ?? org.created_at,
      },
    });
    updated += 1;
  }

  console.log(`Organization audit backfill complete — updated: ${updated}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
