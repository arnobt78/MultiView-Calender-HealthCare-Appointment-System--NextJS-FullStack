/**
 * Register API Route
 * 
 * Handles user registration and email verification.
 * Replaces Supabase Auth registration functionality.
 */

import { NextRequest, NextResponse } from "next/server";
import { hashPassword, generateToken, getUserByEmail, createUser, generateVerificationToken } from "@/lib/auth";
import { sendInvitationEmail } from "@/lib/email";
import { isValidEmail, validatePassword } from "@/lib/validation";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";
import { RATE_LIMITS } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    // Rate limiting: prevent spam registrations
    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(
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

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      );
    }

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
    const user = await createUser(email, passwordHash, verificationToken);

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

