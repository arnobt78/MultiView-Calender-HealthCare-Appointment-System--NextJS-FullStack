import { describe, expect, it } from "vitest";
import { dedupeAssignees } from "@/lib/appointment-assignees";
import {
  deriveCardDensity,
  resolvePatientDisplayName,
  statusTextClass,
} from "@/lib/appointment-card";
import type { AppointmentAssignee, Patient } from "@/types/types";

describe("dedupeAssignees", () => {
  it("keeps one row per user|email and prefers accepted + full", () => {
    const rows = [
      {
        id: "1",
        appointment: "a1",
        user: "u1",
        invited_email: "",
        status: "pending" as const,
        permission: "read" as const,
      },
      {
        id: "2",
        appointment: "a1",
        user: "u1",
        invited_email: "",
        status: "accepted" as const,
        permission: "full" as const,
      },
    ] as AppointmentAssignee[];
    const out = dedupeAssignees(rows, "a1");
    expect(out).toHaveLength(1);
    expect(out[0].permission).toBe("full");
    expect(out[0].status).toBe("accepted");
  });
});

describe("deriveCardDensity", () => {
  it("list and month-panel are always full", () => {
    expect(deriveCardDensity({ variant: "list" })).toBe("full");
    expect(deriveCardDensity({ variant: "month-panel" })).toBe("full");
    expect(deriveCardDensity({ variant: "popover" })).toBe("full");
  });

  it("uses slot height for compact grid blocks", () => {
    expect(deriveCardDensity({ variant: "compact", slotHeightPx: 35 })).toBe("minimal");
    expect(deriveCardDensity({ variant: "compact", slotHeightPx: 50 })).toBe("compact");
    expect(deriveCardDensity({ variant: "compact", slotHeightPx: 80 })).toBe("compact");
  });
});

describe("resolvePatientDisplayName", () => {
  const patients: Patient[] = [
    {
      id: "p1",
      firstname: "Demo",
      lastname: "Patient",
      email: "p@test.com",
    } as Patient,
  ];

  it("resolves from patient id", () => {
    expect(
      resolvePatientDisplayName({ patient: "p1", patient_data: undefined }, patients)
    ).toBe("Demo Patient");
  });
});

describe("statusTextClass", () => {
  it("maps status colors", () => {
    expect(statusTextClass("done")).toContain("green");
    expect(statusTextClass("alert")).toContain("red");
    expect(statusTextClass("pending")).toContain("amber");
  });
});
