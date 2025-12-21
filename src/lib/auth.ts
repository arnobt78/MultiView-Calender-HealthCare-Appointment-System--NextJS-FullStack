/**
 * Custom Authentication Utilities
 * 
 * This file provides utilities for custom authentication, replacing Supabase Auth.
 * 
 * Features:
 * - Password hashing and verification
 * - JWT token generation and verification
 * - Session management
 * - Email verification token generation
 * - Password reset token generation
 */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "./postgresClient";

// JWT secret from environment (should be a strong random string)
// IMPORTANT: Never hardcode secrets! Always use environment variables.
function getJwtSecret(): string {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET or NEXTAUTH_SECRET environment variable is required. " +
      "Please set it in your .env.local file. Generate with: openssl rand -base64 32"
    );
  }
  return secret;
}
const JWT_EXPIRES_IN = "7d"; // Token expires in 7 days

// Password hashing salt rounds
const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 * 
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 * 
 * @param password - Plain text password
 * @param hash - Hashed password from database
 * @returns True if password matches
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token for a user
 * 
 * @param userId - User ID
 * @param email - User email
 * @returns JWT token string
 */
export function generateToken(userId: string, email: string): string {
  return jwt.sign(
    { userId, email },
    getJwtSecret(),
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verify and decode a JWT token
 * 
 * @param token - JWT token string
 * @returns Decoded token payload or null if invalid
 */
export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { userId: string; email: string };
    // Ensure both fields are present for security
    if (!decoded.userId || !decoded.email) {
      return null;
    }
    return decoded;
  } catch (error) {
    // Token expired, invalid, or malformed
    return null;
  }
}

/**
 * Get user from database by email
 * 
 * @param email - User email
 * @returns User object or null
 */
export async function getUserByEmail(email: string) {
  const result = await query(
    'SELECT id, email, password_hash, email_verified, display_name, role, created_at FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

/**
 * Get user from database by ID
 * 
 * @param userId - User ID
 * @returns User object or null
 */
export async function getUserById(userId: string) {
  const result = await query(
    'SELECT id, email, email_verified, display_name, role, created_at FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0] || null;
}

/**
 * Create a new user in the database
 * 
 * @param email - User email
 * @param passwordHash - Hashed password
 * @param emailVerificationToken - Email verification token
 * @returns Created user object
 */
export async function createUser(
  email: string,
  passwordHash: string,
  emailVerificationToken: string
) {
  const result = await query(
    `INSERT INTO users (id, email, password_hash, email_verified, email_verification_token, created_at)
     VALUES (gen_random_uuid(), $1, $2, false, $3, NOW())
     RETURNING id, email, email_verified, display_name, role, created_at`,
    [email, passwordHash, emailVerificationToken]
  );
  return result.rows[0];
}

/**
 * Update user's email verification status
 * 
 * @param userId - User ID
 * @param verified - Verification status
 */
export async function updateEmailVerification(userId: string, verified: boolean) {
  await query(
    'UPDATE users SET email_verified = $1, email_verification_token = NULL WHERE id = $2',
    [verified, userId]
  );
}

/**
 * Generate a random UUID for email verification or password reset
 * 
 * Uses crypto.randomUUID() if available (Node 14.17+), otherwise falls back to manual generation.
 * 
 * @returns UUID string
 */
export function generateVerificationToken(): string {
  // Use crypto.randomUUID() if available (more secure and faster)
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for older Node versions
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Set password reset token for a user
 * 
 * @param userId - User ID
 * @param token - Reset token
 */
export async function setPasswordResetToken(userId: string, token: string) {
  // Token expires in 1 hour
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);
  
  await query(
    'UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3',
    [token, expiresAt, userId]
  );
}

/**
 * Verify password reset token and get user
 * 
 * @param token - Reset token
 * @returns User object or null if invalid/expired
 */
export async function verifyPasswordResetToken(token: string) {
  const result = await query(
    `SELECT id, email FROM users 
     WHERE password_reset_token = $1 
     AND password_reset_expires > NOW()`,
    [token]
  );
  return result.rows[0] || null;
}

/**
 * Update user password
 * 
 * @param userId - User ID
 * @param passwordHash - New hashed password
 */
export async function updatePassword(userId: string, passwordHash: string) {
  await query(
    'UPDATE users SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL WHERE id = $2',
    [passwordHash, userId]
  );
}

