/**
 * List users in the database; highlight demo accounts.
 *
 * Usage: npm run db:check-users
 */

import dotenv from "dotenv";
import { resolve } from "path";
import { DEMO_ACCOUNTS } from "../src/lib/demo-credentials";

const envPath = resolve(process.cwd(), ".env.local");
dotenv.config({ path: envPath });

if (!process.env.DATABASE_URL) {
  console.error("❌ Error: DATABASE_URL not found in .env.local");
  process.exit(1);
}

interface UserRow {
  id: string;
  email: string;
  email_verified: boolean;
  password_hash: string | null;
  display_name: string | null;
  role: string | null;
  created_at: string;
}

async function checkUsers() {
  try {
    const { query } = await import("../src/lib/postgresClient");

    const result = await query(
      `SELECT 
        id, 
        email, 
        email_verified, 
        password_hash, 
        display_name, 
        role, 
        created_at 
      FROM users 
      ORDER BY created_at DESC`
    );

    const users: UserRow[] = result.rows;

    if (users.length === 0) {
      console.log("No users in database.");
      return;
    }

    console.log(`Users (${users.length}):\n`);
    console.table(
      users.map((u) => ({
        email: u.email,
        role: u.role ?? "",
        verified: u.email_verified,
        has_password: Boolean(u.password_hash),
      }))
    );

    console.log("\nDemo accounts check:");
    for (const demo of DEMO_ACCOUNTS) {
      const row = users.find((u) => u.email === demo.email);
      if (row) {
        console.log(`  ✓ ${demo.email} (${demo.role})`);
      } else {
        console.log(`  ✗ missing ${demo.email} — run npm run db:seed-test-user`);
      }
    }
  } catch (error) {
    console.error("❌ Error checking users:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

checkUsers();
