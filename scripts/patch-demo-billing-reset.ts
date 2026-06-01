/**
 * One-shot demo billing cleanup — cancels seeded QA invoices that skew insights.
 * Safe to re-run (idempotent on already-cancelled rows).
 *
 * Usage: npm run db:patch-demo-billing-reset
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const { prisma } = await import("../src/lib/prisma");

  const markers = [
    "Visit invoice — Demo timeline",
    "Please pay. Thank you!",
    "Please pay",
  ];

  const result = await prisma.invoice.updateMany({
    where: {
      status: { in: ["paid", "draft", "sent", "overdue"] },
      OR: markers.map((m) => ({ description: { contains: m } })),
    },
    data: {
      status: "cancelled",
      paid_at: null,
    },
  });

  console.log(`✅ Cancelled ${result.count} demo QA invoice(s).`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("❌ patch-demo-billing-reset failed:", err);
  process.exit(1);
});
