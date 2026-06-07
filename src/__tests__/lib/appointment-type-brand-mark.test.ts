import { describe, expect, it } from "vitest";
import {
  appointmentTypeBrandMarkStyles,
  appointmentTypeIconOptionLabel,
  parseAppointmentTypeHexRgb,
} from "@/lib/appointment-type-icon-options";
import { serviceCatalogSelectOptionLabel } from "@/lib/service-catalog-select-labels";
import type { ServiceCatalogRow } from "@/lib/appointment-service-catalog";

describe("parseAppointmentTypeHexRgb", () => {
  it("parses 3- and 6-digit hex", () => {
    expect(parseAppointmentTypeHexRgb("#0ea5e9")).toEqual({ r: 14, g: 165, b: 233 });
    expect(parseAppointmentTypeHexRgb("#f59")).toEqual({ r: 255, g: 85, b: 153 });
  });
});

describe("appointmentTypeBrandMarkStyles", () => {
  it("returns light tint shell and full icon color", () => {
    const styles = appointmentTypeBrandMarkStyles("#0ea5e9");
    expect(styles.iconColor).toBe("#0ea5e9");
    expect(styles.containerStyle.backgroundColor).toBe("rgba(14, 165, 233, 0.12)");
    expect(styles.containerStyle.borderColor).toBe("rgba(14, 165, 233, 0.35)");
  });
});

describe("appointmentTypeIconOptionLabel", () => {
  it("maps icon slug to human label", () => {
    expect(appointmentTypeIconOptionLabel("video")).toBe("Telehealth");
  });
});

describe("serviceCatalogSelectOptionLabel", () => {
  it("includes category, name, and duration", () => {
    const row: ServiceCatalogRow = {
      id: "g1",
      name: "Telehealth Session",
      description: null,
      duration_minutes: 20,
      buffer_before_minutes: 0,
      buffer_after_minutes: 0,
      slot_interval_minutes: 30,
      is_telehealth: true,
      price_cents: 8500,
      icon: "video",
      color: "#0ea5e9",
      source: "global",
    };
    expect(serviceCatalogSelectOptionLabel(row)).toBe(
      "Telehealth · Telehealth Session · 20 Min"
    );
  });
});
