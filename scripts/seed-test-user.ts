/**
 * Create the dropdown test user (test@user.com / 12345678) if it doesn't exist.
 * Safe to run multiple times.
 *
 * Usage: npm run db:seed-test-user
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

async function seedTestUser() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL not found in .env.local");
    process.exit(1);
  }

  const TEST_EMAIL = "test@user.com";
  const TEST_PASSWORD = "12345678";

  const { query } = await import("../src/lib/postgresClient");
  const { hashPassword, getUserByEmail } = await import("../src/lib/auth");

  const existing = await getUserByEmail(TEST_EMAIL);
  if (existing) {
    console.log(`✅ Test user ${TEST_EMAIL} already exists. No change.`);
    return;
  }

  const passwordHash = await hashPassword(TEST_PASSWORD);
  await query(
    `INSERT INTO users (id, email, password_hash, email_verified, created_at)
     VALUES (gen_random_uuid(), $1, $2, true, NOW())`,
    [TEST_EMAIL, passwordHash]
  );
  console.log(`✅ Test user created: ${TEST_EMAIL} / ${TEST_PASSWORD}`);
}

seedTestUser().catch((err) => {
  console.error(err);
  process.exit(1);
});
