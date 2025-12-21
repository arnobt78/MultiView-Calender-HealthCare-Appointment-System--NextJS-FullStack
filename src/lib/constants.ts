/**
 * Application Constants
 * 
 * Centralized constants for better maintainability and consistency.
 */

// API Rate Limiting Constants
export const RATE_LIMITS = {
  LOGIN: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  REGISTER: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  PASSWORD_RESET: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  API_GENERAL: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
} as const;

// Pagination Constants
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 1000,
  MAX_SEARCH_LIMIT: 50,
  DEFAULT_OFFSET: 0,
} as const;

// Validation Constants
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 128,
  MIN_SEARCH_QUERY_LENGTH: 2,
  MAX_SEARCH_QUERY_LENGTH: 100,
  MAX_TITLE_LENGTH: 200,
  MAX_EMAIL_LENGTH: 255,
  FILE_UPLOAD_MAX_SIZE_MB: 10, // Maximum file upload size in MB
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

