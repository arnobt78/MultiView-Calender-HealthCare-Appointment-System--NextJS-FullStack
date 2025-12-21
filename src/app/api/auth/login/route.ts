/**
 * Login API Route
 * 
 * Handles user authentication and session creation.
 * Replaces Supabase Auth login functionality.
 */

import { NextRequest, NextResponse } from "next/server";
import { hashPassword, verifyPassword, generateToken, getUserByEmail } from "@/lib/auth";
import { setSession } from "@/lib/session";
import { isValidEmail, validatePassword } from "@/lib/validation";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";
import { RATE_LIMITS } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    // Rate limiting: prevent brute force attacks
    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(
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

    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if user has password (for users migrated from Supabase)
    if (!user.password_hash) {
      return NextResponse.json(
        { error: "Please set a password first. Use password reset." },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);

    if (!isValidPassword) {
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
      },
    }, {
      headers: {
        "X-RateLimit-Limit": RATE_LIMITS.LOGIN.maxRequests.toString(),
        "X-RateLimit-Remaining": rateLimit.remaining.toString(),
        "X-RateLimit-Reset": rateLimit.resetTime.toString(),
      }
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

