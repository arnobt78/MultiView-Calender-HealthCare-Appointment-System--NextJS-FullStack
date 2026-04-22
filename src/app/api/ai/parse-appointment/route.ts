/**
 * AI Parse Appointment — Natural language to structured appointment
 * POST /api/ai/parse-appointment
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { parseNaturalLanguageAppointment } from "@/lib/ai-client";

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text } = await request.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "text field is required" }, { status: 400 });
    }

    const parsed = await parseNaturalLanguageAppointment(text);
    return NextResponse.json({ appointment: parsed });
  } catch (error) {
    console.error("AI parse error:", error);
    return NextResponse.json({ error: "Failed to parse appointment" }, { status: 500 });
  }
}
