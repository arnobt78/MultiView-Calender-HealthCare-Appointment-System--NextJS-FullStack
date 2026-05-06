/**
 * Category by ID: GET, PUT, DELETE (Prisma)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";
import { serializeCategory } from "@/lib/serializers";
import { redis } from "@/lib/redis";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
    }

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ category: serializeCategory(category) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
    }

    const body = await req.json();
    if (!body.label || typeof body.label !== "string" || body.label.trim() === "") {
      return NextResponse.json({ error: "label is required" }, { status: 400 });
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        label: body.label.trim(),
        description: body.description ?? null,
        color: body.color ?? null,
        icon: body.icon ?? null,
        updated_at: new Date(),
      },
    });

    /* Bust the server-side Redis overview cache so the updated category is reflected immediately. */
    void redis.invalidateDashboardOverview(sessionUser.userId);

    return NextResponse.json({ category: serializeCategory(category) });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });
    }

    await prisma.category.delete({ where: { id } });

    /* Bust the server-side Redis overview cache so the deleted category is no longer counted. */
    void redis.invalidateDashboardOverview(sessionUser.userId);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
