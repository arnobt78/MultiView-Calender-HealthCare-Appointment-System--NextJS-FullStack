/**
 * Vercel Blob Storage Utility
 * 
 * This file provides utilities for uploading and retrieving files from Vercel Blob.
 * Perfect for demo projects - free tier includes 1GB storage.
 * 
 * Vercel Blob Configuration:
 * - Automatically configured via Vercel environment
 * - No API keys needed in local dev (uses BLOB_READ_WRITE_TOKEN)
 * - Works seamlessly with Vercel deployments
 * 
 * Usage:
 * - Client-side: Use uploadFile() for file uploads (via API route)
 * - Server-side: Use getPublicUrl() for generating URLs
 * - Both: Use deleteFile() for file deletion
 * 
 * Benefits over Cloudinary:
 * - Free tier: 1GB storage, 100GB bandwidth/month
 * - No external service needed
 * - Integrated with Vercel deployments
 * - Simple API
 */

import { put, del, list } from "@vercel/blob";
import { VERCEL_BLOB_CONFIG } from "./constants";

// Get Vercel Blob token from environment
// In Vercel, this is automatically set. For local dev, set BLOB_READ_WRITE_TOKEN
const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

/**
 * Get the default folder/prefix for this project
 */
function getDefaultPrefix(): string {
  return process.env.NEXT_PUBLIC_BLOB_FOLDER || VERCEL_BLOB_CONFIG.DEFAULT_FOLDER;
}

/**
 * Upload a file to Vercel Blob (server-side)
 * 
 * @param file - File object or Buffer to upload
 * @param filename - Optional custom filename
 * @param folder - Optional folder/prefix path
 * @returns Promise with upload result containing url and pathname
 * 
 * Example:
 * const result = await uploadFile(file, "document.pdf");
 * console.log(result.url); // Public URL
 */
export async function uploadFile(
  file: File | Buffer,
  filename?: string,
  folder?: string
): Promise<{ url: string; pathname: string; contentType: string; size: number }> {
  if (!BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured. Set it in your environment variables.");
  }

  const prefix = folder || getDefaultPrefix();
  const pathname = filename 
    ? `${prefix}/${filename}` 
    : `${prefix}/${Date.now()}-${Math.random().toString(36).substring(7)}`;

  // Convert File to Buffer if needed
  let fileBuffer: Buffer | Uint8Array;
  if (file instanceof File) {
    const arrayBuffer = await file.arrayBuffer();
    fileBuffer = Buffer.from(arrayBuffer);
  } else {
    fileBuffer = file;
  }

  const blob = await put(pathname, fileBuffer as any, {
    access: "public",
    token: BLOB_READ_WRITE_TOKEN,
    contentType: file instanceof File ? file.type : undefined,
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
    contentType: blob.contentType || "application/octet-stream",
    size: file instanceof File ? file.size : (file as Buffer).length,
  };
}

/**
 * Get public URL for a file stored in Vercel Blob
 * 
 * @param urlOrPathname - Blob URL or pathname (stored in database)
 * @returns Public URL for the file
 * 
 * Example:
 * const url = getPublicUrl("https://...blob.vercel-storage.com/file.pdf");
 * const url2 = getPublicUrl("multiview-calendar-appointment/document.pdf");
 */
export function getPublicUrl(urlOrPathname: string): string {
  if (!urlOrPathname) return "";
  
  // If it's already a full URL (from Vercel Blob), return it
  if (urlOrPathname.startsWith("http://") || urlOrPathname.startsWith("https://")) {
    return urlOrPathname;
  }
  
  // If it's a pathname, it should already be a full URL from uploadFile()
  // But for backward compatibility, return as-is
  // In practice, uploadFile() returns the full URL which should be stored
  return urlOrPathname;
}

/**
 * Delete a file from Vercel Blob
 * 
 * @param url - Blob URL to delete
 * @returns Promise that resolves when deletion is complete
 * 
 * Example:
 * await deleteFile("https://...blob.vercel-storage.com/path/to/file.pdf");
 */
export async function deleteFile(url: string): Promise<void> {
  if (!url) return;
  
  if (!BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured.");
  }

  try {
    await del(url, { token: BLOB_READ_WRITE_TOKEN });
  } catch (error) {
    console.error("Error deleting file from Vercel Blob:", error);
    throw error;
  }
}

/**
 * List files in a folder/prefix
 * 
 * @param prefix - Folder/prefix path to list
 * @returns Promise with list of blobs
 */
export async function listFiles(prefix?: string): Promise<any[]> {
  if (!BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured.");
  }

  const searchPrefix = prefix || getDefaultPrefix();
  const { blobs } = await list({ 
    prefix: searchPrefix,
    token: BLOB_READ_WRITE_TOKEN,
  });

  return blobs;
}

/**
 * Upload file via API route (client-side friendly)
 * This creates an API route wrapper for client-side uploads
 * 
 * @param file - File object to upload
 * @param onProgress - Optional progress callback
 * @returns Promise with upload result
 */
export async function uploadFileViaAPI(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ url: string; pathname: string; contentType: string; size: number }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", getDefaultPrefix());

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = Math.round((e.loaded / e.total) * 100);
        onProgress(progress);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.error) {
            reject(new Error(response.error.message || "Upload failed"));
            return;
          }
          resolve(response);
        } catch (error) {
          reject(new Error("Failed to parse upload response"));
        }
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Upload failed"));
    });

    xhr.open("POST", "/api/storage/upload");
    xhr.send(formData);
  });
}

