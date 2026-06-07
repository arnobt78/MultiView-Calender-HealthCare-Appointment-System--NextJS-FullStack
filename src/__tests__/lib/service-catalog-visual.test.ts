import { describe, expect, it } from "vitest";
import {
  normalizeAppointmentTypeIcon,
  resolveAppointmentTypeLucideIcon,
  appointmentTypeBrandColorFill,
} from "@/lib/appointment-type-icon-options";
import { resolveServiceCatalogVisual } from "@/lib/service-catalog-visual";

describe("appointmentTypeBrandColorFill", () => {
  it("returns valid hex or indigo fallback", () => {
    expect(appointmentTypeBrandColorFill("#0ea5e9")).toBe("#0ea5e9");
    expect(appointmentTypeBrandColorFill("bad")).toBe("#6366f1");
    expect(appointmentTypeBrandColorFill(null)).toBe("#6366f1");
  });
});

describe("normalizeAppointmentTypeIcon", () => {
  it("maps known icons and falls back to stethoscope", () => {
    expect(normalizeAppointmentTypeIcon("video")).toBe("video");
    expect(normalizeAppointmentTypeIcon(" VIDEO ")).toBe("video");
    expect(normalizeAppointmentTypeIcon("unknown")).toBe("stethoscope");
  });
});

describe("resolveServiceCatalogVisual", () => {
  it("uses DB icon and color when present", () => {
    const visual = resolveServiceCatalogVisual({
      name: "Custom",
      is_telehealth: false,
      source: "global",
      icon: "heart",
      color: "#f59e0b",
    });
    expect(visual.iconName).toBe("heart");
    expect(visual.colorHex).toBe("#f59e0b");
    expect(visual.glowVariant).toBe("amber");
    expect(resolveAppointmentTypeLucideIcon(visual.iconName)).toBe(visual.icon);
  });

  it("infers telehealth video + sky glow", () => {
    const visual = resolveServiceCatalogVisual({
      name: "Telehealth Session",
      is_telehealth: true,
      source: "global",
      icon: null,
      color: null,
    });
    expect(visual.iconName).toBe("video");
    expect(visual.glowVariant).toBe("sky");
  });

  it("infers physio bone + teal glow", () => {
    const visual = resolveServiceCatalogVisual({
      name: "Physio Therapy",
      is_telehealth: false,
      source: "additional",
      icon: null,
      color: null,
    });
    expect(visual.iconName).toBe("bone");
    expect(visual.colorHex).toBe("#14b8a6");
    expect(visual.glowVariant).toBe("emerald");
  });

  it("infers report file-text", () => {
    const visual = resolveServiceCatalogVisual({
      name: "Test Report Show",
      is_telehealth: false,
      source: "additional",
      icon: null,
      color: null,
    });
    expect(visual.iconName).toBe("file-text");
  });
});
