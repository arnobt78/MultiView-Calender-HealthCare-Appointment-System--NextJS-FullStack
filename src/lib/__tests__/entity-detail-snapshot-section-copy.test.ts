import { describe, expect, it } from "vitest";
import { entityDetailOwnedSnapshotSectionTitle } from "@/lib/entity-detail-snapshot-section-copy";

describe("entityDetailOwnedSnapshotSectionTitle", () => {
  it("formats patient related appointments", () => {
    expect(
      entityDetailOwnedSnapshotSectionTitle("Demo Patient", "relatedAppointments", "patient")
    ).toBe("Demo Patient's Related Appointments");
  });

  it("formats patient related invoices via appointments", () => {
    expect(
      entityDetailOwnedSnapshotSectionTitle(
        "Demo Patient",
        "relatedInvoicesViaAppointments",
        "patient"
      )
    ).toBe("Demo Patient's Related Invoices (Via Appointments)");
  });

  it("formats category related appointments", () => {
    expect(
      entityDetailOwnedSnapshotSectionTitle(
        "Pediatrics & Adolescent Care",
        "relatedAppointments",
        "category"
      )
    ).toBe("Pediatrics & Adolescent Care's Related Appointments");
  });

  it("formats doctor assigned patients", () => {
    expect(
      entityDetailOwnedSnapshotSectionTitle("Dr. Smith", "assignedPatients", "doctor")
    ).toBe("Dr. Smith's Assigned Patients");
  });

  it("falls back to entity kind when name is blank or placeholder", () => {
    expect(entityDetailOwnedSnapshotSectionTitle("—", "relatedAppointments", "patient")).toBe(
      "Patient's Related Appointments"
    );
    expect(entityDetailOwnedSnapshotSectionTitle("", "relatedAppointments", "category")).toBe(
      "Category's Related Appointments"
    );
  });
});
