import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

function quoteIdent(identifier: string): string {
  return `"${identifier.replace(/"/g, "\"\"")}"`;
}

async function runClear() {
  if (process.env.CONFIRM_DB_CLEAR !== "YES") {
    throw new Error(
      "Refusing to clear database. Re-run with CONFIRM_DB_CLEAR=YES."
    );
  }

  const { pool, query } = await import("../src/lib/postgresClient");

  try {
    await query("SELECT NOW()");

    const result = await query(
      `
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename <> '_prisma_migrations'
      ORDER BY tablename
      `
    );

    const tableNames = result.rows
      .map((row: { tablename?: string }) => row.tablename)
      .filter((name: string | undefined): name is string => Boolean(name));

    if (tableNames.length === 0) {
      return;
    }

    const tableList = tableNames.map(quoteIdent).join(", ");
    await query(`TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE;`);
  } finally {
    await pool.end();
  }
}

runClear().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
