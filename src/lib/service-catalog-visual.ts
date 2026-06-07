import type { LucideIcon } from "lucide-react";
import {
  appointmentTypeBrandColorFill,
  normalizeAppointmentTypeIcon,
  resolveAppointmentTypeLucideIcon,
  type AppointmentTypeIconName,
} from "@/lib/appointment-type-icon-options";
import type { ServiceCatalogRow } from "@/lib/appointment-service-catalog";

/** Glow bucket for card shadow tokens — derived from brand hex hue. */
export type ServiceCatalogGlowVariant =
  | "sky"
  | "violet"
  | "emerald"
  | "amber"
  | "rose"
  | "teal"
  | "indigo"
  | "slate";

export type ServiceCatalogVisual = {
  icon: LucideIcon;
  iconName: AppointmentTypeIconName;
  colorHex: string;
  glowVariant: ServiceCatalogGlowVariant;
};

/** Infer icon from service name when DB icon is unset. */
function inferIconName(
  service: Pick<ServiceCatalogRow, "name" | "is_telehealth" | "source">
): AppointmentTypeIconName {
  if (service.is_telehealth) return "video";
  const n = service.name.trim().toLowerCase();
  if (n.includes("telehealth") || n.includes("video call")) return "video";
  if (n.includes("follow-up") || n.includes("follow up")) return "clock";
  if (n.includes("annual") || n.includes("check-up") || n.includes("checkup")) return "heart";
  if (n.includes("physio") || n.includes("therapy") || n.includes("rehab")) return "bone";
  if (n.includes("report") || n.includes("test") || n.includes("result")) return "file-text";
  if (n.includes("consult")) return "stethoscope";
  if (n.includes("initial")) return "stethoscope";
  if (service.source === "additional") return "sparkles";
  return "layers";
}

/** Default brand hex per inferred icon — matches seeded global palette. */
const ICON_DEFAULT_HEX: Record<AppointmentTypeIconName, string> = {
  stethoscope: "#6366f1",
  clock: "#10b981",
  video: "#0ea5e9",
  heart: "#f59e0b",
  bone: "#14b8a6",
  "file-text": "#8b5cf6",
  "message-circle": "#3b82f6",
  activity: "#ec4899",
  sparkles: "#a855f7",
  layers: "#64748b",
};

function glowVariantFromHex(hex: string): ServiceCatalogGlowVariant {
  const h = hex.replace("#", "");
  if (h.length === 3) {
    const r = parseInt(h[0]! + h[0], 16);
    const g = parseInt(h[1]! + h[1], 16);
    const b = parseInt(h[2]! + h[2], 16);
    return glowVariantFromRgb(r, g, b);
  }
  if (h.length >= 6) {
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return glowVariantFromRgb(r, g, b);
  }
  return "indigo";
}

function glowVariantFromRgb(r: number, g: number, b: number): ServiceCatalogGlowVariant {
  if (g > r + 30 && g > b) return "emerald";
  if (b > r + 20 && g > r) return "sky";
  if (r > 200 && g > 150 && b < 120) return "amber";
  if (r > 180 && b > 150) return "rose";
  if (g > 120 && b > 120 && r < 100) return "teal";
  if (b > 160 && r > 100) return "violet";
  if (r < 90 && g < 90 && b < 90) return "slate";
  return "indigo";
}

/** Resolve icon + color + glow for `/services` catalog cards. */
export function resolveServiceCatalogVisual(
  service: Pick<
    ServiceCatalogRow,
    "name" | "is_telehealth" | "source" | "icon" | "color"
  >
): ServiceCatalogVisual {
  const iconName = service.icon?.trim()
    ? normalizeAppointmentTypeIcon(service.icon)
    : inferIconName(service);

  const colorHex = service.color?.trim()
    ? appointmentTypeBrandColorFill(service.color)
    : ICON_DEFAULT_HEX[iconName];

  return {
    icon: resolveAppointmentTypeLucideIcon(iconName),
    iconName,
    colorHex,
    glowVariant: glowVariantFromHex(colorHex),
  };
}
