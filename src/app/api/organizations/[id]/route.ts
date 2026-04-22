/**
 * Organization [id] API
 * GET:    get single organization
 * PATCH:  update organization name
 * DELETE: delete organization (owner only)
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const org = await prisma.organization.findFirst({
      where: { id },
      include: { members: true },
    });

    if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ organization: org });
  } catch (error) {
    console.error("Org GET error:", error);
    return NextResponse.json({ error: "Failed to fetch organization" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { name } = await req.json();
    if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

    const org = await prisma.organization.findFirst({ where: { id, owner_user_id: sessionUser.userId } });
    if (!org) return NextResponse.json({ error: "Not found or not owner" }, { status: 404 });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const updated = await prisma.organization.update({ where: { id }, data: { name, slug } });

    return NextResponse.json({ organization: updated });
  } catch (error) {
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
  } catch (error) {
    console.error("Org DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete organization" }, { status: 500 });
  }
}
