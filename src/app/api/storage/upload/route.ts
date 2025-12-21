/**
 * File Upload API Route
 * 
 * Handles file uploads to Vercel Blob storage.
 * This route is used by client-side components to upload files.
 */

import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/vercelBlob";
import { getSessionUser } from "@/lib/session";
import { VALIDATION } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || undefined;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size using constants
    const MAX_FILE_SIZE = VALIDATION.FILE_UPLOAD_MAX_SIZE_MB * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${VALIDATION.FILE_UPLOAD_MAX_SIZE_MB}MB limit` },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const result = await uploadFile(file, file.name, folder);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}

