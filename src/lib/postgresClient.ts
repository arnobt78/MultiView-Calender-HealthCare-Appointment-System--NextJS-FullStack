/**
 * PostgreSQL Client Configuration
 * 
 * This file creates and exports a PostgreSQL client for direct database operations.
 * This replaces Supabase's PostgREST API with direct PostgreSQL connections.
 * 
 * ⚠️ IMPORTANT:
 * - This is for server-side operations only (API routes, server components)
 * - Use this instead of supabaseAdmin for database operations
 * - Authentication is handled by custom JWT-based auth system (see src/lib/auth.ts)
 * 
 * Connection String Format:
 * - Local/Vercel: postgresql://user:password@host:port/database
 * - Coolify Internal: postgresql://user:password@container-name:5432/database
 */

import { Pool } from "pg";
import { DB_TIMEOUTS } from "./constants";

// Get database connection string from environment variables
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is missing. Please set it in your .env.local file."
  );
}

/**
 * PostgreSQL Connection Pool
 * 
 * Pool manages multiple database connections efficiently.
 * Reuses connections instead of creating new ones for each query.
 * 
 * Configuration:
 * - max: Maximum number of clients in the pool (default: 10)
 * - idleTimeoutMillis: Close idle clients after this time (default: 10000)
 * - connectionTimeoutMillis: Return error if connection not established in time
 */

export const pool = new Pool({
  connectionString: databaseUrl,
  // Connection pool settings - optimized for scalability
  max: 20, // Maximum number of clients in the pool (adjust based on server capacity)
  min: 2, // Minimum number of clients to keep in pool (faster initial connections)
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: DB_TIMEOUTS.CONNECTION_TIMEOUT_MS,
  // Statement timeout - prevent long-running queries from blocking
  statement_timeout: DB_TIMEOUTS.STATEMENT_TIMEOUT_MS,
});

// Handle pool errors
pool.on("error", (err: Error) => {
  console.error("Unexpected error on idle PostgreSQL client", err);
  // Don't exit in production - let the app continue and log the error
  if (process.env.NODE_ENV === "development") {
    process.exit(-1);
  }
});

/**
 * Execute a SQL query with performance logging
 * 
 * Helper function for executing queries with proper error handling and performance monitoring.
 * Uses parameterized queries to prevent SQL injection attacks.
 * 
 * @param text - SQL query string (use parameterized queries to prevent SQL injection)
 * @param params - Query parameters array
 * @returns Query result
 * 
 * Example:
 * const result = await query('SELECT * FROM appointments WHERE id = $1', [appointmentId]);
 */
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries for optimization
    if (duration > DB_TIMEOUTS.SLOW_QUERY_THRESHOLD_MS) {
      console.warn("Slow query detected", { 
        text: text.substring(0, 100), 
        duration, 
        rows: res.rowCount 
      });
    } else {
      // Only log in development to reduce noise in production
      if (process.env.NODE_ENV === "development") {
        console.log("Executed query", { 
          text: text.substring(0, 100), 
          duration, 
          rows: res.rowCount 
        });
      }
    }
    
    return res;
  } catch (error) {
    console.error("Database query error", { 
      text: text.substring(0, 100), 
      error: error instanceof Error ? error.message : String(error) 
    });
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 * 
 * Use this when you need to execute multiple queries in a transaction.
 * 
 * Example:
 * const client = await getClient();
 * try {
 *   await client.query('BEGIN');
 *   await client.query('INSERT INTO ...');
 *   await client.query('COMMIT');
 * } catch (error) {
 *   await client.query('ROLLBACK');
 *   throw error;
 * } finally {
 *   client.release();
 * }
 */
export async function getClient() {
  const client = await pool.connect();
  return client;
}

