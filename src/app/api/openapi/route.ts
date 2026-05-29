import { NextResponse } from "next/server";
import openApiJson from "./openapi.json";

/** Per-request API handler (see api-route-dynamic.test.ts). */
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(openApiJson);
}
