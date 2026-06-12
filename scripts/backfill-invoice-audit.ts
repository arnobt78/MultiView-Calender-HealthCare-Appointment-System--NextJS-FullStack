/**
 * Idempotent backfill — invoices.created_by / updated_by / updated_at for Record Audit.
 * Run after `prisma:push`: `npm run db:backfill-invoice-audit`
 */
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const { prisma } = await import("../src/lib/prisma");

  const rows = await prisma.invoice.findMany({
    select: {
      id: true,
      user_id: true,
      created_at: true,
      created_by_id: true,
      updated_by_id: true,
      updated_at: true,
    },
  });

  let createdCount = 0;
  let updatedCount = 0;

  for (const row of rows) {
    const createdBy = row.created_by_id ?? row.user_id;
    const updatedBy = row.updated_by_id ?? createdBy;
    const updatedAt = row.updated_at ?? row.created_at;

    if (
      row.created_by_id === createdBy &&
      row.updated_by_id === updatedBy &&
      row.updated_at?.getTime() === updatedAt.getTime()
    ) {
      continue;
    }

    await prisma.invoice.update({
      where: { id: row.id },
      data: {
        created_by_id: createdBy,
        updated_by_id: updatedBy,
        updated_at: updatedAt,
      },
    });

    if (!row.created_by_id) createdCount += 1;
    if (!row.updated_by_id || !row.updated_at) updatedCount += 1;
  }

  console.log(
    `Backfill complete — created_by filled: ${createdCount}, updated audit filled: ${updatedCount}`
  );
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
