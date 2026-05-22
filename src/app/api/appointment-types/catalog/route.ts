/**
 * GET /api/appointment-types/catalog
 *
 * Merged list for `/services` Appointment Services: active global templates plus
 * active doctor-owned types (deduped by name in `buildServiceCatalog`).
 * Invalidated via `queryKeys.appointmentTypes.catalog` inside `invalidateAppointmentTypeDerived`.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import {
  buildServiceCatalog,
  type AdditionalCatalogInput,
  type GlobalCatalogInput,
} from "@/lib/appointment-service-catalog";

export const dynamic = "force-dynamic";

const typeSelect = {
  id: true,
  name: true,
  description: true,
  duration_minutes: true,
  buffer_before_minutes: true,
  buffer_after_minutes: true,
  slot_interval_minutes: true,
  is_telehealth: true,
  user_id: true,
} as const;

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [globalRows, additionalRaw] = await Promise.all([
      prisma.appointmentType.findMany({
        where: { user_id: null, is_active: true },
        select: typeSelect,
        orderBy: [{ duration_minutes: "asc" }, { name: "asc" }],
      }),
      prisma.appointmentType.findMany({
        where: { user_id: { not: null }, is_active: true },
        select: {
          ...typeSelect,
          user: { select: { id: true, display_name: true, email: true, specialty: true } },
        },
        orderBy: [{ duration_minutes: "asc" }, { name: "asc" }],
      }),
    ]);

    const globals: GlobalCatalogInput[] = globalRows.map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      duration_minutes: g.duration_minutes,
      buffer_before_minutes: g.buffer_before_minutes,
      buffer_after_minutes: g.buffer_after_minutes,
      slot_interval_minutes: g.slot_interval_minutes,
      is_telehealth: g.is_telehealth,
    }));

    const additionals: AdditionalCatalogInput[] = additionalRaw
      .filter((r): r is typeof r & { user_id: string; user: NonNullable<typeof r.user> } =>
        Boolean(r.user_id && r.user)
      )
      .map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        duration_minutes: r.duration_minutes,
        buffer_before_minutes: r.buffer_before_minutes,
        buffer_after_minutes: r.buffer_after_minutes,
        slot_interval_minutes: r.slot_interval_minutes,
        is_telehealth: r.is_telehealth,
        user_id: r.user_id,
        owner_display_name: r.user.display_name,
        owner_email: r.user.email,
        owner_specialty: r.user.specialty,
      }));

    const services = buildServiceCatalog(globals, additionals);

    return NextResponse.json({ services });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
