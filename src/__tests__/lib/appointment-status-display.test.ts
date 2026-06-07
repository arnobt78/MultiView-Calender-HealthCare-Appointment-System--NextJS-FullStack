import { describe, expect, it } from "vitest";
import {
  normalizeAppointmentStatus,
  resolveAppointmentStatusMeta,
  isTerminalAppointmentStatus,
} from "@/lib/appointment-status-display";

describe("normalizeAppointmentStatus", () => {
  it("maps known values and defaults unknown to pending", () => {
    expect(normalizeAppointmentStatus("done")).toBe("done");
    expect(normalizeAppointmentStatus("CANCELLED")).toBe("cancelled");
    expect(normalizeAppointmentStatus(null)).toBe("pending");
    expect(normalizeAppointmentStatus("weird")).toBe("pending");
  });
});

describe("resolveAppointmentStatusMeta", () => {
  it("returns glass class and label for cancelled", () => {
    const meta = resolveAppointmentStatusMeta("cancelled");
    expect(meta.label).toBe("Cancelled");
    expect(meta.glassClass).toBe("calendar-glass-badge-slate");
  });
});

describe("isTerminalAppointmentStatus", () => {
  it("treats done and cancelled as terminal", () => {
    expect(isTerminalAppointmentStatus("done")).toBe(true);
    expect(isTerminalAppointmentStatus("cancelled")).toBe(true);
    expect(isTerminalAppointmentStatus("pending")).toBe(false);
  });
});
