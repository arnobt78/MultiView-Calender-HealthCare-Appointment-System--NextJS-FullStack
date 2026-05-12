/**
 * AI Suggest Times — Suggest available appointment time slots
 * POST /api/ai/suggest-times
 *
 * Rate-limited to 10 req/min per user.
 * Validates preferredDate (must be parseable) and duration (1–480 min integer).
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { generateCompletion } from "@/lib/ai-client";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Per-user rate limit: 10 AI suggest-times calls per minute.
    const { allowed } = await checkRateLimit(`ai-suggest-times:${sessionUser.userId}`, 10, 60_000);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json() as { preferredDate?: unknown; duration?: unknown };
    const { preferredDate, duration } = body;

    // Validate and coerce inputs — bad dates produce Invalid Date which silently
    // breaks the Prisma range query; non-numeric duration corrupts the AI prompt.
    const targetDate = preferredDate ? new Date(String(preferredDate)) : new Date();
    if (Number.isNaN(targetDate.getTime())) {
      return NextResponse.json({ error: "Invalid preferredDate" }, { status: 400 });
    }

    const durationMinutes = duration !== undefined ? Number(duration) : 60;
    if (!Number.isInteger(durationMinutes) || durationMinutes < 1 || durationMinutes > 480) {
      return NextResponse.json({ error: "duration must be an integer between 1 and 480 minutes" }, { status: 400 });
    }

    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    // Fetch the user's existing appointments for the target day to build busy slots.
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        owner_id: sessionUser.userId,
        start: { gte: dayStart, lte: dayEnd },
      },
      select: { start: true, end: true, title: true },
      orderBy: { start: "asc" },
    });

    const busySlots = existingAppointments.map((a) => ({
      start: a.start.toISOString(),
      end: a.end.toISOString(),
      title: a.title,
    }));

    const systemPrompt = `You are an appointment scheduling assistant. Given the existing appointments on a day and desired duration, suggest 3 available time slots during business hours (8:00-18:00).\n\nRespond with ONLY valid JSON array of objects with "start" and "end" as ISO 8601 datetime strings. No markdown.`;

    const prompt = `Date: ${targetDate.toISOString().split("T")[0]}
Duration: ${durationMinutes} minutes
Existing appointments: ${JSON.stringify(busySlots)}

Suggest 3 available time slots.`;

    const result = await generateCompletion(prompt, systemPrompt);

    try {
      const suggestions = JSON.parse(result.text.trim());
      return NextResponse.json({ suggestions, provider: result.provider });
    } catch {
      return NextResponse.json({ suggestions: [], provider: result.provider });
    }
  } catch (error: unknown) {
    console.error("AI suggest times error:", error);
    return NextResponse.json({ error: "Failed to suggest times" }, { status: 500 });
  }
}
