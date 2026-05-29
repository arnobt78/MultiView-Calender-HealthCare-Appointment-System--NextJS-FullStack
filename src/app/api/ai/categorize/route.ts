/**
 * AI Categorize — Suggest a category for an appointment
 * POST /api/ai/categorize
 *
 * Rate-limited to 10 req/min per user to prevent AI cost abuse.
 * Title and notes are truncated to 2 000 characters each before sending to the model.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { suggestCategory } from "@/lib/ai-client";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

/** Max characters per input field sent to the model. */
const MAX_INPUT_CHARS = 2_000;

/** Per-request API handler (see api-route-dynamic.test.ts). */
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Per-user rate limit: 10 AI categorize calls per minute.
    const { allowed } = await checkRateLimit(`ai-categorize:${sessionUser.userId}`, 10, 60_000);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const { title, notes } = body as { title?: unknown; notes?: unknown };

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "title field is required" }, { status: 400 });
    }

    // Truncate to avoid unbounded token consumption.
    const truncatedTitle = title.slice(0, MAX_INPUT_CHARS);
    const truncatedNotes = typeof notes === "string" ? notes.slice(0, MAX_INPUT_CHARS) : notes;

    // Categories are global (no user_id on Category model) — load all labels.
    const categories = await prisma.category.findMany({ select: { label: true } });
    const categoryLabels = categories.map((c) => c.label);

    const suggested = await suggestCategory(
      truncatedTitle,
      typeof truncatedNotes === "string" ? truncatedNotes : undefined,
      categoryLabels
    );
    return NextResponse.json({ category: suggested });
  } catch (error: unknown) {
    console.error("AI categorize error:", error);
    return NextResponse.json({ error: "Failed to categorize" }, { status: 500 });
  }
}
