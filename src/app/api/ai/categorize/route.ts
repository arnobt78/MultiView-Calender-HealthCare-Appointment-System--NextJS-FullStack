/**
 * AI Categorize — Suggest a category for an appointment
 * POST /api/ai/categorize
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { suggestCategory } from "@/lib/ai-client";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, notes } = await request.json();
    if (!title) {
      return NextResponse.json({ error: "title field is required" }, { status: 400 });
    }

    // Get available categories from DB
    const categories = await prisma.category.findMany({ select: { label: true } });
    const categoryLabels = categories.map((c) => c.label);

    const suggested = await suggestCategory(title, notes, categoryLabels);
    return NextResponse.json({ category: suggested });
  } catch (error) {
    console.error("AI categorize error:", error);
    return NextResponse.json({ error: "Failed to categorize" }, { status: 500 });
  }
}
