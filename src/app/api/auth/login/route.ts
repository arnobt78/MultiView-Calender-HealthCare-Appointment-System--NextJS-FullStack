/**
 * Login API Route
 * 
 * Handles user authentication and session creation.
 * Replaces Supabase Auth login functionality.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, generateToken, getUserByEmail } from "@/lib/auth";
import { setSession } from "@/lib/session";
import { loginRequestSchema } from "@/lib/schemas/auth";
import { zodBadRequest } from "@/lib/schemas/parse";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { RATE_LIMITS } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    // Rate limiting: prevent brute force attacks
    const clientIP = getClientIP(req);
    const rateLimit = await checkRateLimit(
      `login:${clientIP}`,
      RATE_LIMITS.LOGIN.maxRequests,
      RATE_LIMITS.LOGIN.windowMs
    );
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: "Too many login attempts. Please try again later.",
          resetTime: rateLimit.resetTime 
        },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": RATE_LIMITS.LOGIN.maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimit.resetTime.toString(),
          }
        }
      );
    }

    const parsed = loginRequestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return zodBadRequest(parsed.error);
    }

    const { email, password } = parsed.data;

    // Get user from database
    const user = await getUserByEmail(email);

    /*
     * Timing-safe authentication:
     * Always run bcrypt compare — even for missing users or no-password accounts —
     * so the response time is constant regardless of whether the email exists.
     * A dummy hash is used so bcrypt does real work and can't be short-circuited.
     * Ref: OWASP Authentication Cheat Sheet — prevent username enumeration via timing.
     */
    const DUMMY_HASH = "$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345";
    const hashToCompare = user?.password_hash ?? DUMMY_HASH;
    const isValidPassword = await verifyPassword(password, hashToCompare);

    // Unified error — same message and status for missing user, missing hash, bad password.
    if (!user || !user.password_hash || !isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check email verification
    if (!user.email_verified) {
      return NextResponse.json(
        { error: "Please verify your email address before logging in. Check your inbox for a confirmation link." },
        { status: 403 }
      );
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    // Set session cookie
    await setSession(token);

    // Return user data (without password)
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        role: user.role,
        image: user.image ?? null,
      },
    }, {
      headers: {
        "X-RateLimit-Limit": RATE_LIMITS.LOGIN.maxRequests.toString(),
        "X-RateLimit-Remaining": rateLimit.remaining.toString(),
        "X-RateLimit-Reset": rateLimit.resetTime.toString(),
      }
    });
  } catch (error: unknown) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

