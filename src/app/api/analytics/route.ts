/**
 * GET /api/analytics — legacy alias; delegates to scoped insights handler.
 * Prefer GET /api/insights?scope=&doctorId=&period=
 */

import { NextRequest, NextResponse } from "next/server";
import { GET as getInsights } from "@/app/api/insights/route";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return getInsights(req);
}
