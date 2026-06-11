/**
 * Organizations API
 *
 * GET: list user's organizations (enriched with member + invoice aggregates)
 * POST: create organization
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getUserRole, isPatientRole } from "@/lib/rbac";
import { loadOrganizationsListForUser } from "@/lib/organization-list-enrich";
import {
  dedupeInitialMembers,
  isOrgMemberRole,
  type InitialOrgMemberInput,
} from "@/lib/organization-member-role";

/** Per-request API handler (see api-route-dynamic.test.ts). */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizations = await loadOrganizationsListForUser(sessionUser.userId);
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

    const body = await request.json();
    const name = body?.name;
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const rawInitial: unknown[] = Array.isArray(body?.initialMembers)
      ? body.initialMembers
      : [];
    const parsedInitial: InitialOrgMemberInput[] = rawInitial.flatMap((entry) => {
      if (!entry || typeof entry !== "object") return [];
      const userId = (entry as { userId?: unknown }).userId;
      const role = (entry as { role?: unknown }).role;
      if (typeof userId !== "string" || !isOrgMemberRole(String(role))) return [];
      return [{ userId, role: role as InitialOrgMemberInput["role"] }];
    });
    const initialMembers = dedupeInitialMembers(parsedInitial, sessionUser.userId);

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const org = await prisma.$transaction(async (tx) => {
      const created = await tx.organization.create({
        data: {
          name,
          slug,
          owner_user_id: sessionUser.userId,
        },
      });
      await tx.organizationMember.create({
        data: {
          org_id: created.id,
          user_id: sessionUser.userId,
          role: "admin",
        },
      });
      for (const member of initialMembers) {
        await tx.organizationMember.create({
          data: {
            org_id: created.id,
            user_id: member.userId,
            role: member.role,
          },
        });
      }
      return tx.organization.findUniqueOrThrow({
        where: { id: created.id },
        include: { members: true },
      });
    });

    return NextResponse.json({ organization: org }, { status: 201 });
  } catch (error) {
    console.error("Organizations POST error:", error);
    return NextResponse.json({ error: "Failed to create organization" }, { status: 500 });
  }
}
