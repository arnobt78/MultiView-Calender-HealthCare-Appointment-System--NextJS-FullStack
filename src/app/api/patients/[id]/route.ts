/**
 * Patient by ID: GET, PUT, DELETE (Prisma)
 */

import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { isValidUUID } from "@/lib/validation";
import { serializePatient } from "@/lib/serializers";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid patient ID" }, { status: 400 });
    }

    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }
    return NextResponse.json({ patient: serializePatient(patient) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid patient ID" }, { status: 400 });
    }

    const body = await req.json();
    if (!body.firstname?.trim() || !body.lastname?.trim()) {
      return NextResponse.json({ error: "firstname and lastname are required" }, { status: 400 });
    }

    const existing = await prisma.patient.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Email is identity-linked for demos — never overwrite from client payload.
    const prevClinical =
      existing.clinical_profile && typeof existing.clinical_profile === "object" && !Array.isArray(existing.clinical_profile)
        ? (existing.clinical_profile as Record<string, unknown>)
        : {};
    let nextClinical: Prisma.InputJsonValue | undefined = undefined;
    if (body.clinical_profile !== undefined) {
      if (
        body.clinical_profile !== null &&
        typeof body.clinical_profile === "object" &&
        !Array.isArray(body.clinical_profile)
      ) {
        nextClinical = { ...prevClinical, ...(body.clinical_profile as Record<string, unknown>) } as Prisma.InputJsonValue;
      } else if (body.clinical_profile === null) {
        nextClinical = {} as Prisma.InputJsonValue;
      }
    }

    const patient = await prisma.patient.update({
      where: { id },
      data: {
        firstname: body.firstname.trim(),
        lastname: body.lastname.trim(),
        birth_date: body.birth_date ? new Date(body.birth_date) : null,
        care_level: body.care_level != null ? Number(body.care_level) : null,
        pronoun: body.pronoun ?? null,
        active: body.active !== false,
        active_since: body.active_since ? new Date(body.active_since) : null,
        ...(nextClinical !== undefined ? { clinical_profile: nextClinical } : {}),
      },
    });

    return NextResponse.json({ patient: serializePatient(patient) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid patient ID" }, { status: 400 });
    }

    await prisma.patient.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
