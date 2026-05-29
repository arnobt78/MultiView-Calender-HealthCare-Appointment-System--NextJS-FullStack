/**
 * File Upload API Route
 * 
 * Handles file uploads to Vercel Blob storage.
 * This route is used by client-side components to upload files.
 */

import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/vercelBlob";
import { getSessionUser } from "@/lib/session";
import { uploadMetaSchema } from "@/lib/schemas/upload";
import { zodBadRequest } from "@/lib/schemas/parse";

/** Per-request API handler (see api-route-dynamic.test.ts). */
export const dynamic = "force-dynamic";

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

    const parsed = uploadMetaSchema.safeParse({
      folder,
      size: file.size,
      name: file.name,
      type: file.type,
    });
    if (!parsed.success) {
      return zodBadRequest(parsed.error);
    }

    // Upload to Vercel Blob
    const result = await uploadFile(file, file.name, folder);

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}

