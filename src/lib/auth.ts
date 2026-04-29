/**
 * Custom Authentication Utilities (Prisma)
 * User lookup, create, update — all server-side via Prisma.
 */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";

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
const JWT_EXPIRES_IN = "7d";
const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { userId: string; email: string };
    if (!decoded.userId || !decoded.email) return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function getUserByEmail(email: string) {
  const user = await prisma.user.findFirst({
    where: { email },
    select: {
      id: true,
      email: true,
      password_hash: true,
      email_verified: true,
      display_name: true,
      role: true,
      image: true,
      created_at: true,
    },
  });
  if (!user) return null;
  return {
    ...user,
    created_at: user.created_at?.toISOString?.(),
  };
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      email_verified: true,
      display_name: true,
      role: true,
      image: true,
      created_at: true,
    },
  });
  if (!user) return null;
  return {
    ...user,
    created_at: user.created_at?.toISOString?.(),
  };
}

function newUserId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function createUser(
  email: string,
  passwordHash: string,
  emailVerificationToken: string,
  displayName?: string | null,
  role?: string | null
) {
  const user = await prisma.user.create({
    data: {
      id: newUserId(),
      email,
      password_hash: passwordHash,
      email_verified: false,
      email_verification_token: emailVerificationToken,
      display_name: displayName ?? null,
      role: role ?? null,
    },
    select: { id: true, email: true, email_verified: true, display_name: true, role: true, created_at: true },
  });
  return {
    ...user,
    created_at: user.created_at?.toISOString?.(),
  };
}

export async function updateEmailVerification(userId: string, verified: boolean) {
  await prisma.user.update({
    where: { id: userId },
    data: { email_verified: verified, email_verification_token: null },
  });
}

export function generateVerificationToken(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function setPasswordResetToken(userId: string, token: string) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);
  await prisma.user.update({
    where: { id: userId },
    data: { password_reset_token: token, password_reset_expires: expiresAt },
  });
}

export async function verifyPasswordResetToken(token: string) {
  const user = await prisma.user.findFirst({
    where: {
      password_reset_token: token,
      password_reset_expires: { gt: new Date() },
    },
    select: { id: true, email: true },
  });
  return user ?? null;
}

export async function updatePassword(userId: string, passwordHash: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      password_hash: passwordHash,
      password_reset_token: null,
      password_reset_expires: null,
    },
  });
}

export async function createUserFromGoogle(
  email: string,
  displayName: string | null,
  image: string | null
) {
  const user = await prisma.user.create({
    data: {
      id: newUserId(),
      email,
      email_verified: true,
      display_name: displayName ?? null,
      image: image ?? null,
    },
    select: { id: true, email: true, email_verified: true, display_name: true, role: true, image: true, created_at: true },
  });
  return {
    ...user,
    created_at: user.created_at?.toISOString?.(),
  };
}

export async function updateUserProfile(
  userId: string,
  data: { display_name?: string | null; image?: string | null }
) {
  const updateData: { display_name?: string | null; image?: string | null } = {};
  if (data.display_name !== undefined) updateData.display_name = data.display_name;
  if (data.image !== undefined) updateData.image = data.image;
  if (Object.keys(updateData).length === 0) return;
  await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });
}
