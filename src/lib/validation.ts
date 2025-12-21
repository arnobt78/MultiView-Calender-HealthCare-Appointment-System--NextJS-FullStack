/**
 * Input Validation Utilities
 * 
 * This file provides reusable validation functions for API routes.
 * Helps prevent invalid data and security issues.
 */

import { VALIDATION } from "./constants";

/**
 * Validate email format
 * 
 * @param email - Email string to validate
 * @returns True if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * 
 * @param password - Password string to validate
 * @returns Object with isValid flag and error message if invalid
 */
export function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
    return { 
      isValid: false, 
      error: `Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters long` 
    };
  }
  if (password.length > VALIDATION.MAX_PASSWORD_LENGTH) {
    return { 
      isValid: false, 
      error: `Password must be less than ${VALIDATION.MAX_PASSWORD_LENGTH} characters` 
    };
  }
  return { isValid: true };
}

/**
 * Validate UUID format
 * 
 * @param uuid - UUID string to validate
 * @returns True if UUID is valid
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Sanitize string input (basic XSS prevention)
 * 
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}

/**
 * Validate date string
 * 
 * @param dateString - Date string to validate
 * @returns True if date is valid
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Validate appointment status
 * 
 * @param status - Status string to validate
 * @returns True if status is valid
 */
export function isValidAppointmentStatus(status: string): boolean {
  return ["done", "pending", "alert"].includes(status);
}

/**
 * Validate permission level
 * 
 * @param permission - Permission string to validate
 * @returns True if permission is valid
 */
export function isValidPermission(permission: string): boolean {
  return ["read", "write", "full"].includes(permission);
}

