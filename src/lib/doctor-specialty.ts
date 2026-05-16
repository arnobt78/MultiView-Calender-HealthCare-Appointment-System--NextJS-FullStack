/**
 * Doctor medical specialty — shared list for forms, filters, and glass badge color mapping.
 * Keep in sync with control-panel doctor profile selects.
 */

export const SPECIALTIES = [
  "General Medicine",
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Pediatrics",
  "Oncology",
  "Orthopedics",
  "Psychiatry",
  "Other",
] as const;

export type DoctorSpecialty = (typeof SPECIALTIES)[number];

/** CSS suffix for `.calendar-glass-badge-{variant}` — one distinct glow per specialty. */
export type SpecialtyGlassVariant =
  | "sky"
  | "rose"
  | "amber"
  | "indigo"
  | "emerald"
  | "violet"
  | "blue"
  | "teal"
  | "slate";

const SPECIALTY_VARIANT: Record<string, SpecialtyGlassVariant> = {
  "General Medicine": "sky",
  Cardiology: "rose",
  Dermatology: "amber",
  Neurology: "indigo",
  Pediatrics: "emerald",
  Oncology: "violet",
  Orthopedics: "blue",
  Psychiatry: "teal",
  Other: "slate",
};

/** Stable glass variant for a specialty label (unknown → slate). */
export function getSpecialtyGlassVariant(specialty: string | null | undefined): SpecialtyGlassVariant {
  if (!specialty?.trim()) return "slate";
  return SPECIALTY_VARIANT[specialty.trim()] ?? "slate";
}

/** Full class string for glass specialty badges (reuses calendar dashboard tokens). */
export function getSpecialtyGlassClassName(specialty: string | null | undefined): string {
  const variant = getSpecialtyGlassVariant(specialty);
  return `calendar-glass-badge calendar-glass-badge-${variant}`;
}
