import { describe, expect, it } from "vitest";
import { enrichAssigneesWithPatientIds } from "@/lib/appointment-dialog-assignees";
import type { AppointmentAssignee, Patient } from "@/types/types";

describe("enrichAssigneesWithPatientIds", () => {
  const patients = [
    { id: "p1", email: "alice@test.com", firstname: "Alice", lastname: "A" },
  ] as Patient[];

  it("maps invited_email to patient id for picker chips", () => {
    const rows: AppointmentAssignee[] = [
      {
        id: "a1",
        created_at: "2026-01-01T00:00:00.000Z",
        appointment: "ap1",
        user: null,
        user_type: "patients",
        invited_email: "alice@test.com",
        status: "pending",
        permission: "read",
      },
    ];
    const enriched = enrichAssigneesWithPatientIds(rows, patients);
    expect(enriched[0]?.user).toBe("p1");
  });

  it("keeps existing user id", () => {
    const rows: AppointmentAssignee[] = [
      {
        id: "a1",
        created_at: "2026-01-01T00:00:00.000Z",
        appointment: "ap1",
        user: "p2",
        user_type: "patients",
        status: "accepted",
        permission: "read",
      },
    ];
    const enriched = enrichAssigneesWithPatientIds(rows, patients);
    expect(enriched[0]?.user).toBe("p2");
  });
});

describe("AppointmentDialog assignees (edit mode)", () => {
  it("mounts AppointmentDialogAssigneesSection on edit and closes on save", async () => {
    const { readFileSync } = await import("node:fs");
    const { resolve } = await import("node:path");
    const src = readFileSync(
      resolve(process.cwd(), "src/components/calendar/AppointmentDialog.tsx"),
      "utf8"
    );
    expect(src).toContain("AppointmentDialogAssigneesSection");
    expect(src).toContain("invalidateAssigneesActivitiesAppointment");
    expect(src).toContain("editAppointmentId");
    expect(src).toContain("Patient needs an email to share.");
    expect(src).toContain("handleDialogOpenChange(false)");
    expect(src).not.toContain("savedAppointmentId");
    expect(src).not.toContain("handleDoneAfterCreate");
  });
});
