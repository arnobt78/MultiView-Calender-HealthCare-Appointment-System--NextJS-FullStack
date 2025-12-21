/**
 * Session Management Utilities
 * 
 * This file provides utilities for managing user sessions using cookies.
 * Replaces Supabase's session management.
 */

import { cookies } from "next/headers";
import { verifyToken } from "./auth";

import { SESSION } from "./constants";

// Cookie names (imported from constants for consistency)
const SESSION_COOKIE_NAME = SESSION.COOKIE_NAME;
const SESSION_MAX_AGE = SESSION.MAX_AGE_SECONDS;

/**
 * Get current user from session cookie (server-side)
 * 
 * @returns User object or null if not authenticated
 */
export async function getSessionUser(): Promise<{ userId: string; email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  if (!token) {
    return null;
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    return null;
  }
  
  // Normalize the response format (userId instead of id for consistency)
  return {
    userId: decoded.userId,
    email: decoded.email,
  };
}

/**
 * Set session cookie with JWT token (server-side)
 * 
 * @param token - JWT token
 */
export async function setSession(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

/**
 * Clear session cookie (server-side)
 */
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Get current user from session (client-side)
 * 
 * @returns User object or null if not authenticated
 */
export function getClientSession(): { id: string; email: string } | null {
  if (typeof window === "undefined") return null;
  
  // Get token from cookie (client-side)
  const cookies = document.cookie.split("; ");
  const tokenCookie = cookies.find((cookie) => cookie.startsWith(`${SESSION_COOKIE_NAME}=`));
  
  if (!tokenCookie) {
    return null;
  }
  
  const token = tokenCookie.split("=")[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return null;
  }
  // Normalize to match expected return type (id instead of userId)
  return {
    id: decoded.userId,
    email: decoded.email,
  };
}

/**
 * Set session cookie (client-side)
 * 
 * @param token - JWT token
 */
export function setClientSession(token: string) {
  if (typeof window === "undefined") return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + SESSION_MAX_AGE * 1000);
  
  document.cookie = `${SESSION_COOKIE_NAME}=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}

/**
 * Clear session cookie (client-side)
 */
export function clearClientSession() {
  if (typeof window === "undefined") return;
  
  document.cookie = `${SESSION_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

