/**
 * Relative by ID: GET, PATCH, DELETE (Prisma)
 * All operations require staff role (admin/doctor/secretary).
 * Relatives have no direct user_id FK so row-level ownership is not possible —
 * restrict to staff until the schema is extended with tenancy.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";
import { serializeRelative } from "@/lib/serializers";
import { isStaffRole, getUserRole } from "@/lib/rbac";

type RouteContext = { params: Promise<{ id: string }> };

/** Shared staff-role guard — resolves role once and reuses it. */
async function requireStaff(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return isStaffRole(role);
}

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!(await requireStaff(sessionUser.userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid relative ID" }, { status: 400 });
    }

    const relative = await prisma.relative.findUnique({ where: { id } });
    if (!relative) {
      return NextResponse.json({ error: "Relative not found" }, { status: 404 });
    }
    return NextResponse.json({ relative: serializeRelative(relative) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!(await requireStaff(sessionUser.userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid relative ID" }, { status: 400 });
    }

    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (typeof body.firstname === "string" && body.firstname.trim()) data.firstname = body.firstname.trim();
    if (typeof body.lastname === "string" && body.lastname.trim()) data.lastname = body.lastname.trim();
    if ("pronoun" in body) data.pronoun = body.pronoun ?? null;
    if ("notes" in body) data.notes = body.notes ?? null;

    const relative = await prisma.relative.update({ where: { id }, data });
    return NextResponse.json({ relative: serializeRelative(relative) });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return NextResponse.json({ error: "Relative not found" }, { status: 404 });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!(await requireStaff(sessionUser.userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid relative ID" }, { status: 400 });
    }

    await prisma.relative.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return NextResponse.json({ error: "Relative not found" }, { status: 404 });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
