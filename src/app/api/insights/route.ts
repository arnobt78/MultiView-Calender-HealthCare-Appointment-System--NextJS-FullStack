import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getInsightsData } from "@/lib/insights-data";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const data = await getInsightsData(sessionUser.userId);
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Insights error:", error);
    return NextResponse.json({ error: "Failed to load insights" }, { status: 500 });
  }
}
