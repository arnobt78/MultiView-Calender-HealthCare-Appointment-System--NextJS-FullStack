import { z } from "zod";

export const maxUploadSizeBytes = 1 * 1024 * 1024;

export const uploadMetaSchema = z.object({
  folder: z.string().trim().min(1).max(120).optional(),
  size: z.number().int().nonnegative().max(maxUploadSizeBytes, "File size exceeds 1MB limit"),
  name: z.string().trim().min(1).max(255),
  type: z.string().trim().max(120).optional(),
});
