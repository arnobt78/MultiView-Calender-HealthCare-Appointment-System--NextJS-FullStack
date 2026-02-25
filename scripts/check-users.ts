/**
 * Check Users in Database
 * 
 * This script queries the PostgreSQL database to show all users
 * and their current status (email verified, has password, etc.)
 * 
 * Usage: npm run db:check-users
 * or: npx tsx scripts/check-users.ts
 */

import dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables FIRST
const envPath = resolve(process.cwd(), ".env.local");
dotenv.config({ path: envPath });

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error("❌ Error: DATABASE_URL not found in .env.local");
  console.log(`   Checked: ${envPath}`);
  process.exit(1);
}

interface User {
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
    // Import postgresClient after environment variables are loaded
    const { query } = await import("../src/lib/postgresClient");
    
    console.log("🔍 Checking users in database...\n");

    // Query all users
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

    const users: User[] = result.rows;

    if (users.length === 0) {
      console.log("❌ No users found in the database.");
      console.log("\n💡 To create a user:");
      console.log("   1. Go to /register page");
      console.log("   2. Register with your email and password");
      console.log("   3. Verify your email");
      return;
    }

    console.log(`✅ Found ${users.length} user(s):\n`);
    console.log("=" .repeat(100));

    users.forEach((user, index) => {
      console.log(`\n👤 User #${index + 1}:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Display Name: ${user.display_name || "N/A"}`);
      console.log(`   Role: ${user.role || "N/A"}`);
      console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
      console.log(`   Email Verified: ${user.email_verified ? "✅ Yes" : "❌ No"}`);
      console.log(`   Has Password: ${user.password_hash ? "✅ Yes" : "❌ No"}`);
      
      // Login status
      if (!user.email_verified) {
        console.log(`   ⚠️  Cannot login: Email not verified`);
      } else if (!user.password_hash) {
        console.log(`   ⚠️  Cannot login: No password set (use password reset)`);
      } else {
        console.log(`   ✅ Can login: Email verified and password set`);
      }
    });

    console.log("\n" + "=".repeat(100));
    console.log("\n📝 Summary:");
    console.log(`   Total users: ${users.length}`);
    console.log(`   Verified users: ${users.filter(u => u.email_verified).length}`);
    console.log(`   Users with password: ${users.filter(u => u.password_hash).length}`);
    console.log(`   Users who can login: ${users.filter(u => u.email_verified && u.password_hash).length}`);

    // Explicit check for dropdown test user
    const TEST_EMAIL = "test@user.com";
    const testUser = users.find((u) => u.email === TEST_EMAIL);
    if (testUser) {
      console.log(`\n🧪 Test account "${TEST_EMAIL}": ✅ EXISTS (can use dropdown on login)`);
    } else {
      console.log(`\n🧪 Test account "${TEST_EMAIL}": ❌ NOT FOUND`);
      console.log(`   Create it with: npm run db:seed-test-user`);
    }

    console.log("\n💡 To login:");
    console.log("   1. Make sure your email is verified");
    console.log("   2. Make sure you have a password set");
    console.log("   3. Go to /login page");
    console.log("   4. Use your email and password");

    console.log("\n💡 If you need to verify an email or set a password:");
    console.log("   - For email verification: Check your inbox for verification link");
    console.log("   - For password: Use password reset feature (if implemented)");
    console.log("   - Or manually update in database (not recommended)");

  } catch (error) {
    console.error("❌ Error checking users:", error);
    process.exit(1);
  } finally {
    // Close database connection
    process.exit(0);
  }
}

// Run the script
checkUsers();

