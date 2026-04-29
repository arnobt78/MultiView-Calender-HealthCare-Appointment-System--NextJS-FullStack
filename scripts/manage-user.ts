/**
 * Manage User Script
 * 
 * This script helps you manually verify email, set password, or set display name.
 * Useful for testing or fixing users migrated from Supabase
 * 
 * Usage: 
 *   npm run db:manage-user -- --email your@email.com --verify
 *   npm run db:manage-user -- --email your@email.com --set-password "newpassword"
 *   npm run db:manage-user -- --email test@admin.com --display-name "Guest User Admin"
 */

import dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables FIRST
const envPath = resolve(process.cwd(), ".env.local");
dotenv.config({ path: envPath });

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error("❌ Error: DATABASE_URL not found in .env.local");
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
      process.exit(1);
    }

    const user: User = userResult.rows[0];

    // Verify email
    if (verify && !user.email_verified) {
      await query(
        `UPDATE users SET email_verified = true, email_verification_token = NULL WHERE id = $1`,
        [user.id]
      );
    } else if (verify && user.email_verified) {
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
    }

    // Set display name
    if (displayName !== null) {
      await query(
        `UPDATE users SET display_name = $1 WHERE id = $2`,
        [displayName, user.id]
      );
    }

    // Show final status
    const finalResult = await query(
      `SELECT id, email, email_verified, password_hash, display_name FROM users WHERE id = $1`,
      [user.id]
    );
    const finalUser: User = finalResult.rows[0];
    
    
    if (finalUser.email_verified && finalUser.password_hash) {
    } else {
      if (!finalUser.email_verified) {
      }
      if (!finalUser.password_hash) {
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

