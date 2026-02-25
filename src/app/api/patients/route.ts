/**
 * Patients API Route Handler (Prisma)
 * GET: List all patients | POST: Create a patient
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { serializePatient } from "@/lib/serializers";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const patients = await prisma.patient.findMany({
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({
      patients: patients.map(serializePatient),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Error fetching patients:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (!body.firstname?.trim() || !body.lastname?.trim()) {
      return NextResponse.json({ error: "firstname and lastname are required" }, { status: 400 });
    }

    const patient = await prisma.patient.create({
      data: {
        firstname: body.firstname.trim(),
        lastname: body.lastname.trim(),
        birth_date: body.birth_date ? new Date(body.birth_date) : null,
        care_level: body.care_level != null ? Number(body.care_level) : null,
        pronoun: body.pronoun ?? null,
        email: body.email ?? null,
        active: body.active !== false,
        active_since: body.active_since ? new Date(body.active_since) : null,
      },
    });

    return NextResponse.json({ patient: serializePatient(patient) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
