import { describe, expect, it } from "vitest";
import {
  portalAppointmentToFullAppointment,
  portalOwnerDisplayLabel,
  portalTreatingDisplayLabel,
} from "@/lib/portal-appointment";
import { mapPortalAppointmentsFromRows } from "@/lib/serializers";
import { portalDoctorProfileHref } from "@/lib/entity-routes";

describe("mapPortalAppointmentsFromRows", () => {
  it("keeps category UUID and adds category_data with id", () => {
    const rows = mapPortalAppointmentsFromRows([
      {
        id: "a1",
        created_at: new Date(),
        updated_at: null,
        start: new Date(),
        end: new Date(),
        location: null,
        patient_id: "p1",
        category_id: "cat-1",
        notes: null,
        title: "Test",
        status: "pending",
        owner_id: "u1",
        category: { id: "cat-1", label: "Test", color: "#6366f1" },
        owner: {
          id: "u1",
          display_name: "Demo Doctor",
          email: "doc@test.com",
          role: "doctor",
        },
      },
    ]);
    expect(rows[0].category).toBe("cat-1");
    expect(rows[0].category_data?.id).toBe("cat-1");
    expect(rows[0].category_data?.label).toBe("Test");
    expect(rows[0].owner?.id).toBe("u1");
    expect(rows[0].owner?.role).toBe("doctor");
  });
});

describe("portalAppointmentToFullAppointment", () => {
  it("maps portal row to FullAppointment with category_data", () => {
    const row = mapPortalAppointmentsFromRows([
      {
        id: "a1",
        created_at: new Date(),
        updated_at: null,
        start: new Date(),
        end: new Date(),
        location: "Berlin",
        patient_id: "p1",
        category_id: null,
        notes: null,
        title: "Visit",
        status: "pending",
        owner_id: "u1",
        owner: {
          id: "u1",
          display_name: "Owner",
          email: "o@test.com",
          role: "doctor",
        },
      },
    ])[0];
    const full = portalAppointmentToFullAppointment(row);
    expect(full.id).toBe("a1");
    expect(full.appointment_assignee).toEqual([]);
  });
});

describe("portal display labels", () => {
  it("prefers display_name over email", () => {
    expect(
      portalOwnerDisplayLabel({
        id: "u1",
        display_name: "Demo Doctor",
        email: "d@test.com",
        role: "doctor",
      })
    ).toBe("Demo Doctor");
  });
});

describe("portalDoctorProfileHref", () => {
  it("returns /doctors for patient viewer when staff is doctor", () => {
    expect(portalDoctorProfileHref("patient", "u1", "doctor")).toBe("/doctors/u1");
  });

  it("returns null for admin staff on patient portal", () => {
    expect(portalDoctorProfileHref("patient", "u1", "admin")).toBeNull();
  });
});

describe("portalTreatingDisplayLabel", () => {
  it("falls back to email", () => {
    expect(
      portalTreatingDisplayLabel({
        id: "u2",
        display_name: null,
        email: "t2@test.com",
        role: "doctor",
      })
    ).toBe("t2@test.com");
  });
});
