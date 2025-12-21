/**
 * Supabase Admin Client Configuration
 * 
 * ⚠️ REMOVED: Supabase has been completely removed from this project.
 * 
 * This file is kept for backward compatibility but will throw errors if used.
 * All API routes now use PostgreSQL directly via postgresClient (src/lib/postgresClient.ts).
 * 
 * Migration:
 * - Database: PostgreSQL (direct connection)
 * - Authentication: Custom JWT (src/lib/auth.ts)
 * - Storage: Vercel Blob (src/lib/vercelBlob.ts)
 * 
 * Use postgresClient.query() for database operations instead.
 */

// Supabase has been removed - this export will cause errors if used
export const supabaseAdmin = {
  from: () => {
    throw new Error(
      "Supabase has been removed. Please use postgresClient.query() for database operations. " +
      "See src/lib/postgresClient.ts for examples."
    );
  },
} as any;
