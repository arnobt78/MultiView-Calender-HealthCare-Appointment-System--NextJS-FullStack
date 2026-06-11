/**
 * Organization [id] API
 * GET:    get single organization (enriched detail + members)
 * PATCH:  update organization name
 * DELETE: delete organization (owner only)
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { loadOrganizationDetailForUser } from "@/lib/organization-detail-load";

type Params = { params: Promise<{ id: string }> };

/** Per-request API handler (see api-route-dynamic.test.ts). */
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const detail = await loadOrganizationDetailForUser(id, sessionUser.userId);
    if (!detail) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(detail);
  } catch (error: unknown) {
    console.error("Org GET error:", error);
    return NextResponse.json({ error: "Failed to fetch organization" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json() as { name?: unknown };
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) return NextResponse.json({ error: "name must be a non-empty string" }, { status: 400 });

    const org = await prisma.organization.findFirst({ where: { id, owner_user_id: sessionUser.userId } });
    if (!org) return NextResponse.json({ error: "Not found or not owner" }, { status: 404 });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const updated = await prisma.organization.update({ where: { id }, data: { name, slug } });

    return NextResponse.json({ organization: updated });
  } catch (error: unknown) {
    console.error("Org PATCH error:", error);
    return NextResponse.json({ error: "Failed to update organization" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const org = await prisma.organization.findFirst({ where: { id, owner_user_id: sessionUser.userId } });
    if (!org) return NextResponse.json({ error: "Not found or not owner" }, { status: 404 });

    await prisma.organization.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Org DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete organization" }, { status: 500 });
  }
}
