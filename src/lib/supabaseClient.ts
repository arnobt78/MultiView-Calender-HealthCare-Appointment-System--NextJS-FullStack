/**
 * Supabase Client Configuration
 * 
 * ⚠️ REMOVED: Supabase has been completely removed from this project.
 * 
 * This file is kept for backward compatibility but will throw errors if used.
 * All components should use API routes instead:
 * - /api/patients
 * - /api/categories
 * - /api/relatives
 * - /api/appointments
 * - /api/appointments/[id]
 * 
 * Database: PostgreSQL (direct connection via postgresClient)
 * Authentication: Custom JWT-based system (see src/lib/auth.ts)
 * Storage: Vercel Blob (see src/lib/vercelBlob.ts)
 */

// Supabase has been removed - this export will cause errors if used
// Components should migrate to API routes
export const supabase = {
  from: () => {
    throw new Error(
      "Supabase has been removed. Please use API routes instead. " +
      "See /api/patients, /api/categories, /api/appointments, etc."
    );
  },
} as any;
