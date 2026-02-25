/**
 * Categories API Route Handler (Prisma)
 * GET: List all categories | POST: Create a category
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { serializeCategory } from "@/lib/serializers";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categories = await prisma.category.findMany({
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({
      categories: categories.map(serializeCategory),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (!body.label || typeof body.label !== "string" || body.label.trim() === "") {
      return NextResponse.json({ error: "label is required" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        label: body.label.trim(),
        description: body.description ?? null,
        color: body.color ?? null,
        icon: body.icon ?? null,
      },
    });

    return NextResponse.json({
      category: serializeCategory(category),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
