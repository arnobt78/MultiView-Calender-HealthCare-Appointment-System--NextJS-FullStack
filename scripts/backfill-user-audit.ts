/**
 * Idempotent backfill — users.created_by / updated_by / updated_at for Record Audit on doctor detail.
 * Run after `prisma:push` when demo doctors still show timestamps only: `npm run db:backfill-user-audit`
 */
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const { prisma } = await import("../src/lib/prisma");

  const admin = await prisma.user.findFirst({
    where: { email: "test@admin.com" },
    select: { id: true },
  });
  if (!admin) {
    console.error("No test@admin.com user — run npm run db:seed-test-user first.");
    process.exit(1);
  }

  const created = await prisma.user.updateMany({
    where: { created_by_id: null },
    data: { created_by_id: admin.id },
  });

  const updated = await prisma.user.updateMany({
    where: {
      OR: [{ updated_by_id: null }, { updated_at: null }],
    },
    data: {
      updated_by_id: admin.id,
      updated_at: new Date(),
    },
  });

  console.log(`Backfill complete — created_by: ${created.count}, updated audit: ${updated.count}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
