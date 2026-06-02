/**
 * GET /api/appointment-types/admin-all — admin only.
 *
 * Returns ALL appointment types (global + every doctor's custom types) with owner info.
 * Used by the control-panel "Appointment Types" page to show custom types grouped by doctor.
 *
 * Response shape:
 *   { globalTypes: AdminAllTypeRow[]; customTypes: AdminAllTypeRow[] }
 *
 * `queryKeys.appointmentTypes.all` — bust via `invalidateAppointmentTypeDerived`.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { getUserRole, isAdminRole } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export type AdminAllTypeRow = {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  duration_minutes: number;
  slot_interval_minutes: number;
  price_cents: number;
  is_active: boolean;
  is_telehealth: boolean;
  color: string | null;
  icon: string | null;
  created_at: string;
  owner_display_name: string | null;
  owner_email: string | null;
};

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRole(sessionUser.userId);
    if (!isAdminRole(role)) {
      return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
    }

    const [globalRows, customRows] = await Promise.all([
      prisma.appointmentType.findMany({
        where: { user_id: null },
        orderBy: { name: "asc" },
        select: {
          id: true,
          user_id: true,
          name: true,
          description: true,
          duration_minutes: true,
          slot_interval_minutes: true,
          price_cents: true,
          is_active: true,
          is_telehealth: true,
          color: true,
          icon: true,
          created_at: true,
        },
      }),
      prisma.appointmentType.findMany({
        where: { user_id: { not: null } },
        orderBy: [{ user: { display_name: "asc" } }, { name: "asc" }],
        select: {
          id: true,
          user_id: true,
          name: true,
          description: true,
          duration_minutes: true,
          slot_interval_minutes: true,
          price_cents: true,
          is_active: true,
          is_telehealth: true,
          color: true,
          icon: true,
          created_at: true,
          user: { select: { display_name: true, email: true } },
        },
      }),
    ]);

    const globalTypes: AdminAllTypeRow[] = globalRows.map((r) => ({
      ...r,
      created_at: r.created_at.toISOString(),
      owner_display_name: null,
      owner_email: null,
    }));

    const customTypes: AdminAllTypeRow[] = customRows.map((r) => ({
      id: r.id,
      user_id: r.user_id,
      name: r.name,
      description: r.description,
      duration_minutes: r.duration_minutes,
      slot_interval_minutes: r.slot_interval_minutes,
      price_cents: r.price_cents,
      is_active: r.is_active,
      is_telehealth: r.is_telehealth,
      color: r.color,
      icon: r.icon,
      created_at: r.created_at.toISOString(),
      owner_display_name: r.user?.display_name ?? null,
      owner_email: r.user?.email ?? null,
    }));

    return NextResponse.json({ globalTypes, customTypes });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
