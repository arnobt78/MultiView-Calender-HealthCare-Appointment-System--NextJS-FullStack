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
      return;
    }


    users.forEach((user, index) => {
      
      // Login status
      if (!user.email_verified) {
      } else if (!user.password_hash) {
      } else {
      }
    });


    // Explicit check for dropdown test user
    const TEST_EMAIL = "test@user.com";
    const testUser = users.find((u) => u.email === TEST_EMAIL);
    if (testUser) {
    } else {
    }



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

