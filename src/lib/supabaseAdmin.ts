/**
 * Supabase Admin Client Configuration
 * 
 * ⚠️ REMOVED: Supabase has been completely removed from this project.
 * 
 * This file is kept for backward compatibility but will throw errors if used.
 * All API routes use PostgreSQL via Prisma (src/lib/prisma.ts).
 * 
 * Migration:
 * - Database: Prisma + PostgreSQL
 * - Authentication: Custom JWT (src/lib/auth.ts)
 * - Storage: Vercel Blob (src/lib/vercelBlob.ts)
 * 
 * Use prisma from src/lib/prisma.ts for database operations.
 */

// Supabase has been removed - this export will cause errors if used
export const supabaseAdmin = {
  from: () => {
    throw new Error(
      "Supabase has been removed. Please use Prisma (src/lib/prisma.ts) for database operations."
    );
  },
} as any;
