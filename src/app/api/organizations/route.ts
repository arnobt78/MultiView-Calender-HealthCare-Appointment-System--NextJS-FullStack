/**
 * Organizations API
 * 
 * GET: list user's organizations
 * POST: create organization
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getUserRole, isPatientRole } from "@/lib/rbac";

/** Per-request API handler (see api-route-dynamic.test.ts). */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const memberships = await prisma.organizationMember.findMany({
      where: { user_id: sessionUser.userId },
      include: { organization: true },
    });

    const organizations = memberships.map((m) => ({
      ...m.organization,
      role: m.role,
    }));

    return NextResponse.json({ organizations });
  } catch (error) {
    console.error("Organizations GET error:", error);
    return NextResponse.json({ error: "Failed to fetch organizations" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRole(sessionUser.userId);
    if (isPatientRole(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name } = await request.json();
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const org = await prisma.organization.create({
      data: {
        name,
        slug,
        owner_user_id: sessionUser.userId,
        members: {
          create: {
            user_id: sessionUser.userId,
            role: "admin",
          },
        },
      },
      include: { members: true },
    });

    return NextResponse.json({ organization: org }, { status: 201 });
  } catch (error) {
    console.error("Organizations POST error:", error);
    return NextResponse.json({ error: "Failed to create organization" }, { status: 500 });
  }
}
