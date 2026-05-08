/**
 * AI Summarize — Summarize appointment notes/activities
 * POST /api/ai/summarize
 *
 * Rate-limited to 10 req/min per user to prevent AI cost abuse.
 * Input notes are truncated to 8 000 characters before sending to the model.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { summarizeAppointmentNotes } from "@/lib/ai-client";
import { checkRateLimit } from "@/lib/rate-limit";

/** Max characters we send to the model — keeps tokens bounded and cost predictable. */
const MAX_INPUT_CHARS = 8_000;

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Per-user rate limit: 10 AI summarize calls per minute.
    const { allowed } = await checkRateLimit(`ai-summarize:${sessionUser.userId}`, 10, 60_000);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const { notes, activities } = body as { notes?: unknown; activities?: unknown };

    if (!notes || typeof notes !== "string") {
      return NextResponse.json({ error: "notes field is required" }, { status: 400 });
    }

    // Truncate note text; keep activities as string[] (max 50 entries, each truncated).
    const truncatedNotes = notes.slice(0, MAX_INPUT_CHARS);
    const truncatedActivities: string[] | undefined = Array.isArray(activities)
      ? (activities as unknown[])
          .filter((a): a is string => typeof a === "string")
          .slice(0, 50)
          .map((a) => a.slice(0, 500))
      : undefined;

    const summary = await summarizeAppointmentNotes(truncatedNotes, truncatedActivities);
    return NextResponse.json({ summary });
  } catch (error: unknown) {
    console.error("AI summarize error:", error);
    return NextResponse.json({ error: "Failed to summarize" }, { status: 500 });
  }
}
