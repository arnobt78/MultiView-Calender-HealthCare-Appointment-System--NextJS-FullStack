/**
 * List appointments grouped by start year — explains insights badge (all) vs YTD/month.
 * Usage: npx tsx scripts/list-appointments-by-year.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL not found (.env.local or .env).");
    process.exit(1);
  }

  const prisma = new PrismaClient();
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const all = await prisma.appointment.findMany({
    orderBy: { start: "asc" },
    select: {
      id: true,
      title: true,
      start: true,
      status: true,
      created_at: true,
      owner: { select: { email: true, display_name: true } },
    },
  });

  const beforeYear = all.filter((a) => new Date(a.start) < yearStart);
  const inYtd = all.filter((a) => {
    const s = new Date(a.start);
    return s >= yearStart && s <= now;
  });
  const inMonth = all.filter((a) => {
    const s = new Date(a.start);
    return s >= monthStart && s <= now;
  });

  console.log("Server now:", now.toISOString());
  console.log("Current year start:", yearStart.toISOString().slice(0, 10));
  console.log("");
  console.log("Counts (org-wide, all rows):");
  console.log("  all-time:", all.length);
  console.log("  year-to-date (start >= Jan 1):", inYtd.length);
  console.log("  this calendar month:", inMonth.length);
  console.log("  before current year (explains badge − YTD):", beforeYear.length);

  const byYear = new Map<number, number>();
  for (const a of all) {
    const y = new Date(a.start).getFullYear();
    byYear.set(y, (byYear.get(y) ?? 0) + 1);
  }
  console.log("\nBy start year:");
  for (const y of [...byYear.keys()].sort((a, b) => a - b)) {
    console.log(`  ${y}: ${byYear.get(y)}`);
  }

  const afterNow = all.filter((a) => new Date(a.start) > now);
  const inYtdNotMonth = inYtd.filter((a) => new Date(a.start) < monthStart);

  console.log("  future (start > now, in all but not YTD/month):", afterNow.length);
  console.log("  YTD but before this month:", inYtdNotMonth.length);

  if (beforeYear.length > 0) {
    console.log("\n--- Appointments with start BEFORE", yearStart.getFullYear(), "---");
    for (const a of beforeYear) {
      printRow(a);
    }
  } else {
    console.log("\nNo appointments with start before the current year.");
  }

  if (afterNow.length > 0) {
    console.log("\n--- Future appointments (start > now) — counted in badge, not in YTD/month ---");
    for (const a of afterNow) {
      printRow(a);
    }
  }

  console.log("\n--- Full list (start ascending) ---");
  for (const a of all) {
    printRow(a);
  }

  function printRow(a: (typeof all)[number]) {
    console.log(
      [
        a.start.toISOString().slice(0, 19),
        `| ${a.status ?? "pending"}`,
        `| ${a.owner?.email ?? "?"}`,
        `| ${a.title?.slice(0, 55) ?? "(no title)"}`,
        `| id=${a.id.slice(0, 8)}…`,
      ].join(" ")
    );
  }

  await prisma.$disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
