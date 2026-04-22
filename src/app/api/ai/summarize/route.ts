/**
 * AI Summarize — Summarize appointment notes/activities
 * POST /api/ai/summarize
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { summarizeAppointmentNotes } from "@/lib/ai-client";

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notes, activities } = await request.json();
    if (!notes) {
      return NextResponse.json({ error: "notes field is required" }, { status: 400 });
    }

    const summary = await summarizeAppointmentNotes(notes, activities);
    return NextResponse.json({ summary });
  } catch (error) {
    console.error("AI summarize error:", error);
    return NextResponse.json({ error: "Failed to summarize" }, { status: 500 });
  }
}
