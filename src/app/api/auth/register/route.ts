/**
 * Register API Route
 * 
 * Handles user registration and email verification.
 * Replaces Supabase Auth registration functionality.
 */

import { NextRequest, NextResponse } from "next/server";
import { hashPassword, generateToken, getUserByEmail, createUser, generateVerificationToken } from "@/lib/auth";
import { sendInvitationEmail } from "@/lib/email";
import { registerRequestSchema } from "@/lib/schemas/auth";
import { zodBadRequest } from "@/lib/schemas/parse";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { RATE_LIMITS } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    // Rate limiting: prevent spam registrations
    const clientIP = getClientIP(req);
    const rateLimit = await checkRateLimit(
      `register:${clientIP}`,
      RATE_LIMITS.REGISTER.maxRequests,
      RATE_LIMITS.REGISTER.windowMs
    );
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: "Too many registration attempts. Please try again later.",
          resetTime: rateLimit.resetTime 
        },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": RATE_LIMITS.REGISTER.maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimit.resetTime.toString(),
          }
        }
      );
    }

    const parsed = registerRequestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return zodBadRequest(parsed.error);
    }

    const { email, password, display_name } = parsed.data;

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate email verification token
    const verificationToken = generateVerificationToken();

    // Create user in database
    const user = await createUser(email, passwordHash, verificationToken, display_name || null, "admin");

    // Send verification email
    try {
      const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/auth/verify?token=${verificationToken}`;
      await sendInvitationEmail({
        to: email,
        subject: "Verify your email address",
        html: `Please click the following link to verify your email: <a href="${verificationUrl}">${verificationUrl}</a>`
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Continue even if email fails - user can request resend
    }

    // Return success (user needs to verify email before login)
    return NextResponse.json({
      message: "Registration successful. Please check your email to verify your account.",
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name ?? null,
      },
    }, {
      headers: {
        "X-RateLimit-Limit": RATE_LIMITS.REGISTER.maxRequests.toString(),
        "X-RateLimit-Remaining": rateLimit.remaining.toString(),
        "X-RateLimit-Reset": rateLimit.resetTime.toString(),
      }
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

