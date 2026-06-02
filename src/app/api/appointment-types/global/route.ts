/**
 * GET /api/appointment-types/global — shared templates (`user_id = null`) for all doctors.
 * POST /api/appointment-types/global — **admin only** — creates a global row (same slot engine as seeded types).
 *
 * React: `queryKeys.appointmentTypes.global` + `invalidateAppointmentTypeDerived` after POST so
 * `/services`, portal pickers, and compose-dialog caches stay aligned.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { getUserRole, isAdminRole } from "@/lib/rbac";

export const dynamic = "force-dynamic";

const globalSelect = {
  id: true,
  user_id: true,
  name: true,
  description: true,
  duration_minutes: true,
  buffer_before_minutes: true,
  buffer_after_minutes: true,
  slot_interval_minutes: true,
  minimum_notice_minutes: true,
  created_at: true,
  price_cents: true,
} as const;

function numField(v: unknown, min: number, max: number, fallback: number): number {
  if (v === undefined) return fallback;
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  if (!Number.isFinite(n) || n < min || n > max) return fallback;
  return Math.floor(n);
}

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const types = await prisma.appointmentType.findMany({
      where: { user_id: null },
      orderBy: [{ duration_minutes: "asc" }, { name: "asc" }],
      select: globalSelect,
    });

    return NextResponse.json({ types });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRole(sessionUser.userId);
    if (!isAdminRole(role)) {
      return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
    }

    const body = (await req.json()) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const durationRaw =
      typeof body.duration_minutes === "number"
        ? body.duration_minutes
        : typeof body.duration_minutes === "string"
          ? Number(body.duration_minutes)
          : NaN;

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    if (!Number.isFinite(durationRaw) || durationRaw < 5 || durationRaw > 12 * 60) {
      return NextResponse.json({ error: "duration_minutes must be between 5 and 720" }, { status: 400 });
    }

    let description: string | null = null;
    if ("description" in body) {
      if (body.description === null) {
        description = null;
      } else if (typeof body.description === "string") {
        description = body.description.trim() || null;
      } else {
        return NextResponse.json({ error: "description must be a string or null" }, { status: 400 });
      }
    }

    const priceCentsRaw =
      typeof body.price_cents === "number"
        ? body.price_cents
        : typeof body.price_cents === "string"
          ? Number(body.price_cents)
          : 0;
    const price_cents = Number.isFinite(priceCentsRaw) && priceCentsRaw >= 0
      ? Math.round(priceCentsRaw)
      : 0;

    const type = await prisma.appointmentType.create({
      data: {
        user_id: null,
        name,
        description,
        duration_minutes: Math.floor(durationRaw),
        buffer_before_minutes: numField(body.buffer_before_minutes, 0, 240, 0),
        buffer_after_minutes: numField(body.buffer_after_minutes, 0, 240, 0),
        slot_interval_minutes: numField(body.slot_interval_minutes, 5, 12 * 60, 30),
        minimum_notice_minutes: numField(body.minimum_notice_minutes, 0, 7 * 24 * 60, 60),
        price_cents,
      },
      select: globalSelect,
    });

    return NextResponse.json({ type }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
