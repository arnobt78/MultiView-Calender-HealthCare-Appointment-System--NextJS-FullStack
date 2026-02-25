/**
 * Relatives API Route Handler (Prisma)
 * GET: List all relatives
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { serializeRelative } from "@/lib/serializers";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const relatives = await prisma.relative.findMany({
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({
      relatives: relatives.map(serializeRelative),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Error fetching relatives:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
