/**
 * Manage User Script
 * 
 * This script helps you manually verify email, set password, or set display name.
 * Useful for testing or fixing users migrated from Supabase
 * 
 * Usage: 
 *   npm run db:manage-user -- --email your@email.com --verify
 *   npm run db:manage-user -- --email your@email.com --set-password "newpassword"
 *   npm run db:manage-user -- --email test@user.com --display-name "Guest User"
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
}

async function manageUser() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  let email: string | null = null;
  let verify = false;
  let setPassword: string | null = null;
  let displayName: string | null = null;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--email" && args[i + 1]) {
      email = args[i + 1];
      i++;
    } else if (args[i] === "--verify") {
      verify = true;
    } else if (args[i] === "--set-password" && args[i + 1]) {
      setPassword = args[i + 1];
      i++;
    } else if (args[i] === "--display-name" && args[i + 1]) {
      displayName = args[i + 1];
      i++;
    }
  }

  if (!email) {
    console.error("❌ Error: --email is required");
    console.log("\nUsage:");
    console.log("  npm run db:manage-user -- --email your@email.com --verify");
    console.log("  npm run db:manage-user -- --email your@email.com --set-password \"newpassword\"");
    console.log("  npm run db:manage-user -- --email test@user.com --display-name \"Guest User\"");
    process.exit(1);
  }

  try {
    // Import modules after environment variables are loaded
    const postgresClient = await import("../src/lib/postgresClient");
    const auth = await import("../src/lib/auth");
    const { query } = postgresClient;
    const { hashPassword } = auth;
    
    // Check if user exists
    const userResult = await query(
      `SELECT id, email, email_verified, password_hash, display_name FROM users WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      console.error(`❌ User with email ${email} not found in database.`);
      console.log("\n💡 To create a user:");
      console.log("   1. Go to /register page");
      console.log("   2. Register with your email and password");
      process.exit(1);
    }

    const user: User = userResult.rows[0];
    console.log(`\n👤 Found user: ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Display Name: ${user.display_name || "(not set)"}`);
    console.log(`   Email Verified: ${user.email_verified ? "✅ Yes" : "❌ No"}`);
    console.log(`   Has Password: ${user.password_hash ? "✅ Yes" : "❌ No"}`);

    // Verify email
    if (verify && !user.email_verified) {
      await query(
        `UPDATE users SET email_verified = true, email_verification_token = NULL WHERE id = $1`,
        [user.id]
      );
      console.log("\n✅ Email verified successfully!");
    } else if (verify && user.email_verified) {
      console.log("\n⚠️  Email is already verified.");
    }

    // Set password
    if (setPassword) {
      if (setPassword.length < 8) {
        console.error("\n❌ Error: Password must be at least 8 characters long");
        process.exit(1);
      }
      
      const passwordHash = await hashPassword(setPassword);
      await query(
        `UPDATE users SET password_hash = $1 WHERE id = $2`,
        [passwordHash, user.id]
      );
      console.log("\n✅ Password set successfully!");
    }

    // Set display name
    if (displayName !== null) {
      await query(
        `UPDATE users SET display_name = $1 WHERE id = $2`,
        [displayName, user.id]
      );
      console.log(`\n✅ Display name set to "${displayName}"`);
    }

    // Show final status
    const finalResult = await query(
      `SELECT id, email, email_verified, password_hash, display_name FROM users WHERE id = $1`,
      [user.id]
    );
    const finalUser: User = finalResult.rows[0];
    
    console.log("\n📊 Final Status:");
    console.log(`   Display Name: ${finalUser.display_name || "(not set)"}`);
    console.log(`   Email Verified: ${finalUser.email_verified ? "✅ Yes" : "❌ No"}`);
    console.log(`   Has Password: ${finalUser.password_hash ? "✅ Yes" : "❌ No"}`);
    
    if (finalUser.email_verified && finalUser.password_hash) {
      console.log("\n✅ User can now login!");
      console.log(`   Email: ${finalUser.email}`);
      console.log(`   Go to /login page to test`);
    } else {
      console.log("\n⚠️  User cannot login yet:");
      if (!finalUser.email_verified) {
        console.log("   - Email not verified (use --verify flag)");
      }
      if (!finalUser.password_hash) {
        console.log("   - No password set (use --set-password flag)");
      }
    }

  } catch (error) {
    console.error("❌ Error managing user:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the script
manageUser();

