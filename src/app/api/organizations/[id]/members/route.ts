/**
 * Organization Members API
 * 
 * GET: list members
 * POST: add member
 * DELETE: remove member
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const members = await prisma.organizationMember.findMany({
      where: { org_id: id },
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Members GET error:", error);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json({ error: "userId and role are required" }, { status: 400 });
    }

    // Verify requester is admin of the org
    const requesterMembership = await prisma.organizationMember.findUnique({
      where: { org_id_user_id: { org_id: id, user_id: sessionUser.userId } },
    });

    if (!requesterMembership || requesterMembership.role !== "admin") {
      return NextResponse.json({ error: "Only admins can add members" }, { status: 403 });
    }

    const member = await prisma.organizationMember.create({
      data: { org_id: id, user_id: userId, role },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    console.error("Members POST error:", error);
    return NextResponse.json({ error: "Failed to add member" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Verify requester is admin
    const requesterMembership = await prisma.organizationMember.findUnique({
      where: { org_id_user_id: { org_id: id, user_id: sessionUser.userId } },
    });

    if (!requesterMembership || requesterMembership.role !== "admin") {
      return NextResponse.json({ error: "Only admins can remove members" }, { status: 403 });
    }

    await prisma.organizationMember.deleteMany({
      where: { org_id: id, user_id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Members DELETE error:", error);
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
}
