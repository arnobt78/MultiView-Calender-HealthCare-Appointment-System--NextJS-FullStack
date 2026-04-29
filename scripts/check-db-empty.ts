/**
 * Check whether the database is empty (public schema).
 *
 * Usage:
 *   npm run db:check-empty
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL not found.");
    process.exit(1);
  }

  const { pool, query } = await import("../src/lib/postgresClient");

  try {
    const tablesRes = await query(
      `
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
      `
    );

    const tableNames = tablesRes.rows
      .map((r: { tablename?: string }) => r.tablename)
      .filter((t: string | undefined): t is string => Boolean(t));

    if (tableNames.length === 0) {
      console.log("No public tables found.");
      return;
    }

    const counts: Array<{ table: string; rows: number }> = [];
    for (const table of tableNames) {
      const c = await query(`SELECT COUNT(*)::int AS count FROM "${table}"`);
      counts.push({ table, rows: Number(c.rows[0]?.count ?? 0) });
    }

    console.table(counts);

    const nonMigration = counts.filter((r) => r.table !== "_prisma_migrations");
    const totalRows = nonMigration.reduce((sum, r) => sum + r.rows, 0);
    if (totalRows === 0) {
      console.log("✅ DB is empty (excluding _prisma_migrations).");
    } else {
      console.log(`ℹ️ DB has data: ${totalRows} rows across ${nonMigration.length} app tables.`);
      const nonZero = nonMigration.filter((r) => r.rows > 0);
      if (nonZero.length) {
        console.log("Non-empty tables:");
        for (const row of nonZero) {
          console.log(`- ${row.table}: ${row.rows}`);
        }
      }
    }
  } finally {
    await pool.end();
  }
}

run().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
