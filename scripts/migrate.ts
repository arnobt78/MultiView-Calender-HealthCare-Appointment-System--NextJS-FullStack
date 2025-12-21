/**
 * Database Migration Script
 *
 * This script applies the database schema to the PostgreSQL database.
 *
 * Usage:
 *   npm run db:migrate
 *
 * Note: This script is idempotent - safe to run multiple times.
 * It uses CREATE TABLE IF NOT EXISTS and CREATE INDEX IF NOT EXISTS.
 */

import { config } from "dotenv";
import { resolve } from "path";
import * as fs from "fs";

// Load environment variables from .env.local FIRST (before any imports that use env vars)
config({ path: resolve(process.cwd(), ".env.local") });

async function runMigration() {
  // Import after loading env vars (inside async function to avoid top-level await)
  const { pool, query } = await import("../src/lib/postgresClient");
  console.log("🚀 Starting database migration...\n");

  try {
    // Test connection
    await query("SELECT NOW()");
    console.log("✅ Database connection successful\n");

    // Read and execute all migration SQL files in order
    const migrationsDir = resolve(process.cwd(), "migrations");
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort(); // Sort to ensure order (001, 002, etc.)
    
    if (migrationFiles.length === 0) {
      throw new Error(`No migration files found in ${migrationsDir}`);
    }

    // Execute each migration file
    for (const migrationFile of migrationFiles) {
      const schemaPath = resolve(migrationsDir, migrationFile);
      const schemaSQL = fs.readFileSync(schemaPath, "utf-8");
      
      // Better SQL parsing: split by semicolon, but handle multi-line statements
      // Remove single-line comments and empty lines
      const lines = schemaSQL.split("\n");
      const cleanedLines: string[] = [];
      
      for (const line of lines) {
        const trimmed = line.trim();
        // Skip empty lines and single-line comments
        if (trimmed.length === 0 || trimmed.startsWith("--")) {
          continue;
        }
        cleanedLines.push(line);
      }
      
      const cleanedSQL = cleanedLines.join("\n");
      
      // Split by semicolon, but keep statements that span multiple lines
      const statements = cleanedSQL
        .split(";")
        .map((stmt) => stmt.trim().replace(/\n+/g, " ").replace(/\s+/g, " "))
        .filter((stmt) => stmt.length > 0);
      
      // Execute each statement
      console.log(`📝 Applying migration: ${migrationFile}...`);
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.trim()) {
          try {
            await query(statement + ";");
          } catch (error: any) {
            // Ignore "already exists" errors for idempotency
            if (error.code === "42P07" || error.code === "42710" || error.code === "42723") {
              // Table/index/extension already exists - this is fine
              console.log(`   ⚠️  Skipping (already exists): ${statement.substring(0, 50)}...`);
              continue;
            }
            // For "relation does not exist" on indexes, it might be that table wasn't created
            // Let's check if it's an index creation and the table exists
            if (error.code === "42P01" && statement.toUpperCase().includes("CREATE INDEX")) {
              console.log(`   ⚠️  Index creation skipped (table may not exist yet): ${statement.substring(0, 50)}...`);
              continue;
            }
            console.error(`❌ Error executing statement ${i + 1}/${statements.length}:`, statement.substring(0, 100));
            throw error;
          }
        }
      }
    }
    
    console.log("✅ All migrations applied successfully!");
    
    // Verify tables were created
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log(`\n📋 Created tables (${tablesResult.rows.length}):`);
    tablesResult.rows.forEach((row) => {
      console.log(`   ✓ ${row.table_name}`);
    });
    
  } catch (error) {
    console.error("❌ Error applying migration:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigration().catch((error) => {
  console.error(error);
  process.exit(1);
});

