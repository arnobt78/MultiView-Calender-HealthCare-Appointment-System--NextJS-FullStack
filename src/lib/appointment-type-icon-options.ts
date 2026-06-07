import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Bone,
  Clock,
  FileText,
  Heart,
  Layers,
  MessageCircle,
  Sparkles,
  Stethoscope,
  Video,
} from "lucide-react";

/**
 * Lucide icons for appointment / service types — stored as kebab-case in DB `icon` column.
 * Overlaps category icons where sensible; adds visit-type-specific glyphs (clock, video, …).
 */
export const APPOINTMENT_TYPE_ICON_OPTIONS = [
  { value: "stethoscope", label: "Consultation", Icon: Stethoscope },
  { value: "clock", label: "Follow-up", Icon: Clock },
  { value: "video", label: "Telehealth", Icon: Video },
  { value: "heart", label: "Check-up", Icon: Heart },
  { value: "bone", label: "Physio / Ortho", Icon: Bone },
  { value: "file-text", label: "Report / Results", Icon: FileText },
  { value: "message-circle", label: "Consultation chat", Icon: MessageCircle },
  { value: "activity", label: "Therapy", Icon: Activity },
  { value: "sparkles", label: "Specialist", Icon: Sparkles },
  { value: "layers", label: "Service bundle", Icon: Layers },
] as const;

export type AppointmentTypeIconName = (typeof APPOINTMENT_TYPE_ICON_OPTIONS)[number]["value"];

export const DEFAULT_APPOINTMENT_TYPE_ICON: AppointmentTypeIconName = "stethoscope";

const ICON_BY_VALUE = Object.fromEntries(
  APPOINTMENT_TYPE_ICON_OPTIONS.map((opt) => [opt.value, opt.Icon])
) as Record<AppointmentTypeIconName, LucideIcon>;

const VALID = new Set<string>(APPOINTMENT_TYPE_ICON_OPTIONS.map((o) => o.value));

/** Normalize persisted icon string for render + forms. */
export function normalizeAppointmentTypeIcon(
  icon: string | null | undefined
): AppointmentTypeIconName {
  const trimmed = icon?.trim().toLowerCase();
  if (trimmed && VALID.has(trimmed)) {
    return trimmed as AppointmentTypeIconName;
  }
  return DEFAULT_APPOINTMENT_TYPE_ICON;
}

export function resolveAppointmentTypeLucideIcon(
  icon: string | null | undefined
): LucideIcon {
  return ICON_BY_VALUE[normalizeAppointmentTypeIcon(icon)];
}

/** Valid hex for tiles — fallback indigo when missing/invalid. */
export function appointmentTypeBrandColorFill(color: string | null | undefined): string {
  if (!color?.trim()) return "#6366f1";
  const hex = color.trim();
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(hex) ? hex : "#6366f1";
}

/** Parse #RGB / #RRGGBB → RGB tuple for tint shells (detail field icon parity). */
export function parseAppointmentTypeHexRgb(
  hex: string
): { r: number; g: number; b: number } | null {
  const raw = hex.replace("#", "").trim();
  if (raw.length === 3) {
    const r = parseInt(raw[0]! + raw[0], 16);
    const g = parseInt(raw[1]! + raw[1], 16);
    const b = parseInt(raw[2]! + raw[2], 16);
    return Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b) ? null : { r, g, b };
  }
  if (raw.length >= 6) {
    const r = parseInt(raw.slice(0, 2), 16);
    const g = parseInt(raw.slice(2, 4), 16);
    const b = parseInt(raw.slice(4, 6), 16);
    return Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b) ? null : { r, g, b };
  }
  return null;
}

/** Light tile shell + icon stroke — matches entity detail field icon circles. */
export function appointmentTypeBrandMarkStyles(color: string | null | undefined): {
  containerStyle: CSSProperties;
  iconColor: string;
} {
  const fill = appointmentTypeBrandColorFill(color);
  const rgb = parseAppointmentTypeHexRgb(fill);
  if (!rgb) {
    return {
      containerStyle: {
        backgroundColor: "rgba(99, 102, 241, 0.12)",
        borderColor: "rgba(99, 102, 241, 0.35)",
        borderWidth: 1,
        borderStyle: "solid",
      },
      iconColor: fill,
    };
  }
  const { r, g, b } = rgb;
  return {
    containerStyle: {
      backgroundColor: `rgba(${r}, ${g}, ${b}, 0.12)`,
      borderColor: `rgba(${r}, ${g}, ${b}, 0.35)`,
      borderWidth: 1,
      borderStyle: "solid",
    },
    iconColor: fill,
  };
}

export function appointmentTypeIconOptionLabel(icon: string | null | undefined): string {
  const normalized = normalizeAppointmentTypeIcon(icon);
  return APPOINTMENT_TYPE_ICON_OPTIONS.find((o) => o.value === normalized)?.label ?? "Consultation";
}
