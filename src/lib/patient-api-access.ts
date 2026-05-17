/**
 * Shared API request helpers for patient routes — parses roster browse query param.
 */

import type { NextRequest } from "next/server";
import { isValidUUID } from "@/lib/validation";

/** `?fromDoctor=` from doctor profile directory links — roster view gate in `resolvePatientAccess`. */
export function rosterDoctorIdFromRequest(req: NextRequest): string | null {
  const raw = req.nextUrl.searchParams.get("fromDoctor");
  if (!raw || !isValidUUID(raw)) return null;
  return raw;
}
