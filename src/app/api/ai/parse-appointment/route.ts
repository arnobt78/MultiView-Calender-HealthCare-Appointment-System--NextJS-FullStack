/**
 * AI Parse Appointment — Natural language to structured appointment
 * POST /api/ai/parse-appointment
 *
 * Rate-limited to 10 req/min per user (same budget as summarize/categorize).
 * Input text is capped at 2 000 characters to bound token cost.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { parseNaturalLanguageAppointment } from "@/lib/ai-client";
import { checkRateLimit } from "@/lib/rate-limit";

/** Max characters sent to the model — prevents unbounded token consumption. */
const MAX_INPUT_CHARS = 2_000;

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Per-user rate limit: 10 AI parse calls per minute.
    const { allowed } = await checkRateLimit(`ai-parse:${sessionUser.userId}`, 10, 60_000);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json() as { text?: unknown };
    const { text } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "text field is required" }, { status: 400 });
    }

    // Truncate to avoid unbounded token consumption.
    const parsed = await parseNaturalLanguageAppointment(text.slice(0, MAX_INPUT_CHARS));
    return NextResponse.json({ appointment: parsed });
  } catch (error: unknown) {
    console.error("AI parse error:", error);
    return NextResponse.json({ error: "Failed to parse appointment" }, { status: 500 });
  }
}
