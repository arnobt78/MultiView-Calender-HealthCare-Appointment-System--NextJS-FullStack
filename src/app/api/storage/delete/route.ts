/**
 * File Delete API Route
 *
 * Handles file deletion from Vercel Blob storage.
 * Restricted to staff roles (admin / doctor).
 * Patients cannot delete arbitrary blob URLs — they update their profile image
 * through dedicated profile endpoints that handle cleanup internally.
 */

import { NextRequest, NextResponse } from "next/server";
import { deleteFile } from "@/lib/vercelBlob";
import { getSessionUser } from "@/lib/session";
import { getUserRole, isStaffRole } from "@/lib/rbac";

/** Per-request API handler (see api-route-dynamic.test.ts). */
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only staff (admin / doctor) may delete stored files.
    // This prevents patients from constructing a payload to delete arbitrary blobs.
    const role = await getUserRole(sessionUser.userId);
    if (!isStaffRole(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "No file URL provided" }, { status: 400 });
    }

    await deleteFile(url);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("File deletion error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Deletion failed" },
      { status: 500 }
    );
  }
}

