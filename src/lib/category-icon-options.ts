import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Baby,
  Brain,
  HeartPulse,
  Pill,
  ShieldPlus,
  Sparkles,
  Stethoscope,
  Tags,
  Bone,
} from "lucide-react";

/**
 * Curated Lucide icons for category branding — stored as kebab-case names in DB `icon` column.
 * Admins pick from this list in the category dialog; unknown legacy values fall back to `stethoscope`.
 */
export const CATEGORY_ICON_OPTIONS = [
  { value: "stethoscope", label: "Primary Care", Icon: Stethoscope },
  { value: "heart-pulse", label: "Cardiology", Icon: HeartPulse },
  { value: "brain", label: "Neurology", Icon: Brain },
  { value: "baby", label: "Pediatrics", Icon: Baby },
  { value: "activity", label: "Mental Health", Icon: Activity },
  { value: "bone", label: "Orthopedics", Icon: Bone },
  { value: "pill", label: "Pharmacy & Medication", Icon: Pill },
  { value: "shield-plus", label: "Preventive Care", Icon: ShieldPlus },
  { value: "sparkles", label: "Wellness", Icon: Sparkles },
  { value: "tags", label: "General Services", Icon: Tags },
] as const;

export type CategoryIconName = (typeof CATEGORY_ICON_OPTIONS)[number]["value"];

export const DEFAULT_CATEGORY_ICON: CategoryIconName = "stethoscope";

const ICON_BY_VALUE = Object.fromEntries(
  CATEGORY_ICON_OPTIONS.map((opt) => [opt.value, opt.Icon])
) as Record<CategoryIconName, LucideIcon>;

const VALID_ICON_VALUES = new Set<string>(CATEGORY_ICON_OPTIONS.map((o) => o.value));

/** Normalize persisted / free-text icon → known enum value for render + form selects. */
export function normalizeCategoryIcon(icon: string | null | undefined): CategoryIconName {
  const trimmed = icon?.trim().toLowerCase();
  if (trimmed && VALID_ICON_VALUES.has(trimmed)) {
    return trimmed as CategoryIconName;
  }
  return DEFAULT_CATEGORY_ICON;
}

export function resolveCategoryLucideIcon(icon: string | null | undefined): LucideIcon {
  return ICON_BY_VALUE[normalizeCategoryIcon(icon)];
}

export function categoryIconOptionLabel(icon: string | null | undefined): string {
  const normalized = normalizeCategoryIcon(icon);
  return CATEGORY_ICON_OPTIONS.find((o) => o.value === normalized)?.label ?? "Primary Care";
}

/** Valid hex for brand mark background — mirrors snapshot category swatch guard. */
export function categoryBrandColorFill(color: string | null | undefined): string {
  if (!color?.trim()) return "#0ea5e9";
  const hex = color.trim();
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(hex) ? hex : "#0ea5e9";
}
