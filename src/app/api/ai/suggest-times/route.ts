/**
 * AI Suggest Times — Suggest available appointment time slots
 * POST /api/ai/suggest-times
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { generateCompletion } from "@/lib/ai-client";

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { preferredDate, duration } = await request.json();

    // Get existing appointments for the user around the preferred date
    const targetDate = preferredDate ? new Date(preferredDate) : new Date();
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        user_id: sessionUser.userId,
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

    const systemPrompt = `You are an appointment scheduling assistant. Given the existing appointments on a day and desired duration, suggest 3 available time slots during business hours (8:00-18:00).

Respond with ONLY valid JSON array of objects with "start" and "end" as ISO 8601 datetime strings. No markdown.`;

    const prompt = `Date: ${targetDate.toISOString().split("T")[0]}
Duration: ${duration || 60} minutes
Existing appointments: ${JSON.stringify(busySlots)}

Suggest 3 available time slots.`;

    const result = await generateCompletion(prompt, systemPrompt);

    try {
      const suggestions = JSON.parse(result.text.trim());
      return NextResponse.json({ suggestions, provider: result.provider });
    } catch {
      return NextResponse.json({ suggestions: [], provider: result.provider });
    }
  } catch (error) {
    console.error("AI suggest times error:", error);
    return NextResponse.json({ error: "Failed to suggest times" }, { status: 500 });
  }
}
