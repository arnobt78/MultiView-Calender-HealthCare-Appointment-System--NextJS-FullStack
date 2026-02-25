/**
 * Email Verification API Route (Prisma)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateEmailVerification } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(new URL("/login?error=invalid_token", req.url));
    }

    const user = await prisma.user.findFirst({
      where: { email_verification_token: token },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.redirect(new URL("/login?error=invalid_token", req.url));
    }

    await updateEmailVerification(user.id, true);
    return NextResponse.redirect(new URL("/login?verified=1", req.url));
  } catch (error: unknown) {
    console.error("Verification error:", error);
    return NextResponse.redirect(new URL("/login?error=verification_failed", req.url));
  }
}
