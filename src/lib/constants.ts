/**
 * Application Constants
 * 
 * Centralized constants for better maintainability and consistency.
 */

// API Rate Limiting Constants
export const RATE_LIMITS = {
  LOGIN: { maxRequests: 10, windowMs: 60 * 1000 },          // 10 attempts per minute — blocks bots, never frustrates humans
  REGISTER: { maxRequests: 5, windowMs: 60 * 1000 },        // 5 per minute
  PASSWORD_RESET: { maxRequests: 5, windowMs: 60 * 1000 },  // 5 per minute
  API_GENERAL: { maxRequests: 100, windowMs: 60 * 1000 },   // 100 per minute
} as const;

// Pagination Constants
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 1000,
  MAX_SEARCH_LIMIT: 50,
  DEFAULT_OFFSET: 0,
  /**
   * Max **owned** appointments per calendar load (GET /api/appointments?limit=… + SSR prefetch).
   * Does not cap shared/invited rows — those load separately via batch `ids=` fetch.
   * Demo seed data is small — 100 is enough; raise (e.g. 500) for production heavy calendars.
   */
  CALENDAR_APPOINTMENTS_LIMIT: 100,
  /** Max IDs per batch assignee calendar fetch (GET /api/appointments?ids=…). */
  CALENDAR_ASSIGNED_BATCH_LIMIT: 100,
} as const;

// Validation Constants
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 128,
  MIN_SEARCH_QUERY_LENGTH: 2,
  MAX_SEARCH_QUERY_LENGTH: 100,
  MAX_TITLE_LENGTH: 200,
  MAX_EMAIL_LENGTH: 255,
  FILE_UPLOAD_MAX_SIZE_MB: 1, // Maximum file upload size in MB
  NOTES_MAX_LENGTH: 1000, // Maximum length for notes/description fields
} as const;

// Session Constants
export const SESSION = {
  COOKIE_NAME: "auth-token",
  MAX_AGE_SECONDS: 60 * 60 * 24 * 7, // 7 days
} as const;

// Database Query Timeouts
export const DB_TIMEOUTS = {
  CONNECTION_TIMEOUT_MS: 5000, // 5 seconds
  STATEMENT_TIMEOUT_MS: 30000, // 30 seconds
  SLOW_QUERY_THRESHOLD_MS: 1000, // Log queries slower than 1 second
} as const;

// Vercel Blob Configuration
export const VERCEL_BLOB_CONFIG = {
  DEFAULT_FOLDER: "multiview-calendar-appointment",
} as const;

