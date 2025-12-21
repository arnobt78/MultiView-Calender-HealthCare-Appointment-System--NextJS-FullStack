/**
 * File Delete API Route
 * 
 * Handles file deletion from Vercel Blob storage.
 */

import { NextRequest, NextResponse } from "next/server";
import { deleteFile } from "@/lib/vercelBlob";
import { getSessionUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "No file URL provided" }, { status: 400 });
    }

    // Delete from Vercel Blob
    await deleteFile(url);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("File deletion error:", error);
    return NextResponse.json(
      { error: error.message || "Deletion failed" },
      { status: 500 }
    );
  }
}

