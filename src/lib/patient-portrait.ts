/**
 * Resolves a portrait URL for patient pickers (appointments, assignees, tables).
 *
 * Order of precedence (aligns with `PatientPortalPage` + `PatientManagement`):
 * 1. Known demo account avatars from `DEMO_ACCOUNTS` (seeded patient row has no `image_url` in JSON).
 * 2. Common keys inside `clinical_profile` JSON (`image_url`, camelCase, `photo`, etc.).
 * 3. Deterministic robohash by stable `id` (not email) to avoid duplicate slow external fetches per email
 *    and to match behavior when clinical JSON omits images.
 */

import { DEMO_ACCOUNTS } from "@/lib/demo-credentials";
import type { Patient } from "@/types/types";

const DEMO_AVATAR_BY_EMAIL = new Map(
  DEMO_ACCOUNTS.map((account) => [account.email.toLowerCase(), account.avatarUrl])
);

function clinicalImageFromProfile(profile: unknown): string | null {
  if (profile == null || typeof profile !== "object" || Array.isArray(profile)) return null;
  const o = profile as Record<string, unknown>;
  const candidates = ["image_url", "imageUrl", "photo", "portrait_url", "avatar", "profile_image_url"];
  for (const key of candidates) {
    const v = o[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

/** Returns absolute/relative image URL or robohash fallback string for `<img>` / `SafeImage`. */
export function resolvePatientPortraitUrl(p: Pick<Patient, "id" | "email" | "clinical_profile">): string {
  const emailKey = p.email?.trim().toLowerCase();
  if (emailKey) {
    const demo = DEMO_AVATAR_BY_EMAIL.get(emailKey);
    if (demo) return demo;
  }
  const fromClinical = clinicalImageFromProfile(p.clinical_profile);
  if (fromClinical) return fromClinical;
  return `https://robohash.org/${encodeURIComponent(p.id)}.png?set=set4&size=64x64`;
}
